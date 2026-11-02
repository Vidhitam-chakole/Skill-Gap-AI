# Career Roadmap — Frontend Module

The frontend client module for the Adaptive AI Career Roadmap feature of Skill Plus AI.

## Structure

```
roadmap/frontend/
├── components/
│   ├── Roadmap.jsx       # Sprint milestones, progress tracker, interactive task toggles UI
│   └── Roadmap.css       # Neo-brutalist milestone styling & progress badges
├── pages/
│   └── RoadmapPage.jsx   # Standalone page layout for /roadmap route
├── services/
│   └── api.js            # API client (build, getById)
├── index.js              # Unified module exports
└── README.md
```

## Exports

- `Roadmap` (`components/Roadmap.jsx`): Main React component displaying dynamic milestone sprints, career readiness score meter, and task checklist.
- `RoadmapPage` (`pages/RoadmapPage.jsx`): Dedicated full-page view for the `/roadmap` route.
- `roadmapApi` (`services/api.js`): API client methods for communicating with `/api/roadmap/*`.

