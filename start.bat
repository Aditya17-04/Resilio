@echo off
echo.
echo  ==========================================
echo   Resilio Supply Chain Analyzer - Launcher
echo  ==========================================
echo.
echo  Starting Backend (FastAPI) on port 8001...
start "Resilio Backend" cmd /k "cd /d c:\BlueBit\BlueBit\backend && .\venv\Scripts\activate && uvicorn main:app --reload --port 8001"
timeout /t 3 >nul
echo  Starting Frontend (React) on port 5170...
start "Resilio Frontend" cmd /k "cd /d c:\BlueBit\BlueBit\frontend && npm run dev"
echo.
echo  Both servers starting in separate windows.
echo.
echo    Dashboard : http://localhost:5170
echo    API Docs  : http://localhost:8001/docs
echo    Backend   : http://localhost:8001
echo.
echo  Open http://localhost:5170 in your browser once both windows say Ready.
echo.
pause
