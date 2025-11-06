#!/bin/bash

echo "🚀 Starting Nutri Plan Plus..."
echo ""

# Start backend in background
echo "📡 Starting backend server on port 3001..."
cd server && npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Seed database if empty
echo "🌱 Checking database..."
curl -X POST http://localhost:3001/api/seed 2>/dev/null

cd ..

# Start frontend
echo ""
echo "🎨 Starting frontend on port 3000..."
npm run dev -- --port 3000

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT


