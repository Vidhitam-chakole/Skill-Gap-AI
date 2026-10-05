# PROGRESS — SkillGap AI

## Architecture Overview

SkillGap AI has been refactored into a clean, modular structure. Each core functional element has its own independent folder with a dedicated `backend/` and `frontend/` directory, while the universal `backend/` and `frontend/` orchestrate and render the integrated application.

### Modular Folder Organization

1. `linkedin_analyzer/`
   - `backend/`: `router.py`, `service.py`, `schemas.py`
   - `frontend/`: `LinkedInAnalyzer.jsx`, `Analyzer.css`
   - Accepts both LinkedIn Name and Profile URL. Detects roles, calculates overall score, lists skill gaps, strengths, and market demand.

2. `github_analyzer/`
   - `backend/`: `router.py`, `service.py`, `schemas.py`
   - `frontend/`: `GitHubAnalyzer.jsx`, `Analyzer.css`
   - Accepts GitHub Username or full profile URL. Live queries GitHub REST API, calculates languages, star counts, public repos, and missing developer practices (testing, CI/CD, documentation).

3. `roadmap/`
   - `backend/`: `router.py`, `service.py`, `schemas.py`
   - `frontend/`: `Roadmap.jsx`, `Roadmap.css`
   - Merges gaps from LinkedIn and GitHub, assigns combined score, and plans a 4-week structured sprint with concrete deliverables.

4. `ai_agent/`
   - `backend/`: `router.py`, `service.py`, `schemas.py`
   - `frontend/`: `ChatBot.jsx`, `ChatBot.css`
   - Runs 100% locally offline with an intelligent, context-driven AI career reasoning engine. Supports optional OpenAI fallback if `OPENAI_API_KEY` is provided.

5. `backend/`
   - Central FastAPI application on port 8000.
   - Mounts the modular routers from each element.
   - Handles CORS, configuration, error responses, and local JSON persistence in `backend/data/`.

6. `frontend/`
   - Universal React 18 + Vite application on port 5173.
   - Features the Unified Profile Scanner (`UnifiedScanner`), Hero, Marquee, BentoGrid, Navbar, and Footer in neo-brutalist aesthetic.

## Cleanup Performed
- Removed `.freebuff/` temporary log junk.
- Removed misspelled `Lindin Analyzer/` directory.
- Removed nested duplicate `backend/backend/` directory.
- Removed broken `SkillPlusChatbot.jsx` (which depended on uninstalled `@botpress/webchat`).
- Removed orphaned `DashboardPage.*`, `IntroPage.*`, and `WelcomePage.*` files that had conflicting, missing context functions.
- Fixed `ai_agent` language extraction evaluation bug.
- Added input handling for both plain name (e.g. `Alex Rivera`) and URL on LinkedIn.
- Added input handling for profile URLs (e.g. `https://github.com/torvalds`) and username on GitHub.
- Added unified 1-click profile scanner for instant simultaneous analysis.
