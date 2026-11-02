# LinkedIn Profile Analyzer Module

This folder isolates the complete LinkedIn Analyzer frontend and backend services.

## Structure

```
linkedin_analyzer/
├── backend/
│   ├── schemas.py               # Pydantic request & response models
│   ├── service.py               # Core profile parsing, heuristic scoring & gap detection
│   ├── router.py                # FastAPI APIRouter (/linkedin/analyze, /linkedin/results)
│   └── __init__.py
└── frontend/
    ├── components/
    │   ├── LinkedInAnalyzer.jsx # React UI component for LinkedIn reviews
    │   └── Analyzer.css         # Component styling matching neo-brutalist system
    ├── pages/
    │   └── LinkedInPage.jsx     # Standalone page for /linkedin route
    ├── services/
    │   └── api.js               # Dedicated LinkedIn API client
    ├── index.js                 # Unified frontend exports
    └── README.md
```

## Features
- Accepts both official LinkedIn Profile export PDFs (.pdf) or profile handles
- Automatic role detection: Software Developer, Product Designer, Engineering Manager, Data Scientist, or General Tech Professional
- Quantified profile score (1-100)
- Identifies high/medium/low severity skill gaps with actionable next steps
- Profile strengths breakdown & current market demand hiring index
