# BRAIN.md — SkillGap AI Master Architectural & Codebase Blueprint

> **Notice for AI Agents & Developers:**  
> This file is the single source of truth for the entire SkillGap AI system. Reading this document gives you complete knowledge of the system architecture, file structure, data flow, algorithms, API endpoints, frontend state, and Vercel serverless deployment. **You do not need to read through all individual files to understand how to build, maintain, or extend this project.**

---

## 1. Executive Summary & Philosophy

**SkillGap AI** is a modular, full-stack career intelligence platform that helps developers and engineers bridge the gap between their current skills and modern market demands.

### Core Capabilities
1. **LinkedIn Profile & PDF Review (`linkedin_analyzer/`)**: Extracts headline, verified skills, and experience directly from exported LinkedIn profile PDFs (`.pdf`) using `pypdf`, identifying missing modern industry competencies.
2. **GitHub Code Intelligence (`github_analyzer/`)**: Scans real public GitHub profiles via the GitHub REST API, calculating live language distributions, star metrics, activity signals, and technical code gaps.
3. **Anti-AI Code & Skill Authenticity Verifier (`skill_verifier/`)**: A forensic 10-question diagnostic engine designed to test whether claimed "strong languages" from GitHub repos represent genuine human engineering intuition or copy-pasted/AI-generated code.
4. **Unified 4-Week Career Roadmap (`roadmap/`)**: Synthesizes findings from both LinkedIn and GitHub reviews into a deduplicated, prioritized 4-week sprint plan with curated resources and milestones.
5. **Local AI Career Agent (`ai_agent/`)**: A context-injected reasoning assistant primed with the user's parsed profile data and code gaps to answer career questions, suggest project ideas, and guide technical growth.

### Core Non-Negotiable Invariants
* **Zero Mock Data Policy**: There is no mock toggle and no fallback mock data (`mockData.js` was permanently eliminated). All features use live backend endpoints and real GitHub/PDF data.
* **Serverless Compatibility**: On Vercel, the root filesystem is strictly read-only (`/var/task`). All file caches fallback cleanly to `/tmp` via runtime environment checks (`os.environ.get("VERCEL")`).
* **Unified Single-Origin Deployment**: In production, the React SPA and FastAPI backend run under the same origin on Vercel. FastAPI serves the static compiled frontend at `/` and client routes, while exposing modular endpoints at `/api/*`.

---

## 2. System Architecture & Data Flow

```mermaid
graph TD
    User([User Browser]) -->|HTTPS| VercelEdge[Vercel Edge Network]
    
    subgraph Vercel Deployment [https://skillgapai-app.vercel.app]
        VercelEdge -->|/* Request| VercelRewrites[vercel.json Rewrites]
        VercelRewrites -->|/(.*) -> /api/index.py| PyServerless[api/index.py ASGI Handler]
        
        subgraph FastAPI Application [backend/app/main.py]
            PyServerless --> FastAPIApp[FastAPI App Instance]
            FastAPIApp -->|/assets/*| StaticMount[StaticFiles: frontend/dist/assets]
            FastAPIApp -->|GET /* non-api| SPAMount[FileResponse: frontend/dist/index.html]
            
            FastAPIApp -->|/api/linkedin/*| LiRouter[linkedin_analyzer Router]
            FastAPIApp -->|/api/github/*| GhRouter[github_analyzer Router]
            FastAPIApp -->|/api/skill-verifier/*| SvRouter[skill_verifier Router]
            FastAPIApp -->|/api/roadmap/*| RmRouter[roadmap Router]
            FastAPIApp -->|/api/chat/*| ChatRouter[ai_agent Router]
            FastAPIApp -->|/api/health| HealthCheck[Health Check Endpoint]
        end
    end

    LiRouter -->|PDF Parsing| PyPDF[pypdf Parser]
    GhRouter -->|Live REST API| GitHubAPI[(GitHub Public REST API)]
    SvRouter -->|Question Bank & Scoring| VerifierEngine[10Q Diagnostic Engine]
    RmRouter -->|Synthesis| RoadmapSynthesis[Cross-Analyzer Synthesizer]
    ChatRouter -->|Context Synthesis| ContextEngine[Career Reasoning Engine]

    FastAPIApp -->|Persistent Cache| StorageLayer[Store: backend/data OR /tmp on Vercel]
```

---

## 3. Complete File Map & Repository Layout

