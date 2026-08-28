# PROGRESS — SkillGap AI (Skill plus)

**For any AI / developer:** Read this file first. It is the single source of truth for folder layout, architecture, APIs, UI contracts, conventions, and known issues. Do not explore the whole repo unless you need to edit a specific file listed here.

**Product name:** SkillGap AI  
**Workspace folder:** `Skill plus`  
**Status:** Product loop complete. Live API is the default. LinkedIn is heuristic (not a scrape). GitHub uses the real GitHub REST API. Chat is rule-based unless `OPENAI_API_KEY` is set and can use saved analysis IDs. Analyses, roadmaps, and chat persist as JSON under `backend/data/`. Combined 4-week roadmap is a first-class section.

---

## How to run

Backend (port **8000**):

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env         # optional GITHUB_TOKEN / OPENAI_API_KEY
uvicorn app.main:app --reload --port 8000
```

Frontend (port **5173**):

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` → `http://localhost:8000`.

---

## Folder structure (complete)

```
Skill plus/
├── PROGRESS.md                 ← THIS FILE. Read first.
├── README.md
├── .gitignore
├── backend/
│   ├── .env.example
│   ├── requirements.txt
│   └── app/
│       ├── __init__.py         (empty)
│       ├── main.py             FastAPI app + CORS + routers + /api/health
│       ├── config.py           Settings from env
│       ├── schemas.py          Pydantic request/response models
│       ├── routers/
│       │   ├── __init__.py
│       │   ├── linkedin.py     POST /analyze, GET /results/{id}
│       │   ├── github.py       POST /analyze, GET /results/{id}
│       │   └── chat.py         POST /message, GET /history/{id}
│       └── services/
│           ├── __init__.py
│           ├── store.py        In-memory dicts for analysis results
│           ├── linkedin_service.py   Heuristic analysis from profile URL
│           ├── github_service.py     Live GitHub API analysis
│           └── chat_service.py       Rule-based + optional OpenAI
└── frontend/
    ├── .env.example
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── vite.config.js          port 5173, proxy /api → :8000
    ├── public/
    │   ├── logo.png
    │   └── logo.svg
    └── src/
        ├── main.jsx
        ├── App.jsx / App.css
        ├── index.css           Design tokens + brutalist utilities
        ├── pages/Home.jsx
        ├── services/api.js     fetch wrappers
        ├── data/mockData.js    Mock LinkedIn / GitHub / chat
        ├── hooks/useAnimations.js
        └── components/
            ├── IntroAnimation/
            ├── Navbar/
            ├── Hero/
            ├── Marquee/
            ├── BentoGrid/
            ├── Decorative/     FloatingShapes, SectionHeader, Sticker
            ├── LinkedInAnalyzer/  + Analyzer.css (shared with GitHub)
            ├── GitHubAnalyzer/    uses Analyzer.css from LinkedIn folder
            ├── Roadmap/           4-week plan from saved analyses
            └── ChatBot/
        ├── context/AnalysisContext.jsx
```

No React Router. Single-page scroll sections: `home`, `linkedin`, `github`, `roadmap`, `chat`.

---

## Architecture

```
Browser (React 18 + Vite)
  App.jsx → IntroAnimation (once per session) → Navbar + Home
  Home: Hero → Marquee → BentoGrid → Marquee → LinkedIn → GitHub → Roadmap → ChatBot → footer
       │
       │  VITE_USE_MOCK === 'true' for offline demo; otherwise live API
       ▼
  src/services/api.js  →  VITE_API_BASE_URL (default http://localhost:8000/api)
       │
       ▼
  FastAPI app.main:app  (loads backend/.env via python-dotenv)
       /api/linkedin  → linkedin_service + JSON store
       /api/github    → github_service (httpx → api.github.com) + JSON store
       /api/roadmap   → merge gaps into 4-week plan
       /api/chat      → optional OpenAI + analysis IDs + JSON history
```

**LinkedIn is not scraped.** URL slug is parsed; keywords in the slug/URL pick a role template (developer / designer / manager / data / default). Score is derived from slug length + strengths.

**GitHub is live.** `GET /users/{username}` and `GET /users/{username}/repos?per_page=100&sort=updated`. Optional `GITHUB_TOKEN` for rate limits.

**Chat:** persisted conversations. Optional `linkedinAnalysisId` / `githubAnalysisId` on each message. If `OPENAI_API_KEY` is set, calls `gpt-4o-mini`; otherwise keyword matching, including analysis-aware replies.

