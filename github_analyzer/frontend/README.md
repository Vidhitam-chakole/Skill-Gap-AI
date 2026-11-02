# GitHub Analyzer — Frontend Module

The frontend client module for the GitHub Profile & Repository Analyzer feature of Skill Plus AI.

## Structure

```
github_analyzer/frontend/
├── components/
│   ├── GitHubAnalyzer.jsx       # Repository cards, language distribution bar, code audit UI
│   ├── GitHubAutocomplete.jsx   # Live GitHub username search & avatar dropdown
│   └── GitHubAutocomplete.css   # Neo-brutalist autocomplete styling
├── pages/
│   └── GitHubPage.jsx           # Dedicated standalone page layout for /github
├── services/
│   └── api.js                   # API client (analyze, getResult, getProfileHints)
├── index.js                     # Unified module exports
└── README.md
```

## Exports

- `GitHubAnalyzer` (`components/GitHubAnalyzer.jsx`): Main React component displaying repository star counts, commit activity, language breakdowns, and code quality audits.
- `GitHubAutocomplete` (`components/GitHubAutocomplete.jsx`): Debounced search input offering instant suggestions and avatar previews.
- `GitHubPage` (`pages/GitHubPage.jsx`): Dedicated full-page view for the `/github` route.
- `gitHubApi` (`services/api.js`): API client methods for communicating with `/api/github/*`.

