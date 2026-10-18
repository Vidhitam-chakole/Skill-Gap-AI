@echo off
echo ===================================================
echo Starting SkillGap AI (Host: 0.0.0.0)
echo ===================================================
echo Backend:  http://localhost:8000 (LAN: http://192.168.26.211:8000/api/health)
echo Frontend: http://localhost:5173 (LAN: http://192.168.26.211:5173)
echo ===================================================

start "SkillGap AI - Backend" cmd /k "cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
start "SkillGap AI - Frontend" cmd /k "cd frontend && npm run dev -- --host 0.0.0.0"

echo Both servers launched in background windows.