```
Skill-Gap-AI/
├── .github/                       # CI/CD workflows (if any)
├── .gitignore                     # Git ignore rules (node_modules, caches, venv)
├── .python-version                # Pins Python 3.12 for Vercel Serverless
├── .vercelignore                  # Files excluded from Vercel deployment uploads
├── api/
│   └── index.py                   # Vercel Serverless ASGI entrypoint (imports backend.app.main:app)
├── backend/                       # Core FastAPI application orchestration
│   ├── app/
│   │   ├── config.py              # Settings: CORS origins, GitHub token, OpenAI key
│   │   ├── main.py                # Main FastAPI app, CORS middleware, router mounts, static SPA serving
│   │   ├── schemas.py             # Shared Pydantic data schemas across analyzers
│   │   ├── routers/               # Route mounts delegating to modular analyzers
│   │   │   ├── chat.py            # Mounts ai_agent.backend.router
│   │   │   ├── github.py          # Mounts github_analyzer.backend.router
│   │   │   ├── linkedin.py        # Mounts linkedin_analyzer.backend.router
│   │   │   ├── roadmap.py         # Mounts roadmap.backend.router
│   │   │   └── skill_verifier.py  # Mounts skill_verifier.backend.router + links GitHub resolver
│   │   └── services/
│   │       └── store.py           # In-memory + disk cache store (auto-falls back to /tmp on Vercel)
│   ├── data/                      # Local JSON cache files (gitignored)
│   └── requirements.txt           # Python dependencies for local backend dev
├── frontend/                      # React 18 + Vite 6 Single Page Application
│   ├── dist/                      # Pre-compiled static production bundle (committed for Vercel)
│   ├── public/                    # Favicon, logo.svg, logo.png, intro.mp4
│   ├── src/
│   │   ├── App.jsx                # Root React component, section navigation state
│   │   ├── App.css                # Global layout and app styling
│   │   ├── index.css              # Design system variables, brutalist tokens, resets
│   │   ├── main.jsx               # React DOM root entrypoint
│   │   ├── components/            # UI components
│   │   │   ├── BentoGrid/         # Interactive feature card grid
│   │   │   ├── ChatBot/           # Career agent floating interactive chat window
│   │   │   ├── Decorative/        # Visual SVG flair & floating shapes
│   │   │   ├── GitHubAnalyzer/    # GitHub review card, inputs, language pills, verifier triggers
│   │   │   ├── Hero/              # Hero header, CTA buttons, metrics banner
│   │   │   ├── IntroAnimation/    # Initial video/motion reveal sequence
│   │   │   ├── LinkedInAnalyzer/  # PDF upload guidance card, drag-and-drop zone, gap analysis
│   │   │   ├── Marquee/           # Continuous scrolling text marquee ticker
│   │   │   ├── Navbar/            # Top navigation bar with status indicator & links
│   │   │   ├── Roadmap/           # 4-week interactive sprint roadmap view
│   │   │   └── SkillVerifier/     # Anti-AI 10Q diagnostic test UI & Authenticity Certificate
│   │   ├── pages/
│   │   │   └── Home.jsx           # Main home page assembling all components
│   │   └── services/
│   │       └── api.js             # Centralized API client (dynamic relative /api in production)
│   ├── package.json               # Frontend dependencies & scripts
│   └── vite.config.js             # Vite config with /api proxy to localhost:8000 for local dev
├── linkedin_analyzer/             # Isolated LinkedIn Analysis Module
│   ├── backend/
│   │   ├── router.py              # Endpoints: /api/linkedin/analyze-pdf, /analyze, /results/{id}
│   │   ├── schemas.py             # Module-specific request/response schemas
│   │   └── service.py             # PDF text extraction (pypdf), regex parser, skill gap evaluator
│   └── frontend/                  # Modular frontend assets/components
├── github_analyzer/               # Isolated GitHub Analysis Module
│   ├── backend/
│   │   ├── router.py              # Endpoints: /api/github/analyze, /results/{id}
│   │   ├── schemas.py             # Module-specific schemas
│   │   └── service.py             # GitHub REST API client, repo scoring, language bytes computation
│   └── frontend/                  # Modular frontend assets/components
├── skill_verifier/                # Anti-AI Code & Skill Authenticity Verifier
│   ├── backend/
│   │   ├── question_bank.py       # Deep 10-question pools per language (C, Python, JS, C++, TS, Java)
│   │   ├── router.py              # Endpoints: /languages, /generate, /submit, /result/{id}
│   │   ├── schemas.py             # Question, Evaluation, ConceptScore, QuizSession models
│   │   └── service.py             # Quiz generator, answer evaluator, Authenticity Index math
│   └── frontend/
│       ├── SkillVerifier.jsx      # Standalone/integrated quiz UI with timer & results card
│       └── SkillVerifier.css      # Brutalist cyberpunk styling for quiz engine
├── roadmap/                       # Isolated Roadmap Generator Module
│   ├── backend/
│   │   ├── router.py              # Endpoints: /api/roadmap/build, /{id}
│   │   ├── schemas.py             # Roadmap request/response models
│   │   └── service.py             # Cross-analysis synthesizer (LinkedIn + GitHub -> 4-week sprint)
│   └── frontend/                  # Modular roadmap UI
├── ai_agent/                      # Isolated Local AI Career Agent Module
│   ├── backend/
│   │   ├── router.py              # Endpoints: /api/chat/message, /history/{id}
│   │   ├── schemas.py             # Chat request/response schemas
│   │   └── service.py             # Local heuristic context-driven reasoning engine
│   └── frontend/                  # Modular chat UI
├── package.json                   # Root package.json running build scripts for Vercel
├── requirements.txt               # Root Python dependencies for Vercel Python runtime
├── vercel.json                    # Vercel deployment, rewrites, and routing configuration
└── BRAIN.md                       # THIS MASTER SPECIFICATION FILE
```

