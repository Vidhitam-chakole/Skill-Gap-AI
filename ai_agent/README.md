# Local AI Agent Module

This folder isolates the complete AI Career Assistant component and service.

## Structure

```
ai_agent/
├── backend/
│   ├── schemas.py      # Pydantic request & response models
│   ├── service.py      # Contextual reasoning engine + optional OpenAI integration
│   ├── router.py       # FastAPI APIRouter (/chat/message, /chat/history)
│   └── __init__.py
└── frontend/
    ├── ChatBot.jsx     # React UI component with dynamic suggestions & chat bubble
    ├── ChatBot.css     # Component styling
    └── README.md
```

## Features
- Runs 100% locally offline with an intelligent, contextual career intelligence rule engine
- Consumes analysis data from both LinkedIn review and GitHub review
- Answers specific queries on code quality, testing, languages, system design, roadmap tasks, and strengths
- Optional OpenAI integration if `OPENAI_API_KEY` is provided in `.env`
