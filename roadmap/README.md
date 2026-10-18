# Career Roadmap Module

This folder isolates the complete Roadmap generation component and service.

## Structure

```
roadmap/
├── backend/
│   ├── schemas.py      # Pydantic request & response models (dynamic milestones & durations)
│   ├── service.py      # Gap merging, priority scoring, GitHub strong languages adaptation, dynamic milestones planner
│   ├── router.py       # FastAPI APIRouter (/roadmap/build, /roadmap/{id})
│   └── __init__.py
└── frontend/
    ├── Roadmap.jsx     # React UI component for the dynamic adaptive roadmap
    ├── Roadmap.css     # Component styling with brutalist cards and metrics strip
    └── README.md
```

## Features
- Merges gaps from LinkedIn and GitHub into a unified priority list
- Dynamically extracts the developer's strong programming languages from GitHub
- Eliminates fixed 4-week limitation: generates an adaptive number of milestones (3 to 7+) based on gap complexity
- Automatically tailors tasks, frameworks (e.g. Pytest, Vitest, JUnit, Go race-testing), and deliverables to the developer's primary stack
- Calculates dynamic timeline estimates (e.g. 3-4 weeks, 6-8 weeks)
- Actionable next steps ready for review by the Local AI Agent
