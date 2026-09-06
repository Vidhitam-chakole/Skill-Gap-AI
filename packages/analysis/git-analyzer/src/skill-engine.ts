/**
 * Skill Detection & Depth Engine
 *
 * Goes beyond "React" → detects sub-skills:
 *   React → Components, Hooks, State Management, Routing, Testing, Performance
 *
 * Depth levels:
 *   Level 0 — Mentioned (README/profile only)
 *   Level 1 — Basic Usage (single repo, few files)
 *   Level 2 — Practical Usage (multiple repos, consistent usage)
 *   Level 3 — Intermediate (complex patterns, testing)
 *   Level 4 — Advanced (architecture patterns, optimization)
 *   Level 5 — Expert Evidence (production-grade, contributions, teaching)
 */

import type { TechnologyEvidence, SkillEvidence } from "./types.js";

interface SkillDefinition {
  name: string;
  category: string;
  parent?: string;
  requiresDepth?: number; // minimum depth of parent to detect
  evidenceIndicators: string[];
}

// Skill taxonomy — technologies map to skills
const SKILL_TAXONOMY: SkillDefinition[] = [
  // Frontend
  { name: "React", category: "framework", evidenceIndicators: ["react", "jsx", "tsx", "components"] },
  { name: "React Components", category: "frontend", parent: "React", requiresDepth: 1, evidenceIndicators: ["component", "props", "children"] },
  { name: "React Hooks", category: "frontend", parent: "React", requiresDepth: 1, evidenceIndicators: ["useState", "useEffect", "useCallback", "useMemo", "useRef", "useContext"] },
  { name: "State Management", category: "frontend", parent: "React", requiresDepth: 2, evidenceIndicators: ["zustand", "redux", "store", "reducer", "slice"] },
  { name: "React Testing", category: "testing", parent: "React", requiresDepth: 2, evidenceIndicators: ["testing-library", "jest", "vitest", "render", "screen", "act"] },
  { name: "React Performance", category: "frontend", parent: "React", requiresDepth: 3, evidenceIndicators: ["lazy", "memo", "suspense", "dynamic import", "code splitting"] },
  { name: "Next.js", category: "framework", evidenceIndicators: ["next", "pages/", "app/", "getServerSideProps", "getStaticProps"] },
  { name: "Vue.js", category: "framework", evidenceIndicators: ["vue", "vue-router", "pinia", "vuex", ".vue"] },
  { name: "Angular", category: "framework", evidenceIndicators: ["angular", "@angular", "ng-", "typescript"] },
  { name: "Svelte", category: "framework", evidenceIndicators: ["svelte", ".svelte"] },
  { name: "Tailwind CSS", category: "library", evidenceIndicators: ["tailwind", "className", "bg-", "text-", "flex", "grid"] },

  // Backend
  { name: "Node.js", category: "framework", evidenceIndicators: ["node", "express", "fastify", "koa", "package.json"] },
  { name: "Express", category: "framework", evidenceIndicators: ["express", "router", "middleware", "app.get", "app.post"] },
  { name: "NestJS", category: "framework", evidenceIndicators: ["nestjs", "@Injectable", "@Controller", "decorator"] },
  { name: "REST API Design", category: "backend", evidenceIndicators: ["REST", "endpoint", "router", "GET", "POST", "PUT", "DELETE"] },
  { name: "GraphQL", category: "backend", evidenceIndicators: ["graphql", "schema", "resolver", "query", "mutation"] },
  { name: "tRPC", category: "backend", evidenceIndicators: ["trpc", "router", "procedure", "context"] },
  { name: "Python", category: "language", evidenceIndicators: ["python", ".py", "pip", "requirements.txt"] },
  { name: "FastAPI", category: "framework", evidenceIndicators: ["fastapi", "@app.get", "pydantic"] },
  { name: "Django", category: "framework", evidenceIndicators: ["django", "models.py", "views.py", "urls.py"] },
  { name: "Go", category: "language", evidenceIndicators: ["golang", "go.mod", ".go", "goroutine"] },
  { name: "Rust", category: "language", evidenceIndicators: ["rust", "cargo", ".rs", "Cargo.toml"] },

  // Databases
  { name: "SQL", category: "database", evidenceIndicators: ["sql", "SELECT", "INSERT", "JOIN", "migration"] },
  { name: "PostgreSQL", category: "database", evidenceIndicators: ["postgresql", "postgres", "pg", "psql"] },
  { name: "MongoDB", category: "database", evidenceIndicators: ["mongodb", "mongo", "mongoose", "collection"] },
  { name: "Redis", category: "database", evidenceIndicators: ["redis", "ioredis", "cache", "pub/sub"] },
  { name: "SQLite", category: "database", evidenceIndicators: ["sqlite", "better-sqlite", "sql.js"] },
  { name: "Prisma ORM", category: "database", evidenceIndicators: ["prisma", "schema.prisma", "prisma client"] },
  { name: "Drizzle ORM", category: "database", evidenceIndicators: ["drizzle", "drizzle-orm"] },

  // DevOps
  { name: "Docker", category: "devops", evidenceIndicators: ["docker", "Dockerfile", "docker-compose", "container"] },
  { name: "CI/CD", category: "devops", evidenceIndicators: ["github-actions", "gitlab-ci", "jenkins", "workflow", "pipeline"] },
  { name: "AWS", category: "cloud", evidenceIndicators: ["aws", "s3", "lambda", "ec2", "cloudfront"] },
  { name: "Vercel", category: "cloud", evidenceIndicators: ["vercel", "vercel.json", "edge function"] },
  { name: "Terraform", category: "devops", evidenceIndicators: ["terraform", ".tf", "infrastructure"] },
  { name: "Kubernetes", category: "devops", evidenceIndicators: ["kubernetes", "k8s", "kubectl", "helm"] },

  // Testing
  { name: "Unit Testing", category: "testing", evidenceIndicators: ["test", "spec", "describe", "it(", "expect", "assert"] },
  { name: "Integration Testing", category: "testing", evidenceIndicators: ["integration", "e2e", "cypress", "playwright"] },
  { name: "Test-Driven Development", category: "testing", evidenceIndicators: ["tdd", "red-green", "test-first"] },

  // Architecture
  { name: "API Design", category: "architecture", evidenceIndicators: ["api", "endpoint", "route", "controller", "service"] },
  { name: "Microservices", category: "architecture", evidenceIndicators: ["microservice", "gateway", "service-mesh", "grpc"] },
  { name: "Event-Driven Architecture", category: "architecture", evidenceIndicators: ["event", "queue", "pub-sub", "kafka", "rabbitmq"] },
  { name: "Clean Architecture", category: "architecture", evidenceIndicators: ["clean", "domain", "repository", "use-case", "entity"] },
  { name: "Design Patterns", category: "architecture", evidenceIndicators: ["factory", "singleton", "observer", "strategy", "decorator"] },

  // General
  { name: "TypeScript", category: "language", evidenceIndicators: ["typescript", ".ts", ".tsx", "tsconfig"] },
  { name: "JavaScript", category: "language", evidenceIndicators: ["javascript", ".js", "es6", "es20"] },
  { name: "Git", category: "devops", evidenceIndicators: ["git", "branch", "merge", "commit", "pull request"] },
  { name: "Code Review", category: "process", evidenceIndicators: ["review", "comment", "suggestion", "approve"] },
  { name: "Documentation", category: "process", evidenceIndicators: ["readme", "docs", "jsdoc", "typedoc", "wiki"] },
];

