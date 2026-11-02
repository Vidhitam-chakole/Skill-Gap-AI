# AI Agent / Mascot Coach — Frontend Module

The frontend client module for the AI Career Agent & PulseBot Mascot Coach of Skill Plus AI.

## Structure

```
ai_agent/frontend/
├── components/
│   ├── MascotCoach.jsx      # Floating roving mascot, interactive speech bubble & slide-out chat window
│   └── MascotCoach.css      # Brutalist comic-strip mascot figure styling & flight animations
├── services/
│   └── api.js               # API client (sendMessage, getHistory)
├── index.js                 # Unified module exports
└── README.md
```

## Exports

- `MascotCoach` (`components/MascotCoach.jsx`): Main React component delivering the roving robot avatar, interactive moods, suggested prompt pills, and multi-turn career coaching chat.
- `chatApi` (`services/api.js`): API client methods for communicating with `/api/chat/*`.