---

## 4. Module Deep Dives & Algorithms

### Module 1: LinkedIn Analyzer (`linkedin_analyzer/`)

* **Primary Input:** PDF Export from LinkedIn (via **More → Save to PDF**) or Profile URL.
* **Extraction Flow (`service.py`):**
  1. `pypdf.PdfReader` reads bytes from memory buffer (no disk write needed).
  2. Extracts all plain text across all pages.
  3. Uses regex and layout heuristics to detect sections:
     * Headline & Current Role
     * Summary / About
     * Experience (Role titles, company names, tenures)
     * Education (Institutions, degrees, years)
     * Skills (Extracted explicit skills)
  4. Compares identified competencies against a curated dictionary of **Modern Industry Standards** (Cloud, Microservices, CI/CD, Containerization, Distributed Systems, Testing).
  5. Computes:
     * `detectedSkills`: Confirmed skills found in profile text.
     * `skillGaps`: High-demand industry skills missing from profile.
     * `recommendations`: Concrete actionable steps to enhance resume visibility.
* **Endpoints:**
  * `POST /api/linkedin/analyze-pdf`: Accepts `multipart/form-data` with `file: UploadFile`, `name: str`, `profileUrl: str`.
  * `POST /api/linkedin/analyze`: Accepts `{"profileUrl": "..."}`.
  * `GET /api/linkedin/results/{analysisId}`: Returns saved `LinkedInResult`.

---

### Module 2: GitHub Analyzer (`github_analyzer/`)

* **Primary Input:** GitHub Username or Profile Link (e.g., `https://github.com/torvalds` or `torvalds`).
* **Extraction Flow (`service.py`):**
  1. Sanitizes input to extract plain GitHub username.
  2. Calls `https://api.github.com/users/{username}` for profile metadata (public repos, followers, bio).
  3. Calls `https://api.github.com/users/{username}/repos?per_page=100&sort=updated` for repository data.
  4. Aggregates language byte counts across repos to determine `primaryLanguages` with percentage distribution.
  5. Evaluates code quality signals:
     * Presence of README, LICENSE, automated tests (`test`, `spec`).
     * CI/CD configurations (`.github/workflows`, `.travis.yml`).
     * Star count, fork count, and repository velocity.
  6. Computes `codeGaps`: Detects missing practices (e.g., lack of automated testing, no Docker/containerization, missing documentation).
* **Endpoints:**
  * `POST /api/github/analyze`: Accepts `{"username": "..."}`.
  * `GET /api/github/results/{analysisId}`: Returns saved `GitHubResult`.

---

### Module 3: Anti-AI Code & Skill Authenticity Verifier (`skill_verifier/`)

