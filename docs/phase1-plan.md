# Skill+ Phase 1 — Backend Foundation

## Objective
Create the Express + TypeScript backend that the frontend already expects.

## Scope
Phase 1 ONLY covers:
1. Express server with TypeScript
2. SQLite database with Drizzle ORM
3. Database schema matching all frontend types
4. Basic CRUD routes for all API endpoints
5. JWT authentication middleware
6. CORS, Helmet, rate limiting
7. Error handling middleware
8. Feature flag environment config

## What Phase 1 Does NOT Cover
- Git Analyzer (Phase 4)
- LinkedIn Analyzer (Phase 7)
- Intelligence Engines (Phase 8-10)
- AI Layer (Phase 12)
- WebSocket (Phase 11)
- PDF Export (Phase 13)

## Directory Structure

```
skill-plus/
├── apps/
│   ├── web/              → existing frontend (move here)
│   └── api/              → NEW backend
│       ├── src/
│       │   ├── index.ts          → server entry point
│       │   ├── app.ts            → Express app setup
│       │   ├── config/
│       │   │   ├── env.ts        → environment variables
│       │   │   └── database.ts   → database connection
│       │   ├── routes/
│       │   │   ├── auth.ts
│       │   │   ├── repos.ts
│       │   │   ├── skills.ts
│       │   │   ├── architecture.ts
│       │   │   ├── quality.ts
│       │   │   ├── report.ts
│       │   │   ├── recommendations.ts
│       │   │   ├── roadmap.ts
│       │   │   ├── mentor.ts
│       │   │   ├── workspace.ts
│       │   │   ├── pipeline.ts
│       │   │   ├── history.ts
│       │   │   ├── settings.ts
│       │   │   ├── export.ts
│       │   │   └── share.ts
│       │   ├── middleware/
│       │   │   ├── auth.ts       → JWT verification
│       │   │   ├── validate.ts   → Zod request validation
│       │   │   ├── error.ts      → error handler
│       │   │   └── rate-limit.ts
│       │   ├── db/
│       │   │   ├── schema.ts     → Drizzle schema
│       │   │   ├── migrate.ts    → migration runner
│       │   │   └── seed.ts       → seed data
│       │   └── services/
│       │       └── (stubs for Phase 4+)
│       ├── drizzle.config.ts
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   └── contracts/         → shared types (Phase 2+)
```

## Implementation Steps

### Step 1: Create backend project structure
- `apps/api/` directory
- `package.json` with Express, TypeScript, Drizzle, etc.
- `tsconfig.json`
- `drizzle.config.ts`

### Step 2: Express server setup
- `src/app.ts` — Express app with middleware
- `src/index.ts` — Server startup on port 3001
- CORS, Helmet, JSON body parsing
- Health check endpoint

### Step 3: Database schema (Drizzle + SQLite)
- Users table
- Repositories table
- Skills table
- Evidence table
- Quality scores table
- Architecture patterns table
- Analysis runs table
- Settings table
- Workspace tables
- Mentor tables
- Relationships

### Step 4: Authentication
- JWT token generation
- Login/signup routes
- Auth middleware
- Password hashing (bcrypt)

### Step 5: Core API routes (CRUD stubs)
- Each route returns data matching frontend types
- Zod validation on request bodies
- Proper HTTP status codes
- Structured error responses

### Step 6: Middleware
- Error handler (structured errors)
- Rate limiter
- Request logger
- CORS configuration

### Step 7: Environment config
- `.env.example` with all required variables
- Feature flags (all enabled for backend)
- Database URL
- JWT secret
- GitHub OAuth credentials (placeholder)

### Step 8: Testing
- Unit tests for middleware
- Integration tests for auth flow
- API contract tests

## Dependencies

```json
{
  "express": "^5.1.0",
  "typescript": "~5.7.0",
  "drizzle-orm": "^0.38.0",
  "better-sqlite3": "^11.0.0",
  "drizzle-kit": "^0.30.0",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3",
  "zod": "^3.25.0",
  "helmet": "^8.0.0",
  "cors": "^2.8.5",
  "express-rate-limit": "^7.0.0",
  "dotenv": "^16.0.0",
  "tsx": "^4.0.0"
}
```

## Success Criteria
- [ ] Server starts on port 3001
- [ ] All API endpoints respond with correct types
- [ ] Auth flow works (signup → login → token → protected routes)
- [ ] Database schema matches frontend types
- [ ] Frontend can connect (flip feature flags → real data)
- [ ] TypeScript compiles cleanly
- [ ] Tests pass
- [ ] No secrets in frontend
