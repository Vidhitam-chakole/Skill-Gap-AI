# PROGRESS — SkillGap AI

## Current Status & Architecture

1. **LinkedIn Profile & Resume PDF Review (`linkedin_analyzer/`)**:
   - Built-in step-by-step guidance card on how to download the LinkedIn profile PDF via **More → Save to PDF**.
   - Input: **LinkedIn Profile PDF export (`.pdf`)** + **LinkedIn Name** for context (also supports name/URL analysis mode).
   - Powered by `pypdf` on the backend, extracting verified headline, skills, experience, and detecting technical skill gaps against modern industry standards.

2. **GitHub Review (`github_analyzer/`)**:
   - Real-time GitHub REST API query via profile link or username.
   - Live repository inspection, language distribution, star metrics, and code gap discovery.

3. **Roadmap Module (`roadmap/`)**:
   - Real synthesis combining the parsed LinkedIn PDF and GitHub reviews into a deduplicated, prioritized 4-week sprint plan.

4. **Local AI Agent (`ai_agent/`)**:
   - 100% local context-driven reasoning engine primed with the verified LinkedIn PDF content and GitHub repository findings.
   - Answers review questions, roadmap actions, and career development queries.

5. **No Mock Data**:
   - All mock data (`mockData.js`) and mock toggles have been removed. The entire flow runs on real live API calls.
   - One-Click profile scanner removed to maintain clean separate sections for LinkedIn and GitHub reviews.
