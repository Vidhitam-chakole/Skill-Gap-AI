# LinkedIn Profile Analyzer Module

This folder isolates the complete LinkedIn Analyzer component and service.

## Structure

```
linkedin_analyzer/
├── backend/
│   ├── schemas.py      # Pydantic request & response models
│   ├── service.py      # Core profile parsing, heuristic scoring & gap detection
│   ├── router.py       # FastAPI APIRouter (/linkedin/analyze, /linkedin/results)
│   └── __init__.py
└── frontend/
    ├── LinkedInAnalyzer.jsx # React UI component for LinkedIn reviews
    ├── Analyzer.css         # Component styling matching neo-brutalist system
    └── README.md
```

## Features
- Accepts both LinkedIn Name (e.g. `Alex Rivera`) or Profile URL (`https://linkedin.com/in/alex-rivera`)
- Automatic role detection: Software Developer, Product Designer, Engineering Manager, Data Scientist, or General Tech Professional
- Quantified profile score (1-100)
- Identifies high/medium/low severity skill gaps with actionable next steps
- Profile strengths breakdown & current market demand hiring index
