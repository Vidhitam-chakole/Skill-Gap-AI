# GitHub Profile Analyzer Module

This folder isolates the complete GitHub Analyzer frontend and backend services.

## Structure

```
github_analyzer/
├── backend/
│   ├── schemas.py                 # Pydantic request & response models
│   ├── service.py                 # GitHub REST API consumer, language calculator, gap detection
│   ├── router.py                  # FastAPI APIRouter (/github/analyze, /github/results)
│   └── __init__.py
└── frontend/
    ├── components/
    │   ├── GitHubAnalyzer.jsx     # React UI component for GitHub reviews
    │   ├── GitHubAutocomplete.jsx # Instant username search & suggestions
    │   └── GitHubAutocomplete.css # Autocomplete dropdown styling
    ├── pages/
    │   └── GitHubPage.jsx         # Standalone page for /github route
    ├── services/
    │   └── api.js                 # Dedicated GitHub API client
    ├── index.js                   # Unified frontend exports
    └── README.md
```

## Features
- Accepts GitHub Username (e.g. `torvalds`) or Profile Link (`https://github.com/torvalds`)
- Live GitHub REST API querying with optional PAT token via `GITHUB_TOKEN`
- Byte-weighted language percentage calculation
- Top repository star metrics & estimated activity index
- Actionable code quality, testing, and CI/CD gap identification