**Roadmap:** `POST /api/roadmap/build` with one or both analysis IDs. Merges gaps, ranks severity, returns combined score + four weeks.

---

## Environment

### `backend/.env`

| Variable | Default | Notes |
|----------|---------|--------|
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated |
| `GITHUB_TOKEN` | unset | Optional PAT |
| `OPENAI_API_KEY` | unset | Optional chat LLM |

### `frontend/.env`

| Variable | Default in code | Notes |
|----------|-----------------|--------|
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | No trailing path beyond `/api` |
| `VITE_USE_MOCK` | **live API unless `'true'`** | `USE_MOCK = VITE_USE_MOCK === 'true'`. Set `true` only for an offline demo. |

Do not commit `.env` files (gitignored).

---

## API contracts

Base path: `/api`. JSON camelCase fields (Pydantic aliases match frontend).

| Method | Path | Body | Success |
|--------|------|------|---------|
| GET | `/api/health` | — | `{ "status": "ok", "service": "SkillGap AI API" }` |
| POST | `/api/linkedin/analyze` | `{ "profileUrl": string }` | `LinkedInResult` |
| GET | `/api/linkedin/results/{analysisId}` | — | `LinkedInResult` or 404 |
| POST | `/api/github/analyze` | `{ "username": string }` | `GitHubResult` |
| GET | `/api/github/results/{analysisId}` | — | `GitHubResult` or 404 |
| POST | `/api/chat/message` | `{ "message", "conversationId"?, "linkedinAnalysisId"?, "githubAnalysisId"? }` | `{ "reply", "conversationId" }` |
| GET | `/api/chat/history/{conversationId}` | — | `{ "conversationId", "messages": [{role, text}] }` or 404 |
| POST | `/api/roadmap/build` | `{ "linkedinAnalysisId"?, "githubAnalysisId"? }` | `RoadmapResult` |
| GET | `/api/roadmap/{roadmapId}` | — | `RoadmapResult` or 404 |

### LinkedInResult

```
analysisId, profileUrl, name, headline, overallScore (int)
skillGaps: [{ skill, severity: "high"|"medium"|"low", recommendation }]
strengths: string[]
marketDemand: [{ skill, demand: 0-100 }]
```

### GitHubResult

```
analysisId, username, name, overallScore
stats: { repos, stars, followers, contributions }  // all ints
topLanguages: [{ name, percentage }]
skillGaps: same as LinkedIn
pinnedRepos: [{ name, stars, language }]  // top 3 by stars, not real pins
```

Errors: 400 LinkedIn analyze; 404 GitHub user / missing result; 502 GitHub API failure. FastAPI `detail` may be a string; frontend `api.js` reads `error.message` from JSON (may miss `detail` — see known issues).

---

## Backend code map (what lives where)

**`app/main.py`** — FastAPI, CORS from settings, three routers under `/api`, health check.

**`app/config.py`** — frozen dataclass `Settings`; `cors_origin_list` splits `CORS_ORIGINS`.

**`app/schemas.py`** — all Pydantic models listed above. Request fields: `profileUrl`, `username`, `message`, `conversationId`.

**`app/services/store.py`** — two module-level dicts: `linkedin_results`, `github_results`. Chat has its own `ChatStore` in `chat_service.py`.

**`linkedin_service.analyze_linkedin_profile(url)`** — normalize URL, extract slug from `/in/` or `/pub/`, role from keywords, score `min(68 + len(slug)%17 + strengths*2, 94)`, id `li-` + 8 hex chars.

**`github_service.analyze_github_user(username)`** — strip `@`, fetch user+repos, skip most forks unless starred, language % from repo `size`, gaps from top languages + generic (OSS, docs, CI). Contributions are **estimated** (`public_repos * 28`), not the contributions calendar API.

**`chat_service.generate_chat_reply(message, conversationId)`** — create `chat-xxxxxxxx` if no id; append user; try OpenAI; else `_rule_based_reply`; append bot. Roles stored as `"user"` / `"bot"`.

**Dependencies:** `fastapi`, `uvicorn[standard]`, `httpx`, `pydantic`, `python-dotenv`. No database. No auth.

---

## Frontend code map

