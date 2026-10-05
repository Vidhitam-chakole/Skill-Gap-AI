# Career Roadmap Module

This folder isolates the complete Roadmap generation component and service.

## Structure

```
roadmap/
├── backend/
│   ├── schemas.py      # Pydantic request & response models
│   ├── service.py      # Gap merging, priority scoring, 4-week sprint task planner
│   ├── router.py       # FastAPI APIRouter (/roadmap/build, /roadmap/{id})
│   └── __init__.py
└── frontend/
    ├── Roadmap.jsx     # React UI component for the 4-week roadmap
    ├── Roadmap.css     # Component styling
    └── README.md
```

## Features
- Merges gaps from LinkedIn and GitHub into a unified priority list
- Calculates a combined career readiness score
- Plans a 4-week structured sprint (Week 1 to Week 4) with tangible tasks
- Actionable next steps ready for review by the Local AI Agent
