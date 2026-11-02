# LinkedIn Analyzer — Frontend Module

The frontend client module for the LinkedIn Profile Analyzer feature of Skill Plus AI.

## Structure

```
linkedin_analyzer/frontend/
├── components/
│   ├── LinkedInAnalyzer.jsx   # Interactive upload dropzone, analysis results & breakdown UI
│   └── Analyzer.css           # Neo-brutalist component styling
├── pages/
│   └── LinkedInPage.jsx       # Dedicated standalone page layout for /linkedin
├── services/
│   └── api.js                 # API client (analyzePdf, analyzeProfile, getResult)
├── index.js                   # Unified module exports
└── README.md
```

## Exports

- `LinkedInAnalyzer` (`components/LinkedInAnalyzer.jsx`): Main React component featuring PDF upload drag-and-drop, step-by-step export guide, and real-time skill gap visualizations.
- `LinkedInPage` (`pages/LinkedInPage.jsx`): Standalone full-page view integrated into the app router.
- `linkedInApi` (`services/api.js`): Lightweight API client handling requests to `/api/linkedin/analyze-pdf`, `/api/linkedin/analyze`, and `/api/linkedin/results/:id`.