| File | Role |
|------|------|
| `main.jsx` | StrictMode mount `#root` |
| `App.jsx` | Intro gate via `sessionStorage` key `skillgap-intro-seen`; `useScrollReveal` on `.app`; `useParallax(0.04)`; Navbar + Home |
| `Home.jsx` | Page composition; section ids `linkedin`, `github`, `chat`; Hero uses `id="home"` |
| `api.js` | `linkedInApi`, `gitHubApi`, `chatApi` |
| `LinkedInAnalyzer.jsx` / `GitHubAnalyzer.jsx` | Forms + result UI; mock vs API via `USE_MOCK` |
| `ChatBot.jsx` | Local message list; keeps `conversationId` from API |
| `useAnimations.js` | IntersectionObserver on `.reveal`, `.reveal-left`, `.reveal-right`; CSS vars `--parallax-x/y`; intro session flag |
| `Decorative.jsx` | `FloatingShapes`, `SectionHeader`, `Sticker` |
| `Navbar.jsx` | Vertical 80px nav (`--nav-width`); items home/linkedin/github/chat |

**CSS:** Design system in `index.css`. Theme: neo-brutalism (thick 4px black borders, hard 8px shadows, cream background, Archivo Black / Space Grotesk / Syne). Tokens: `--orange #ff6b1a`, `--yellow #ffe600`, `--pink #ff3d9a`, `--cyan #00e5ff`, `--lime #b8ff00`, `--purple #9b5de5`, `--black`, `--white`, `--cream`. Utilities: `.brutal-btn`, `.brutal-btn--primary/secondary/dark`, `.brutal-card`, `.reveal` + `.visible`. Main content has `margin-left: var(--nav-width)`.

**Fonts:** Google Fonts in `index.html` (Archivo Black, Space Grotesk, Syne).

**Intro:** ~5.2s phases `enter → logo → visual → zoom → exit`, then `onComplete`. Skip if session already seen.

---

## Conventions (keep these)

- **camelCase JSON** between frontend and backend (`profileUrl`, `analysisId`, `skillGaps`, `overallScore`).
- **Section ids** must stay `home`, `linkedin`, `github`, `chat` (navbar + scroll).
- **No new routing library** unless asked; this is one scrolling page.
- **Shared analyzer styles** live in `LinkedInAnalyzer/Analyzer.css`; GitHub imports that file.
- **Do not add secrets** to git. Examples only in `.env.example`.
- **UI language:** neo-brutalist, loud, uppercase headings. Match existing CSS variables; do not flatten into a generic SaaS look unless asked.
- **Backend is Python 3 style** with `str | None` unions; keep routers thin, logic in `services/`.

---

## Known issues / gotchas (fix only if asked, or if you touch that area)

1. **LinkedIn is heuristic**, not official LinkedIn API / scraping. UI should stay honest about that.
2. **GitHub “pinned” repos** are highest-star repos, not profile pins. **Contributions** are estimated (`public_repos * 28`).
3. **Chat history 404** if conversation is unknown.
4. JSON persistence is local files in `backend/data/` (gitignored), not a database.
5. Errors now return `{ "message": "..." }` from FastAPI handlers; `api.js` also accepts `detail`.

---

## Key code blocks (do not rewrite unless changing behavior)

### FastAPI entry

```python
# backend/app/main.py
app = FastAPI(title="SkillGap AI API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origin_list, ...)
app.include_router(linkedin.router, prefix="/api")
app.include_router(github.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
```

### Frontend API client

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
// POST /linkedin/analyze { profileUrl }
// POST /github/analyze { username }
// POST /chat/message { message, conversationId }
```

### Mock vs live (analyzers + chat)

```javascript
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
```

### Vite proxy

```javascript
// frontend/vite.config.js
server: { port: 5173, open: true, proxy: { '/api': { target: 'http://localhost:8000', changeOrigin: true } } }
```

### App shell

```javascript
// Intro once per tab session → Navbar + Home
// handleNavigate: scrollIntoView for section ids, or scrollTo(0) for home
```

---

## What is NOT in the repo

- Tests
- Database / Redis
- Auth, users, billing
- Real LinkedIn OAuth or scrape
- Deploy config (Docker, CI)
- React Router / state libraries (no Redux, no TanStack Query)
- TypeScript (JSX + Python only)

---

## How the next AI should work

1. Read **this file only** for context.
2. Implement **only what the user asked** in that turn.
3. Open the specific source files you must change.
4. After UI changes, verify in the browser (LinkedIn / GitHub / Chat flows, mock and live if relevant).
5. When you finish a meaningful chunk of work, **update this PROGRESS.md**: status, new files, API changes, decisions, leftover TODOs. Keep it accurate so the next model does not re-explore.

**Last updated:** 2026-08-28 — Live API default, roadmap section, persisted store, analysis-aware chat, intro skip, scroll spy, encoding fixes.
