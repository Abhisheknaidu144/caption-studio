#!/bin/bash

echo "🚀 Starting Video Captioning SaaS..."
echo ""

# Check if Python backend dependencies are installed
echo "📦 Checking Python dependencies..."
cd backend
if [ ! -d "../venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv ../venv
    source ../venv/bin/activate
    pip install -r requirements.txt
else
    source ../venv/bin/activate
fi
cd ..

# Check if FFmpeg is installed
echo "🎬 Checking FFmpeg installation..."
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  WARNING: FFmpeg is not installed!"
    echo "Please install FFmpeg to process videos."
    echo "On Replit, FFmpeg should be pre-installed."
else
    echo "✅ FFmpeg is installed: $(ffmpeg -version | head -1)"
fi

# Check if font directory exists
echo "🔤 Checking font directory..."
if [ ! -d "backend/flat_fonts" ]; then
    echo "Creating font directory..."
    mkdir -p backend/flat_fonts
    echo "⚠️  Please add TrueType (.ttf) font files to backend/flat_fonts/"
fi

# Check environment variables
echo "🔐 Checking environment variables..."
if [ ! -f ".env" ]; then
    echo "⚠️  WARNING: .env file not found!"
    echo "Please create .env file with required variables."
else
    echo "✅ .env file found"
fi

# Start backend in background
echo ""
echo "🐍 Starting FastAPI backend on port 8000..."
cd backend
python main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend is running (PID: $BACKEND_PID)"
else
    echo "❌ Backend failed to start!"
    exit 1
fi

echo ""
echo "📊 Backend API: http://localhost:8000"
echo "📊 Health Check: http://localhost:8000/api/health"
echo ""
echo "Frontend will start on port 5173"
echo "Access your app at: http://localhost:5173"
echo ""
echo "To stop the backend, run: kill $BACKEND_PID"
echo ""
echo "✨ Ready to go! Upload a video and create captions!"
