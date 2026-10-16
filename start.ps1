# Budget Coach — Unified Startup Script
Write-Host "=== Starting Budget Coach (Unified Next.js) ===" -ForegroundColor Cyan

# Install dependencies if node_modules is missing
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "`nStarting Next.js server on http://localhost:3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PWD'; npm run dev"

Write-Host "`nOpening browser in 3 seconds..." -ForegroundColor Gray
Start-Sleep 3
Start-Process "http://localhost:3000"