function computeDepth(
  repoCount: number,
  fileCount: number,
  hasTests: boolean,
  hasComplexPatterns: boolean,
  hasProductionIndicators: boolean,
): { level: number; score: number } {
  let score = 0;

  // Base from repo count (0-40 points)
  if (repoCount >= 5) score += 40;
  else if (repoCount >= 3) score += 30;
  else if (repoCount >= 2) score += 20;
  else score += 10;

  // File breadth (0-20 points)
  if (fileCount >= 20) score += 20;
  else if (fileCount >= 10) score += 15;
  else if (fileCount >= 5) score += 10;
  else score += 5;

  // Testing evidence (+15)
  if (hasTests) score += 15;

  // Complex patterns (+15)
  if (hasComplexPatterns) score += 15;

  // Production indicators (+10)
  if (hasProductionIndicators) score += 10;

  score = Math.min(100, score);

  // Map score to level
  let level: number;
  if (score >= 90) level = 5;
  else if (score >= 75) level = 4;
  else if (score >= 55) level = 3;
  else if (score >= 35) level = 2;
  else if (score >= 15) level = 1;
  else level = 0;

  return { level, score };
}

export function detectSkills(
  technologies: TechnologyEvidence[],
  repoNames: string[],
  fileLists: Map<string, string[]>,
): SkillEvidence[] {
  const skills: SkillEvidence[] = [];
  const techNames = new Set(technologies.map((t) => t.name.toLowerCase()));

  for (const skillDef of SKILL_TAXONOMY) {
    // Check if parent skill is met
    if (skillDef.parent && skillDef.requiresDepth !== undefined) {
      const parentSkill = skills.find((s) => s.name === skillDef.parent);
      if (!parentSkill || parentSkill.confidence < skillDef.requiresDepth * 20) continue;
    }

    // Check evidence indicators against technologies and file names
    let matchCount = 0;
    const matchedFiles: string[] = [];
    const matchedRepos: string[] = [];

    for (const indicator of skillDef.evidenceIndicators) {
      // Check if any technology matches
      if (techNames.has(indicator.toLowerCase())) {
        matchCount++;
        continue;
      }

      // Check file lists for evidence
      for (const [repo, files] of fileLists) {
        for (const file of files) {
          if (file.toLowerCase().includes(indicator.toLowerCase())) {
            matchCount++;
            if (!matchedFiles.includes(file)) matchedFiles.push(file);
            if (!matchedRepos.includes(repo)) matchedRepos.push(repo);
          }
        }
      }
    }

    if (matchCount === 0) continue;

    // Compute confidence based on evidence strength
    const confidence = Math.min(100, Math.round(30 + matchCount * 10 + matchedRepos.length * 15));
    const strength = Math.min(100, Math.round(confidence * 0.9));

    // Compute depth
    const hasTests = matchedFiles.some((f) => f.includes("test") || f.includes("spec"));
    const hasComplexPatterns = matchCount >= 3;
    const hasProductionIndicators = matchedRepos.length >= 3;
    const { level, score } = computeDepth(matchedRepos.length, matchedFiles.length, hasTests, hasComplexPatterns, hasProductionIndicators);

    skills.push({
      id: `skill-${skillDef.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      name: skillDef.name,
      category: skillDef.category,
      confidence,
      strength,
      source: "github",
      repository: matchedRepos[0],
      file: matchedFiles[0],
      metadata: {
        depthLevel: level,
        depthScore: score,
        evidenceCount: matchCount,
        repoCount: matchedRepos.length,
        fileCount: matchedFiles.length,
      },
      timestamp: new Date().toISOString(),
    });
  }

  return skills;
}
