# Run Doc — Skill+ Frontend + Backend

## How to reproduce the artifacts

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and set `GITHUB_TOKEN` (optional but recommended)
4. Backend uses `httpx` to call GitHub API directly (no separate GitAnalyze package needed)

### Frontend
1. `cd frontend`
2. `npm install`
3. `.env` is pre-configured with `VITE_USE_MOCK=false` for API mode

## How to run the servers

### Backend (port 8000)
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend (port 5173)
```bash
cd frontend
npm run dev
```

Vite proxies `/api` → `http://localhost:8000` automatically.

## Data flow
1. User enters GitHub username on Welcome page
2. Frontend calls `POST /api/github/analyze` via Vite proxy
3. FastAPI receives username, calls GitHub API via `httpx`
4. Returns canonical analysis report (score, repos, languages, skills, gaps)
5. Frontend stores in AnalysisContext → all dashboard sections display real data

## Switching modes
- `VITE_USE_MOCK=false` → API mode (requires backend running)
- `VITE_USE_MOCK=true` → Mock mode (no backend needed)
