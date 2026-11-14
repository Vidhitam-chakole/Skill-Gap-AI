# Local AI Agent Module
# Local AI Agent / Mascot Coach Module

This folder isolates the complete AI Career Assistant component and service.
This folder isolates the complete AI Career Assistant and PulseBot Mascot Coach frontend and backend services.

## Structure

```
ai_agent/
├── backend/
│   ├── schemas.py      # Pydantic request & response models
│   ├── service.py      # Contextual reasoning engine + optional OpenAI integration
│   ├── router.py       # FastAPI APIRouter (/chat/message, /chat/history)
│   ├── schemas.py           # Pydantic request & response models
│   ├── service.py           # Contextual reasoning engine + optional LLM integration
│   ├── router.py            # FastAPI APIRouter (/chat/message, /chat/history)
│   └── __init__.py
└── frontend/
    ├── ChatBot.jsx     # React UI component with dynamic suggestions & chat bubble
    ├── ChatBot.css     # Component styling
    ├── components/
    │   ├── MascotCoach.jsx  # Floating roving mascot, speech bubbles & slide-out chat window
    │   └── MascotCoach.css  # Brutalist comic robot figure styling & animations
    ├── services/
    │   └── api.js           # Dedicated AI Agent API client
    ├── index.js             # Unified frontend exports
    └── README.md
```

## Features
- Runs 100% locally offline with an intelligent, contextual career intelligence rule engine
- Consumes analysis data from both LinkedIn review and GitHub review
- Answers specific queries on code quality, testing, languages, system design, roadmap tasks, and strengths
- Optional OpenAI integration if `OPENAI_API_KEY` is provided in `.env`
- Contextual career intelligence rule engine combined with Groq / OpenAI LLM streaming
- Consumes real signals from both LinkedIn review and GitHub review
- Answers specific queries on code quality, testing, languages, system design, and interview prep
- Roving companion avatar with interactive moods, flight unit animations, and instant prompt chips
