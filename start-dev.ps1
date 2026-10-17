Write-Host "Starting ClearVoice Local Development Environment..." -ForegroundColor Cyan

# 0. Check for Docker
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker is not installed or not in your PATH." -ForegroundColor Red
    Write-Host "Please install Docker Desktop for Windows, ensure it is running, and try again." -ForegroundColor Red
    exit 1
}

# 1. Start Database
Write-Host "Starting PostgreSQL database container..." -ForegroundColor Yellow
docker compose up -d

Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Cleanup any existing background jobs from previous runs
Write-Host "Cleaning up previous background jobs..." -ForegroundColor DarkGray
Get-Job -Name "ClearVoiceApi", "ClearVoiceWorker" -ErrorAction SilentlyContinue | Stop-Job -PassThru | Remove-Job

# 2. Start Backend API
Write-Host "Starting Backend API (ClearVoice.Api) on port 5242..." -ForegroundColor Yellow
$apiJob = Start-Job -Name "ClearVoiceApi" -ScriptBlock {
    Set-Location -Path "$using:PWD\src\ClearVoice.Api"
    dotnet run
}

# 3. Start Background Worker
Write-Host "Starting Background Worker (ClearVoice.Workers)..." -ForegroundColor Yellow
$workerJob = Start-Job -Name "ClearVoiceWorker" -ScriptBlock {
    Set-Location -Path "$using:PWD\src\ClearVoice.Workers"
    dotnet run
}

# Wait a moment for backend to initialize and run EF migrations
Start-Sleep -Seconds 5

# 4. Start Frontend
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location -Path "frontend"
npm install

Write-Host "Starting Frontend (Vite) on port 5173..." -ForegroundColor Green
Write-Host "Press Ctrl+C in this window to stop the frontend. To stop the backend jobs later, run 'Stop-Job -Name ClearVoiceApi, ClearVoiceWorker' or close PowerShell." -ForegroundColor DarkGray
npm run dev
