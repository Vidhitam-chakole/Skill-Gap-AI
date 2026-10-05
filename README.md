# SkillGap AI — Career Gap Intelligence Platform

SkillGap AI analyzes your LinkedIn PDF export and GitHub profile, surfaces critical technical skill gaps, generates a structured 4-week personalized learning roadmap, and provides a Local AI Career Agent that offers customized mentorship based on your analysis.

## Key Features

1. **LinkedIn Profile & Resume PDF Review**
   - **Step-by-step guidance** directly in the UI showing how to download your official LinkedIn profile PDF via **More → Save to PDF** in 3 seconds.
   - Accepts your **LinkedIn Profile PDF export (`.pdf`)** and **LinkedIn Name** for accurate context and attribution.
   - Parses verified headline, experience, detected technical skills, and identifies missing industry-standard competencies.
   - Also supports direct Name / Profile URL analysis mode.

2. **GitHub Profile Review**
   - Real-time GitHub REST API query via **GitHub Profile Link** or **Username** (e.g. `torvalds` or `https://github.com/torvalds`).
   - Analyzes real repositories, star metrics, followers, activity velocity, and byte-weighted language percentages.
   - Detects missing developer practices: test coverage, CI/CD automation, open-source contributions, and documentation.

3. **Personalized 4-Week Roadmap**
   - Real synthesis merging findings from your LinkedIn PDF review and GitHub repositories.
   - Deduplicates and ranks gaps by severity (High, Medium, Low).
   - Generates a concrete 4-week structured sprint plan with shippable deliverables.

4. **Local AI Career Agent**
   - Runs 100% locally offline with an intelligent, context-driven career mentor engine.
   - Primed with your verified LinkedIn PDF headline & skills, GitHub languages & stats, and roadmap priorities.
   - Answers queries on reviews, skill gaps, week-by-week actions, and technical growth.
   - Optional OpenAI integration if `OPENAI_API_KEY` is provided in `.env`.

---

## Modular Architecture

The repository is modularized into dedicated domain folders: each element has its own isolated `frontend/` and `backend/` subfolder, unified under the main application:

```
Skill-Gap-AI/
├── linkedin_analyzer/           # LinkedIn Analysis Module
│   ├── backend/                 # PDF parser (pypdf), router, service, schemas
│   └── frontend/                # LinkedIn review UI component & styles
│
├── github_analyzer/             # GitHub Analysis Module
│   ├── backend/                 # GitHub REST API consumer & gap service
│   └── frontend/                # GitHub review UI component & styles
│
├── roadmap/                     # Roadmap Module
│   ├── backend/                 # Gap synthesis & 4-week sprint task planner
│   └── frontend/                # Roadmap UI component & styles
│
├── ai_agent/                    # Local AI Agent Module
│   ├── backend/                 # Contextual AI mentor engine
│   └── frontend/                # AI Chatbot UI component & suggestions
│
├── backend/                     # Universal Backend (FastAPI on Port 8000)
│   ├── app/
│   │   ├── main.py              # Mounts all modular routers
│   │   ├── config.py            # Environment & CORS configuration
│   │   ├── schemas.py           # Shared schema models
│   │   ├── routers/             # API routing bridge
│   │   └── services/store.py    # Local JSON persistence for analyses
│   └── requirements.txt
│
└── frontend/                    # Universal Frontend (React 18 + Vite on Port 5173)
    ├── src/
    │   ├── components/
    │   │   ├── LinkedInAnalyzer/
    │   │   ├── GitHubAnalyzer/
    │   │   ├── Roadmap/
    │   │   ├── ChatBot/
    │   │   ├── Hero/
    │   │   ├── BentoGrid/
    │   │   └── Navbar/
    │   ├── pages/Home.jsx
    │   ├── context/AnalysisContext.jsx
    │   └── services/api.js      # Centralized HTTP client
    └── package.json
```

---

## How to Run

### 1. Backend Server (Port 8000)

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # On Windows (or source venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend health check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### 2. Frontend Development Server (Port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. Vite proxies `/api` requests directly to `http://localhost:8000`.

---

## How to Download Your LinkedIn Profile PDF

1. Open your profile on [LinkedIn](https://www.linkedin.com).
2. In the top card of your profile, click the **'More'** button (next to 'Open to' / 'Add profile section').
3. Click **'Save to PDF'** to immediately download your official LinkedIn resume PDF.
4. Upload that PDF directly in the LinkedIn Review section.