# Budget Coach — Start Script
# Run this from the "Budget Coach" project root

Write-Host "=== Budget Coach Startup ===" -ForegroundColor Cyan

# 1. Backend
Write-Host "`n[1/2] Starting FastAPI backend..." -ForegroundColor Yellow
Set-Location backend

if (-not (Test-Path ".venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Gray
    python -m venv .venv
}

.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt -q

# Check for API key
$envContent = Get-Content .env -Raw
if ($envContent -match "YOUR_GEMINI_API_KEY_HERE") {
    Write-Host "`n⚠️  IMPORTANT: Please set your Gemini API key in backend/.env" -ForegroundColor Red
    Write-Host "   Get a free key at: https://aistudio.google.com/app/apikey" -ForegroundColor Yellow
    Write-Host "   Then replace: GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE" -ForegroundColor Yellow
    Read-Host "`nPress Enter after setting the API key to continue..."
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PWD'; .\.venv\Scripts\Activate.ps1; uvicorn main:app --reload --port 8000"
Set-Location ..

# 2. Frontend
Write-Host "`n[2/2] Starting Next.js frontend..." -ForegroundColor Yellow
Set-Location frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PWD'; npm run dev"
Set-Location ..

Write-Host "`n✅ Both servers are starting!" -ForegroundColor Green
Write-Host "   Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nOpening browser in 5 seconds..." -ForegroundColor Gray
Start-Sleep 5
Start-Process "http://localhost:3000"
