import os
import subprocess
import tempfile
from openai import OpenAI

class VideoProcessor:
    def __init__(self, fonts_dir):
        # Ensure absolute path for fonts to avoid FFmpeg errors
        self.fonts_dir = os.path.abspath(fonts_dir)
        # Assumes OPENAI_API_KEY is set in environment variables
        self.client = OpenAI()

    # --- PART 1: GENERATE CAPTIONS (For Editor) ---
    async def generate_captions_only(self, input_p, target_language="English"):
        print(f"Processing: {input_p} -> Target: {target_language}")
        try:
            # 1. Extract Audio
            audio_p = tempfile.mktemp(suffix=".mp3")
            subprocess.run(["ffmpeg", "-y", "-i", input_p, "-vn", "-ar", "16000", "-ac", "1", audio_p], check=True)

            # 2. Transcribe (Whisper) - Get Original Text & Real Timestamps
            # We use standard transcription (no 'task' param) to get accurate timing for the original speech
            with open(audio_p, "rb") as f:
                transcript = self.client.audio.transcriptions.create(
                    model="whisper-1", 
                    file=f, 
                    response_format="verbose_json"
                )

            # 3. Translate (GPT-4o) - Maintain Real Timestamps
            final_captions = []

            for seg in transcript.segments:
                original_text = getattr(seg, 'text', '').strip()
                start = getattr(seg, 'start', 0.0)
                end = getattr(seg, 'end', 0.0)

                if not original_text: continue

                # GPT-4o Translation Logic
                try:
                    res = self.client.chat.completions.create(
                        model="gpt-4o",
                        messages=[
                            {
                                "role": "system", 
                                "content": (
                                    f"You are a professional subtitle translator. "
                                    f"Translate the following text to {target_language}. "
                                    "Keep it short, natural, and conversational. "
                                    "Do not add quotes or explanations."
                                )
                            },
                            {"role": "user", "content": original_text}
                        ]
                    )
                    translated_text = res.choices[0].message.content.strip()
                except Exception as e:
                    print(f"GPT Translation Error: {e}")
                    translated_text = original_text # Fallback to original text

                final_captions.append({
                    "id": str(getattr(seg, 'id', 0)),
                    "text": translated_text,
                    "start_time": start,
                    "end_time": end
                })

            # Clean up audio file
            if os.path.exists(audio_p):
                os.remove(audio_p)

            return {"success": True, "captions": final_captions}

        except Exception as e:
            print(f"Generation Error: {e}")
            return {"success": False, "error": str(e)}

    # --- PART 2: BURN VIDEO (For Export) ---
    async def burn_only(self, input_p, output_p, captions, style):
        print(f"🎨 BURNING STYLES: {style}")
        try:
            # Create the ASS file with Brute Force Inline Styles
            ass_path = self._create_inline_ass(captions, style)

            # FFmpeg command to burn subtitles
            # We use the 'ass' filter which renders the subtitles onto the video
            cmd = [
                "ffmpeg", "-y", "-i", input_p,
                "-vf", f"ass={ass_path}:fontsdir={self.fonts_dir}", 
                "-c:v", "libx264", "-preset", "ultrafast", "-c:a", "aac",
                output_p
            ]

            print(f"🚀 Running FFmpeg...")
            subprocess.run(cmd, check=True)

            # Clean up ASS file
            if os.path.exists(ass_path):
                os.remove(ass_path)

            return {"success": True}

        except Exception as e:
            print(f"Export Error: {e}")
            return {"success": False, "error": str(e)}

    # --- HELPERS ---
    def _hex_to_ass(self, hex_c, alpha=1.0):
        # Converts Hex #RRGGBB -> ASS &H00BBGGRR
        if not hex_c: return "&H00FFFFFF"
        hex_c = hex_c.lstrip('#')
        if len(hex_c) != 6: return "&H00FFFFFF"
        r, g, b = hex_c[:2], hex_c[2:4], hex_c[4:]
        a_val = int(255 - (alpha * 255))
        return f"&H{a_val:02X}{b}{g}{r}"

    def _fmt(self, s):
        h, m, sec = int(s//3600), int((s%3600)//60), s%60
        return f"{h}:{m:02d}:{sec:05.2f}"

    def _create_inline_ass(self, captions, style):
        ass_path = tempfile.mktemp(suffix=".ass")

        # 1. Extract Styles
        # Use 'Arial' as a safe default if specific font fails
        font_family = style.get('font_family', 'Arial') 
        # Double font size for high-res video (1080p)
        font_size = int(style.get('font_size', 24)) * 2 

        text_color = self._hex_to_ass(style.get('text_color', '#FFFFFF'))

        has_bg = style.get('has_background', False)
        bg_opacity = float(style.get('background_opacity', 0.7))
        bg_hex = style.get('highlight_color', '#000000') or '#000000'
        bg_color = self._hex_to_ass(bg_hex, bg_opacity)

        # Position (MarginV from bottom)
        pos_y = float(style.get('position_y', 20))
        margin_v = int((100 - pos_y) * 8) + 20

        # 2. Construct "Brute Force" Style Tags
        # \fn = Font Name
        # \fs = Font Size
        # \1c = Primary Text Color
        # \bord3 = Opaque Box Mode (Crucial for background boxes)
        # \3c = Border/Box Color
        # \shad0 = No Shadow

        if has_bg:
            # Force Box
            style_tags = f"\\fn{font_family}\\fs{font_size}\\1c{text_color}\\bord3\\3c{bg_color}\\shad0"
        else:
            # Force Outline (Normal Text)
            style_tags = f"\\fn{font_family}\\fs{font_size}\\1c{text_color}\\bord2\\3c&H80000000\\shad1"

        # Animation (Pop Effect)
        if style.get('has_animation', False):
            style_tags += r"\fscx80\fscy80\t(0,150,\fscx100\fscy100)"

        # 3. Write ASS File
        # We use a minimal header because we override everything inline
        with open(ass_path, "w", encoding="utf-8") as f:
            f.write(f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, Alignment, MarginV
Style: Default,Arial,20,&H00FFFFFF,2,10
[Events]
Format: Layer, Start, End, Style, Text
""")
            for c in captions:
                start = self._fmt(float(c['start_time']))
                end = self._fmt(float(c['end_time']))
                text = c['text'].replace('\n', ' ')

                # Inject styles directly into the dialogue line
                # \\pos(540, Y) centers text at the correct vertical position for 1080p width
                line = f"Dialogue: 0,{start},{end},Default,{{ {style_tags} \\pos(540,{1920 - margin_v}) }}{text}\n"
                f.write(line)

        return ass_path