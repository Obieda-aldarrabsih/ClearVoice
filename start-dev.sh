#!/usr/bin/env bash
set -e

echo "Starting ClearVoice Local Development Environment..."

# 0. Check for Docker
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed or not in your PATH."
    echo "Please install Docker, ensure it is running, and try again."
    exit 1
fi

# 1. Start Database
echo "Starting PostgreSQL database container..."
docker compose up -d db

echo "Waiting for database to be ready..."
sleep 5

# 2. Start Backend API
echo "Starting Backend API (ClearVoice.Api) on port 5242..."
(cd src/ClearVoice.Api && dotnet run) &
API_PID=$!

# 3. Start Background Worker
echo "Starting Background Worker (ClearVoice.Workers)..."
(cd src/ClearVoice.Workers && dotnet run) &
WORKER_PID=$!

# Cleanup on exit
trap "kill $API_PID $WORKER_PID 2>/dev/null || true" EXIT

# 4. Start Frontend
echo "Starting Frontend (Vite) on port 5173..."
(cd frontend && npm install && npm run dev)