* **Core Problem Solved:** Recruiters and engineers frequently encounter candidates who have GitHub repositories filled with AI-generated or copy-pasted code, but lack fundamental understanding of low-level language mechanics, memory lifecycles, and edge cases.
* **Diagnostic Strategy (`question_bank.py` & `service.py`):**
  * Provides deep diagnostic assessment across 6 core languages:
    1. **C Programming**: Pointers, pointer arithmetic, memory alignment, sequence points, `sizeof`, buffer overflows.
    2. **Python**: Mutable default arguments, GIL, closure late binding in comprehensions, `__new__` vs `__init__`, memory footprint of generators vs lists.
    3. **JavaScript**: Microtask vs macrotask event loop order, lexical scoping, closure memory retention, prototypal inheritance, strict equality vs type coercion.
    4. **C++**: RAII, copy vs move semantics (`std::move`), virtual destructors, vtables, object slicing.
    5. **TypeScript**: Structural subtyping, `any` vs `unknown`, type narrowing, distributive conditional types, template literal types.
    6. **Java**: Memory model (heap vs stack), string interning (`==` vs `.equals()`), `finally` return overrides, volatile mechanics, garbage collection ergonomics.
* **10-Question Diagnostic Engine:**
  * Generates 10 targeted questions with real code snippets and counter-intuitive edge cases.
  * Measures question completion time (`timeSpentSeconds`).
* **Authenticity Index Formula:**
  $$\text{Score} = \frac{\text{Correct Answers}}{10} \times 100$$
  * **$\ge 80\%$** &rarr; **`Verified Authentic`**: Genuine intuitive grasp of internal language mechanics.
  * **$50\% - 79\%$** &rarr; **`AI-Augmented`**: Functional knowledge, but vulnerable on edge cases and memory/concurrency details.
  * **$< 50\%$** &rarr; **`Suspect AI Code`**: High probability that repository code was generated by LLMs without human conceptual mastery.
* **Endpoints:**
  * `GET /api/skill-verifier/languages`: Returns list of supported verification tracks.
  * `POST /api/skill-verifier/generate`: Accepts `{"language": "python", "githubAnalysisId": "..."}`.
  * `POST /api/skill-verifier/submit`: Accepts `{"quizId": "...", "language": "...", "answers": {"1": 0, "2": 1, ...}, "timeSpentSeconds": 120}`.
  * `GET /api/skill-verifier/result/{quizId}`: Returns full score breakdown, concept ratings, and explanations.

---

### Module 4: Unified Roadmap Generator (`roadmap/`)

* **Input:** `linkedinAnalysisId` (from LinkedIn review) + `githubAnalysisId` (from GitHub review).
* **Synthesis Engine (`service.py`):**
  1. Resolves cached results from both analyzers.
  2. Merges technical gaps from LinkedIn (e.g., missing Docker, Kubernetes, CI/CD) with code gaps from GitHub (e.g., no unit tests, monolithic structure).
  3. Deduplicates and scores gaps by market urgency.
  4. Generates an organized **4-Week Sprint Plan**:
     * **Week 1: Core Fundamentals & Testing Architecture**: Setting up test suites, type safety, linting.
     * **Week 2: Backend Patterns & API Design**: Modular design, caching, database indexing, rate limiting.
     * **Week 3: Containerization & Cloud Deployment**: Dockerizing applications, setting up CI/CD GitHub Actions pipelines.
     * **Week 4: Production Observability & Portfolio Polish**: Monitoring, logging, security hardening, resume alignment.
  5. Attaches curated documentation links and project tasks to every week.
* **Endpoints:**
  * `POST /api/roadmap/build`: Accepts `{"linkedinAnalysisId": "...", "githubAnalysisId": "..."}`.
  * `GET /api/roadmap/{roadmapId}`: Returns saved `RoadmapResult`.

---

### Module 5: Local AI Career Agent (`ai_agent/`)

* **Philosophy:** Fast, zero-config local intelligence that does not require an external paid OpenAI/Anthropic key by default, but supports OpenAI keys if provided in `.env`.
* **Reasoning Flow (`service.py`):**
  1. Receives message + conversation ID + optional `linkedinAnalysisId` and `githubAnalysisId`.
  2. Fetches cached profile and code insights from the store.
  3. Constructs an enriched prompt context containing:
     * Candidate's detected skills and missing gaps
     * Primary GitHub languages and repository metrics
     * Prior chat conversation history
  4. If `OPENAI_API_KEY` is present in `Settings`, dispatches query to OpenAI API.
  5. If `OPENAI_API_KEY` is absent, executes the **Local Career Reasoning Engine**:
     * Analyzes intent (e.g., resume advice, roadmap explanation, interview prep, project recommendations).
     * Synthesizes personalized guidance grounded directly in the candidate's actual data.
