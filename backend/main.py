from fastapi import FastAPI, UploadFile, File, HTTPException, Header
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from supabase import create_client, Client
import razorpay
import shutil
import os
import uuid
import hmac
import hashlib
from typing import List, Dict, Any, Optional
from processor import VideoProcessor
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "backend/uploads"
EXPORT_DIR = "backend/exports"
FONTS_DIR = "backend/flat_fonts"

for d in [UPLOAD_DIR, EXPORT_DIR, FONTS_DIR]:
    os.makedirs(d, exist_ok=True)

processor = VideoProcessor(FONTS_DIR)

supabase_url = os.getenv("VITE_SUPABASE_URL")
supabase_key = os.getenv("VITE_SUPABASE_ANON_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

razorpay_key_id = os.getenv("VITE_RAZORPAY_KEY_ID")
razorpay_key_secret = os.getenv("RAZORPAY_KEY_SECRET")
razorpay_client = razorpay.Client(auth=(razorpay_key_id, razorpay_key_secret))

class CaptionItem(BaseModel):
    id: Any
    text: str
    start_time: float
    end_time: float

class ProcessRequest(BaseModel):
    file_id: str
    language: str = "English"
    user_id: Optional[str] = None

class ExportRequest(BaseModel):
    file_id: str
    captions: List[CaptionItem]
    style: Dict[str, Any] = {}
    user_id: str
    export_quality: str = "1080p"

class PaymentVerifyRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
    user_id: str
    plan_type: str
    amount: float

class CreateOrderRequest(BaseModel):
    amount: float
    plan_type: str
    user_id: str

def get_user_credits(user_id: str) -> int:
    try:
        response = supabase.table("user_profiles").select("credits_remaining").eq("id", user_id).single().execute()
        if response.data:
            return response.data.get("credits_remaining", 0)
        return 0
    except Exception as e:
        print(f"Error fetching user credits: {e}")
        return 0

def deduct_credits(user_id: str, credits_to_deduct: int) -> bool:
    try:
        current_credits = get_user_credits(user_id)
        if current_credits < credits_to_deduct:
            return False

        new_credits = current_credits - credits_to_deduct
        supabase.table("user_profiles").update({"credits_remaining": new_credits}).eq("id", user_id).execute()
        return True
    except Exception as e:
        print(f"Error deducting credits: {e}")
        return False

def add_credits(user_id: str, credits_to_add: int) -> bool:
    try:
        current_credits = get_user_credits(user_id)
        new_credits = current_credits + credits_to_add

        supabase.table("user_profiles").update({
            "credits_remaining": new_credits,
            "total_credits_purchased": supabase.table("user_profiles").select("total_credits_purchased").eq("id", user_id).single().execute().data.get("total_credits_purchased", 0) + credits_to_add
        }).eq("id", user_id).execute()
        return True
    except Exception as e:
        print(f"Error adding credits: {e}")
        return False

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Backend is running"}

@app.get("/api/user/credits/{user_id}")
async def get_credits(user_id: str):
    try:
        credits = get_user_credits(user_id)
        response = supabase.table("user_profiles").select("subscription_plan").eq("id", user_id).single().execute()
        plan = response.data.get("subscription_plan", "free") if response.data else "free"

        return {
            "success": True,
            "credits": credits,
            "subscription_plan": plan
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/upload")
async def upload_video(file: UploadFile = File(...)):
    try:
        file_id = str(uuid.uuid4())
        file_ext = file.filename.split('.')[-1]
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}.{file_ext}")

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {
            "success": True,
            "file_id": file_id,
            "raw_url": f"/uploads/{file_id}.{file_ext}",
            "original_filename": file.filename
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/process")
async def process_video(req: ProcessRequest):
    input_path = None
    for f in os.listdir(UPLOAD_DIR):
        if f.startswith(req.file_id):
            input_path = os.path.join(UPLOAD_DIR, f)
            break

    if not input_path:
        return {"success": False, "error": "File not found"}

    return await processor.generate_captions_only(input_path, target_language=req.language)

@app.post("/api/export")
async def export_video(req: ExportRequest):
    print(f"📥 EXPORT REQUEST RECEIVED for user {req.user_id}")
    print(f"🎨 Style Data: {req.style}")

    is_regional_language = req.style.get("target_language", "English").lower() != "english"
    is_hd_export = req.export_quality in ["4k"]

    credits_needed = 1
    if is_regional_language:
        credits_needed = 1
    if is_hd_export:
        credits_needed += 1

    current_credits = get_user_credits(req.user_id)

    if current_credits < credits_needed:
        raise HTTPException(
            status_code=402,
            detail=f"Insufficient credits. You need {credits_needed} credits but have {current_credits}. Please purchase more credits."
        )

    input_path = None
    for f in os.listdir(UPLOAD_DIR):
        if f.startswith(req.file_id):
            input_path = os.path.join(UPLOAD_DIR, f)
            break

    if not input_path:
        raise HTTPException(status_code=404, detail="Original video not found")

    output_filename = f"export_{req.file_id}.mp4"
    output_path = os.path.join(EXPORT_DIR, output_filename)

    captions_data = [c.dict() for c in req.captions]

    try:
        supabase.table("video_exports").insert({
            "user_id": req.user_id,
            "file_id": req.file_id,
            "target_language": req.style.get("target_language", "English"),
            "caption_count": len(captions_data),
            "export_quality": req.export_quality,
            "export_status": "processing",
            "credits_used": credits_needed
        }).execute()
    except Exception as e:
        print(f"Error logging export: {e}")

    result = await processor.burn_only(input_path, output_path, captions_data, req.style)

    if not result['success']:
        try:
            supabase.table("video_exports").update({"export_status": "failed"}).eq("file_id", req.file_id).eq("user_id", req.user_id).execute()
        except:
            pass
        return {"success": False, "error": result.get('error')}

    success = deduct_credits(req.user_id, credits_needed)

    if not success:
        raise HTTPException(status_code=402, detail="Failed to deduct credits")

    try:
        supabase.table("video_exports").update({
            "export_status": "completed",
            "completed_at": "now()"
        }).eq("file_id", req.file_id).eq("user_id", req.user_id).execute()
    except Exception as e:
        print(f"Error updating export status: {e}")

    return {
        "success": True,
        "video_url": f"/exports/{output_filename}",
        "credits_used": credits_needed,
        "credits_remaining": get_user_credits(req.user_id)
    }

@app.post("/api/payment/create-order")
async def create_razorpay_order(req: CreateOrderRequest):
    try:
        amount_in_paise = int(req.amount * 100)

        order_data = {
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": f"order_{req.user_id}_{uuid.uuid4()}",
            "notes": {
                "user_id": req.user_id,
                "plan_type": req.plan_type
            }
        }

        order = razorpay_client.order.create(data=order_data)

        supabase.table("payment_transactions").insert({
            "user_id": req.user_id,
            "razorpay_order_id": order["id"],
            "amount": req.amount,
            "currency": "INR",
            "status": "pending",
            "plan_type": req.plan_type,
            "credits_added": 7 if req.plan_type == "weekly" else 30
        }).execute()

        return {
            "success": True,
            "order_id": order["id"],
            "amount": amount_in_paise,
            "currency": "INR",
            "key_id": razorpay_key_id
        }
    except Exception as e:
        print(f"Error creating Razorpay order: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/payment/verify")
async def verify_razorpay_payment(req: PaymentVerifyRequest):
    try:
        params_dict = {
            "razorpay_order_id": req.razorpay_order_id,
            "razorpay_payment_id": req.razorpay_payment_id,
            "razorpay_signature": req.razorpay_signature
        }

        razorpay_client.utility.verify_payment_signature(params_dict)

        credits_to_add = 7 if req.plan_type == "weekly" else 30

        add_credits(req.user_id, credits_to_add)

        supabase.table("payment_transactions").update({
            "razorpay_payment_id": req.razorpay_payment_id,
            "razorpay_signature": req.razorpay_signature,
            "status": "success"
        }).eq("razorpay_order_id", req.razorpay_order_id).execute()

        plan_name = "weekly" if req.plan_type == "weekly" else "monthly"
        supabase.table("user_profiles").update({
            "subscription_plan": plan_name
        }).eq("id", req.user_id).execute()

        return {
            "success": True,
            "message": "Payment verified successfully",
            "credits_added": credits_to_add,
            "new_balance": get_user_credits(req.user_id)
        }
    except razorpay.errors.SignatureVerificationError:
        supabase.table("payment_transactions").update({
            "status": "failed"
        }).eq("razorpay_order_id", req.razorpay_order_id).execute()

        raise HTTPException(status_code=400, detail="Invalid payment signature")
    except Exception as e:
        print(f"Error verifying payment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.mount("/exports", StaticFiles(directory=EXPORT_DIR), name="exports")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
