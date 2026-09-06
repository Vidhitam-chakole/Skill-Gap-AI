# Skill+ Complete Codebase Audit

Generated: September 1, 2026

---

## 1. Repository Overview

| Metric | Value |
|--------|-------|
| Total Files | 101 source files |
| TypeScript (.ts) | 36 files |
| TSX (.tsx) | 65 files |
| Test Files | 6 |
| Feature Pages | 26 |
| Shared Services | 13 |
| Zustand Stores | 3 |
| shadcn/ui Components | 17 |
| Custom Shared Components | 8 |
| Routes | 25+ |
| Backend Code | **0** (no backend exists) |

---

## 2. Frontend Architecture Map

### Entry Points
- `index.html` → loads `src/main.tsx`
- `src/main.tsx` → renders `<App />`
- `src/app/App.tsx` → `<AppProviders>` + `<RouterProvider>`
- `src/app/router.tsx` → 25+ routes with lazy loading

### Providers (src/app/providers/)
1. `error-boundary.tsx` — ErrorBoundary (outermost)
2. `query-provider.tsx` — TanStack QueryProvider
3. `theme-provider.tsx` — ThemeProvider (dark/light/system)
4. `auth-provider.tsx` — AuthProvider (context + Zustand)
5. `notification-provider.tsx` — Toast notification system
6. `index.tsx` — Composes all providers

### Layouts (src/shared/layouts/)
1. `dashboard-shell.tsx` — Sidebar + TopBar + Outlet (Framer Motion animated)
2. `auth-shell.tsx` — Centered brand layout for login/signup
3. `onboarding-shell.tsx` — Wizard with progress stepper

### Feature Modules (src/features/)
Each feature has its own directory under `src/features/`:

| Feature | Directory | Components |
|---------|-----------|------------|
| Auth | `auth/` | landing-page, login-page, signup-page, require-auth |
| Onboarding | `onboarding/` | welcome, career-profile, add-sources, verify-sources, require-onboarding |
| Analysis | `analysis/` | pipeline-page |
| Dashboard | `dashboard/` | overview-page (with Recharts) |
| Repositories | `repositories/` | repository-explorer, repository-detail |
| Skills | `skills/` | skills-explorer, skill-detail |
| Architecture | `architecture/` | architecture-explorer |
| Quality | `quality/` | repository-quality |
| Report | `report/` | engineering-report |
| Recommendations | `recommendations/` | recommendations-page |
| Roadmap | `roadmap/` | learning-roadmap |
| Mentor | `mentor/` | ai-career-mentor |
| Workspace | `workspace/` | learning-workspace |
| Export | `export/` | export-page |
| Settings | `settings/` | settings-page |
| History | `history/` | history-page |
| Recruiter | `recruiter/` | recruiter-view |

### State Management (src/shared/store/)
| Store | Persistence | Purpose |
|-------|-------------|---------|
| `theme-store.ts` | localStorage | dark/light/system theme |
| `sidebar-store.ts` | localStorage | collapsed/expanded sidebar |
| `auth-store.ts` | localStorage | user, isAuthenticated, onboardingComplete, careerProfile, githubConnection |

### Services (src/shared/services/)
All services follow the same pattern: feature-flagged mock/real API toggle.

| Service | File | Feature Flag | Real API Endpoint |
|---------|------|--------------|-------------------|
| Auth | `auth-service.ts` | `authStrategy` | `/api/auth/login`, `/api/auth/signup` |
| Dashboard | `dashboard-service.ts` | `engineeringMaturity` | `/api/dashboard/overview` |
| Repository | `repository-service.ts` | `structuralGraph` | `/api/repos` |
| Skill | `skill-service.ts` | `structuralGraph` | `/api/skills` |
| Architecture | `architecture-service.ts` | `structuralGraph` | `/api/architecture/patterns` |
| Quality | `quality-service.ts` | `structuralGraph` | `/api/quality` |
| Report | `report-service.ts` | `engineeringMaturity` | `/api/report/latest` |
| Recommendation | `recommendation-service.ts` | `engineeringMaturity` | `/api/recommendations` |
| Roadmap | `recommendation-service.ts` | `engineeringMaturity` | `/api/roadmap` |
| Mentor | `mentor-service.ts` | `aiMentor` | `/api/mentor/conversations` |
| History | `history-service.ts` | `analysisHistory` | `/api/history/runs` |
| Settings | `settings-service.ts` | `careerProfile` | `/api/settings` |
| Export | `export-service.ts` | `publicShareLinks` | `/api/export/generate` |
| Workspace | `workspace-service.ts` | `workspacePersistence` | `/api/workspace/boards` |

---

## 3. API Contract Map

### Endpoint Registry (from src/shared/api/client.ts)