* **Endpoints:**
  * `POST /api/chat/message`: Accepts `{"message": "...", "conversationId": "...", "linkedinAnalysisId": "...", "githubAnalysisId": "..."}`.
  * `GET /api/chat/history/{conversationId}`: Returns history list of `[{"role": "user"|"assistant", "text": "..."}]`.

---

### Module 6: Backend Orchestration & Store (`backend/app/`)

* **Entrypoint [backend/app/main.py](file:///c:/Users/Dell/OneDrive/Desktop/Skill-Gap-AI/backend/app/main.py):**
  * Configures `CORSMiddleware` supporting both local development (`localhost:5173`) and production domains (`https://skillgapai-app.vercel.app`, `https://skillgap-ai-app.vercel.app`).
  * Mounts modular routers under `/api`.
  * **Static File & SPA Serving:**
    * Checks if `frontend/dist` exists.
    * Mounts `/assets` via `StaticFiles`.
    * Implements a catch-all route `@app.get("/{full_path:path}")` returning `FileResponse("frontend/dist/index.html")` for non-API client routes.
* **Persistence [backend/app/services/store.py](file:///c:/Users/Dell/OneDrive/Desktop/Skill-Gap-AI/backend/app/services/store.py):**
  * Maintains in-memory dictionaries for instant lookups (`linkedin_results`, `github_results`, `roadmap_results`, `chat_conversations`).
  * **Serverless Safety:** Checks `if os.environ.get("VERCEL"): DATA_DIR = Path("/tmp") / "skillgap_data"`. Wrapped in `try...except OSError` so read-only serverless filesystems never crash on disk writes.

---

### Module 7: Frontend Architecture (`frontend/src/`)

* **Stack:** React 18, Vite 6, Vanilla CSS with custom brutalist / cyber design tokens.
* **Design Tokens (`index.css`):**
  * Background: `#0c0d12` (deep space obsidian)
  * Accent Colors: `#6366f1` (electric indigo), `#06b6d4` (cyan), `#10b981` (emerald), `#f59e0b` (amber), `#ef4444` (crimson)
  * Typography: `Space Grotesk` (body), `Archivo Black` / `Syne` (headings), `JetBrains Mono` / monospace (code).
* **Navigation State (`App.jsx` & `Home.jsx`):**
  * Smooth auto-scrolls to sections: `#hero`, `#bento`, `#linkedin`, `#github`, `#skill-verifier`, `#roadmap`, `#chat`.
* **API Service (`frontend/src/services/api.js`):**
  ```javascript
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');
  ```
  * In development: Calls `http://localhost:8000/api`.
  * In production: Calls relative `/api` on the same domain, guaranteeing zero CORS errors.

---

## 5. Complete API Reference Matrix

| HTTP Method | Path | Request Body / Parameters | Response Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | None | Service status and loaded modular analyzer list |
| **POST** | `/api/linkedin/analyze-pdf` | `FormData`: `file` (.pdf), `name`, `profileUrl` | `LinkedInResult`: headline, detectedSkills, skillGaps, recommendations |
| **POST** | `/api/linkedin/analyze` | JSON: `{"profileUrl": "string"}` | `LinkedInResult` |
| **GET** | `/api/linkedin/results/{id}` | Path param: `id` | Cached `LinkedInResult` |
| **POST** | `/api/github/analyze` | JSON: `{"username": "string"}` | `GitHubResult`: languages, repos, stars, codeGaps |
| **GET** | `/api/github/results/{id}` | Path param: `id` | Cached `GitHubResult` |
| **GET** | `/api/skill-verifier/languages` | None | Supported language tracks (`c`, `python`, `javascript`, etc.) |
| **POST** | `/api/skill-verifier/generate` | JSON: `{"language": "python", "githubAnalysisId": "..."}` | `GenerateQuizResponse`: quizId, 10 diagnostic questions |
| **POST** | `/api/skill-verifier/submit` | JSON: `{"quizId": "...", "language": "...", "answers": {...}, "timeSpentSeconds": 90}` | `QuizEvaluationResult`: Authenticity index, score, concept ratings |
| **GET** | `/api/skill-verifier/result/{id}` | Path param: `id` | Cached `QuizEvaluationResult` |
| **POST** | `/api/roadmap/build` | JSON: `{"linkedinAnalysisId": "...", "githubAnalysisId": "..."}` | `RoadmapResult`: 4-week prioritized sprint plan |
| **GET** | `/api/roadmap/{id}` | Path param: `id` | Cached `RoadmapResult` |
| **POST** | `/api/chat/message` | JSON: `{"message": "...", "conversationId": "...", ...}` | `ChatConversationResponse`: conversationId, assistant reply |
| **GET** | `/api/chat/history/{id}` | Path param: `id` | Conversation message history |

---

## 6. Vercel Serverless Architecture & Deployment

### Routing Mechanism (`vercel.json`)
```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/index.py"
    }
  ]
}
```
* **Why this pattern?** Vercel routes every request to `api/index.py`. 
* When a request matches `/api/*`, FastAPI routes it to the corresponding router (`linkedin`, `github`, `roadmap`, `chat`, `skill_verifier`).
* When a request matches `/assets/*`, FastAPI serves the static CSS/JS bundles from `frontend/dist/assets`.
* When a request matches `/` or any frontend SPA route, FastAPI returns `frontend/dist/index.html`.
* This completely eliminates routing discrepancies, 404s, and CORS issues.

### Deployment Files
* [api/index.py](file:///c:/Users/Dell/OneDrive/Desktop/Skill-Gap-AI/api/index.py): Injects root and backend into `sys.path` and exposes `app = app`.
* [package.json](file:///c:/Users/Dell/OneDrive/Desktop/Skill-Gap-AI/package.json): Root build script `npm --prefix frontend install && npm --prefix frontend run build`.
* [requirements.txt](file:///c:/Users/Dell/OneDrive/Desktop/Skill-Gap-AI/requirements.txt): Root Python dependencies (`fastapi`, `uvicorn`, `httpx`, `pydantic`, `python-dotenv`, `pypdf`, `python-multipart`).
* [.python-version](file:///c:/Users/Dell/OneDrive/Desktop/Skill-Gap-AI/.python-version): Pinned to `3.12`.
* [frontend/dist/](file:///c:/Users/Dell/OneDrive/Desktop/Skill-Gap-AI/frontend/dist): Committed pre-built distribution bundle so static assets are always available during deployment.

### Active Production Domains
1. **`https://skillgapai-app.vercel.app`** (Primary custom domain)
2. **`https://skillgap-ai-app.vercel.app`** (Secondary custom domain)
3. **`https://skillgapai-fawn.vercel.app`** (Default Vercel deployment domain)

---

## 7. Developer & AI Operator Runbook

### Running Locally

#### 1. Start the FastAPI Backend
```bash
# In workspace root
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at `http://127.0.0.1:8000/docs`.

#### 2. Start the Vite Frontend
```bash
# In frontend directory
cd frontend
npm install
npm run dev
```
Frontend will be live at `http://localhost:5173` and will proxy `/api` requests to port `8000`.

### Building & Updating Production
Whenever you modify frontend components:
```bash
# Build the production bundle
npm --prefix frontend run build

# Stage all files (including pre-built dist)
git add -A
git commit -m "Your descriptive commit message"
git push origin main
```
Because the GitHub repository is connected to Vercel, pushing to `origin/main` automatically triggers a zero-downtime production deployment.

---

## 8. Invariants for Future AI Developers

1. **DO NOT introduce mock data:** Any new feature must connect to real endpoints or algorithms. Do not re-add `mockData.js`.
2. **DO NOT perform unhandled file writes:** Always verify serverless context (`os.environ.get("VERCEL")`) and use `/tmp` for any temporary files.
3. **DO NOT hardcode full localhost URLs in frontend components:** Always use the centralized client in [frontend/src/services/api.js](file:///c:/Users/Dell/OneDrive/Desktop/Skill-Gap-AI/frontend/src/services/api.js).
4. **DO NOT break the `api/index.py` path imports:** `sys.path.insert(0, str(ROOT_DIR))` and `sys.path.insert(0, str(BACKEND_DIR))` must remain so that modular folders (`linkedin_analyzer`, `skill_verifier`, etc.) can be imported from root.
5. **Always test imports via CLI before deploying:**
   ```bash
   python -c "import api.index; print(api.index.app.title)"
   ```
