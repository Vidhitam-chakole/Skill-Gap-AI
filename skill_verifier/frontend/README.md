# Skill Verifier — Frontend Module

The frontend client module for the interactive anti-AI coding assessment & technical skill verification feature of Skill Plus AI.

## Structure

```
skill_verifier/frontend/
├── components/
│   ├── SkillVerifier.jsx      # Diagnostic test runner, question navigator, radar scoring & deep explanations
│   └── SkillVerifier.css      # Brutalist styling for code blocks & verification verdicts
├── pages/
│   └── VerifierPage.jsx       # Dedicated standalone page layout for /verifier
├── services/
│   └── api.js                 # API client (getLanguages, generateQuiz, submitQuiz, getResult)
├── index.js                   # Unified module exports
└── README.md
```

## Exports

- `SkillVerifier` (`components/SkillVerifier.jsx`): Main React component delivering timed questions, code execution snippets, and authenticity verdicts.
- `VerifierPage` (`pages/VerifierPage.jsx`): Dedicated full-page view for the `/verifier` route.
- `skillVerifierApi` (`services/api.js`): API client methods for communicating with `/api/skill-verifier/*`.