```
auth:
  POST /api/auth/login          → { user, token }
  POST /api/auth/signup         → { user, token }
  POST /api/auth/logout         → void
  GET  /api/auth/me             → Developer
  GET  /api/auth/github         → GitHubOAuthState
  GET  /api/auth/github/callback → { valid, username, repoCount }

repos:
  GET  /api/repos               → Repository[]
  GET  /api/repos/:name         → RepositoryDetail
  GET  /api/repos/languages     → string[]
  GET  /api/repos/:name/quality → RepositoryQuality
  GET  /api/repos/:name/architecture → ArchitecturePattern[]

skills:
  GET  /api/skills              → Skill[]
  GET  /api/skills/:name        → SkillDetail
  GET  /api/skills/categories   → SkillCategory[]

architecture:
  GET  /api/architecture/patterns → ArchitecturePattern[]
  GET  /api/architecture/graph    → ArchitectureGraph
  GET  /api/architecture/patterns/:name → ArchitecturePattern

quality:
  GET  /api/quality             → QualityOverview
  GET  /api/quality/:name       → RepositoryQuality

report:
  POST /api/report/generate     → { downloadUrl }
  GET  /api/report/latest       → EngineeringReport
  GET  /api/report/download?format=pdf → file

recommendations:
  GET  /api/recommendations     → Recommendation[]
  POST /api/recommendations/:id/dismiss → void

roadmap:
  GET  /api/roadmap             → LearningRoadmap
  PUT  /api/roadmap/steps/:orderId → LearningRoadmapStep

mentor:
  GET  /api/mentor/conversations → MentorConversation[]
  GET  /api/mentor/conversations/:id/messages → MentorMessage[]
  POST /api/mentor/conversations/:id/send → MentorMessage
  GET  /api/mentor/grounding    → GroundingContext

workspace:
  GET  /api/workspace/boards    → WorkspaceBoard[]
  GET  /api/workspace/boards/:id → WorkspaceBoard
  POST /api/workspace/boards/:id/items → WorkspaceItem
  PUT  /api/workspace/boards/:id/items/:itemId → WorkspaceItem

pipeline:
  POST /api/analysis/start      → PipelineStatus
  GET  /api/analysis/status     → PipelineStatus
  POST /api/analysis/cancel     → void
  POST /api/analysis/retry      → PipelineStatus

history:
  GET  /api/history/runs        → AnalysisRun[]

settings:
  GET  /api/settings            → UserSettings
  PUT  /api/settings            → UserSettings

export:
  POST /api/export/generate     → { downloadUrl, fileSize }
  GET  /api/export/download/:token → file
  POST /api/export/share        → SharedReport

share:
  GET  /api/share/:token        → RecruiterProfile
```

---

## 4. TypeScript Type Map (Reusable Contracts)

All types are in `src/shared/types/index.ts`. These are the **canonical frontend contracts** that the backend must satisfy:

### Core Entities
- `Developer` — username, name, email, avatar, bio, topLanguages, joinDate
- `Repository` — name, description, stars, primaryLanguage, lastUpdated, qualityScore, url, isPrivate
- `RepositoryDetail` extends Repository — readmeSummary, techChips, dependencies, qualitySubScores, architecturePatterns
- `Dependency` — name, version, category
- `Skill` — name, category, confidence, evidence[], repoCount
- `SkillDetail` extends Skill — repos[], evidenceGroups[]
- `SkillRepoReference` — repoName, confidence
- `SkillCategory` — language | framework | library | database | devops | testing
- `Technology` — name, version, detectionSource, confidence, detectedFiles[]
- `ArchitecturePattern` — name, confidence, detectedFiles[], folderModuleRelationships[], whyDetected
- `Evidence` — sourceFile, line?, snippet?, detectionMethod
- `EvidenceDetectionMethod` — manifest | import | file | config | dependency
- `EvidenceGroup` — method, evidence[], linkedRepos[]

### Scores
- `QualitySubScores` — documentation, testing, cicd, structure
- `RepositoryQuality` — repoName, overallScore, subScores, stars, lastUpdated
- `ConfidenceData` — score, contributingSignals[]
- `ConfidenceLevel` — low | medium | high

### Recommendations & Roadmap
- `Recommendation` — title, rationale, severity, linkedEvidence[], relatedSkillGaps[], suggestedNextStep
- `Severity` — critical | high | medium | low
- `LearningRoadmapStep` — order, title, description, linkedSkillGaps[], estimatedDuration, status
- `LearningRoadmap` — steps[], totalEstimatedDuration

### AI Mentor
- `MentorConversation` — id, title, createdAt, updatedAt, messageCount
- `MentorMessage` — id, role, content, createdAt, groundingContext?
- `GroundingContext` — developerProfile, githubAnalysis, skills[], engineeringMaturity, repoQuality, strengths[], weaknesses[], careerGoals[]

