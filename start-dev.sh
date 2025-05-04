#!/bin/bash
# start-dev.sh - Development script to start both frontend and backend

# Start backend
cd backend
echo "Starting backend server..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend 
cd ../frontend
echo "Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

# Function to handle script interruption
function cleanup {
  echo "Stopping services..."
  kill $BACKEND_PID
  kill $FRONTEND_PID
  exit 0
}

# Register the cleanup function for Ctrl+C
trap cleanup INT TERM

# Keep the script running
echo "Development environment is running!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop all services."

# Wait indefinitely
wait 