### Workspace
- `WorkspaceBoard`, `WorkspaceTab`, `WorkspaceItem`, `WorkspaceItemStatus`

### Pipeline
- `PipelineStage` — queued | cloning | analyzing | synthesizing | complete | failed
- `PipelineStatus` — currentStage, stages[], startedAt, estimatedCompletion?
- `PipelineStageEvent` — stage, startedAt, completedAt?, error?

### History
- `AnalysisRun` — id, date, confidence, repoCount, qualityAvg, status
- `AnalysisDiff`, `SkillDiff`, `QualityDiff`

### Settings
- `UserSettings`, `AccountSettings`, `CareerProfile`, `NotificationPrefs`, `ExperienceLevel`

### Export
- `ExportFormat` — pdf | markdown | json
- `SharedReport` — token, url, expiresAt, recruiterView

### API Wrappers
- `ApiResponse<T>` — data, success, error?, timestamp
- `PaginatedResponse<T>` — data[], total, page, pageSize, hasMore

---

## 5. Feature Flags Map

| Flag | Env Variable | Default | Controls |
|------|-------------|---------|----------|
| `realTimePipeline` | `VITE_FEATURE_REALTIME_PIPELINE` | false | WebSocket pipeline events |
| `engineeringMaturity` | `VITE_FEATURE_ENGINEERING_MATURITY` | false | Developer intelligence, dashboard, report, recommendations |
| `structuralGraph` | `VITE_FEATURE_STRUCTURAL_GRAPH` | false | Skills, repos, architecture, quality APIs |
| `publicShareLinks` | `VITE_FEATURE_PUBLIC_SHARE_LINKS` | false | Share link generation, export |
| `authStrategy` | `VITE_FEATURE_AUTH_STRATEGY` | false | Real auth API vs mock |
| `careerProfile` | `VITE_FEATURE_CAREER_PROFILE` | false | Career profile persistence |
| `githubVerify` | `VITE_FEATURE_GITHUB_VERIFY` | false | GitHub OAuth verification |
| `aiMentor` | `VITE_FEATURE_AI_MENTOR` | false | AI mentor API vs mock |
| `workspacePersistence` | `VITE_FEATURE_WORKSPACE_PERSISTENCE` | false | Workspace board persistence |
| `analysisHistory` | `VITE_FEATURE_ANALYSIS_HISTORY` | false | Analysis history storage |

---

## 6. What Exists vs What's Needed

### ✅ EXISTS (Frontend)
- Complete React app with 25+ routes
- Full design system (Brutalism × Neo-Maximalism)
- All page components (functional with mock data)
- API client with typed endpoints
- Feature flag system
- Zod validation schemas
- Zustand stores
- Framer Motion animations
- Testing setup (Vitest + React Testing Library, 33 tests)
- CI/CD pipeline (GitHub Actions)

### ❌ DOES NOT EXIST (Backend)
- No Express server
- No database (SQLite or PostgreSQL)
- No GitHub OAuth flow
- No Git Analyzer
- No LinkedIn Analyzer
- No Skill Detection Engine
- No Skill Depth Engine
- No Architecture Detector
- No Quality Engine
- No Developer Intelligence Engine
- No Gap Engine
- No Recommendation Engine
- No AI Narrative Layer
- No WebSocket/SSE for real-time pipeline
- No JWT authentication
- No API middleware (validation, rate limiting, CORS)
- No database migrations
- No backend tests

---

## 7. Integration Map

### How Frontend Connects to Backend

```
Frontend Service → featureFlag check → if true: apiClient.get/endpoints → Backend API
                                       if false: mock data
```

### Migration Path
1. Build backend with Express + TypeScript
2. Implement endpoints matching the existing `endpoints` registry
3. Implement Zod validation matching the existing `schemas/forms.ts`
4. Return data matching the existing `types/index.ts`
5. Flip feature flags one by one
6. Frontend automatically uses real data

### No Frontend Changes Needed For:
- Auth (endpoints already defined)
- Repositories (endpoints + types already defined)
- Skills (endpoints + types already defined)
- Architecture (endpoints + types already defined)
- Quality (endpoints + types already defined)
- Report (endpoints + types already defined)
- Recommendations (endpoints + types already defined)
- Roadmap (endpoints + types already defined)
- Mentor (endpoints + types already defined)
- History (endpoints + types already defined)
- Settings (endpoints + types already defined)
- Export (endpoints + types already defined)
- Workspace (endpoints + types already defined)
- Pipeline (endpoints + types already defined)

---

## 8. Backend Default Config

From `src/shared/config/env.ts`:
- API Base URL: `http://localhost:3001`
- WebSocket URL: `ws://localhost:3001`

**The backend must run on port 3001.**
