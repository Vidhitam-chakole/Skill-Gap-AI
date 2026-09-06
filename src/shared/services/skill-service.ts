/**
 * Skill Service
 * Mock data for Skills Explorer and Detail views.
 */

import type {
  Skill,
  SkillDetail,
  SkillCategory,
  EvidenceGroup,
  Evidence,
  SkillRepoReference,
} from "@/shared/types";
import { apiClient, endpoints } from "@/shared/api/client";
import { featureFlags } from "@/shared/config/env";

// ============================================================
// Mock Skills
// ============================================================

const MOCK_SKILLS: Skill[] = [
  {
    name: "TypeScript",
    category: "language",
    confidence: 95,
    evidence: [],
    repoCount: 10,
  },
  {
    name: "React",
    category: "framework",
    confidence: 92,
    evidence: [],
    repoCount: 8,
  },
  {
    name: "Node.js",
    category: "framework",
    confidence: 85,
    evidence: [],
    repoCount: 7,
  },
  {
    name: "Rust",
    category: "language",
    confidence: 62,
    evidence: [],
    repoCount: 3,
  },
  {
    name: "Python",
    category: "language",
    confidence: 48,
    evidence: [],
    repoCount: 3,
  },
  {
    name: "Go",
    category: "language",
    confidence: 55,
    evidence: [],
    repoCount: 2,
  },
  {
    name: "PostgreSQL",
    category: "database",
    confidence: 72,
    evidence: [],
    repoCount: 5,
  },
  {
    name: "Docker",
    category: "devops",
    confidence: 68,
    evidence: [],
    repoCount: 4,
  },
  {
    name: "Tailwind CSS",
    category: "library",
    confidence: 88,
    evidence: [],
    repoCount: 6,
  },
  {
    name: "Zod",
    category: "library",
    confidence: 74,
    evidence: [],
    repoCount: 4,
  },
  {
    name: "TanStack Query",
    category: "library",
    confidence: 70,
    evidence: [],
    repoCount: 5,
  },
  {
    name: "Jest",
    category: "testing",
    confidence: 45,
    evidence: [],
    repoCount: 3,
  },
  {
    name: "Vitest",
    category: "testing",
    confidence: 52,
    evidence: [],
    repoCount: 2,
  },
  {
    name: "Playwright",
    category: "testing",
    confidence: 38,
    evidence: [],
    repoCount: 1,
  },
  {
    name: "Next.js",
    category: "framework",
    confidence: 78,
    evidence: [],
    repoCount: 3,
  },
  {
    name: "Vite",
    category: "devops",
    confidence: 82,
    evidence: [],
    repoCount: 6,
  },
  {
    name: "Recharts",
    category: "library",
    confidence: 65,
    evidence: [],
    repoCount: 2,
  },
  {
    name: "Zustand",
    category: "library",
    confidence: 60,
    evidence: [],
    repoCount: 2,
  },
  {
    name: "Framer Motion",
    category: "library",
    confidence: 58,
    evidence: [],
    repoCount: 2,
  },
  {
    name: "Redis",
    category: "database",
    confidence: 42,
    evidence: [],
    repoCount: 2,
  },
];

// ============================================================
// Skill Detail Mock Data
// ============================================================

function buildSkillDetail(skill: Skill): SkillDetail {
  const detailMap: Record<string, Partial<SkillDetail>> = {
    TypeScript: {
      repos: [
        { repoName: "skill-plus-web", confidence: 98 },
        { repoName: "portfolio-v3", confidence: 95 },
        { repoName: "skill-plus-api", confidence: 90 },
        { repoName: "graphql-gateway", confidence: 88 },
        { repoName: "react-component-lib", confidence: 92 },
        { repoName: "mobile-app", confidence: 75 },
      ],
      evidenceGroups: [
        {
          method: "manifest",
          evidence: [
            { sourceFile: "package.json", line: 3, snippet: '"typescript": "^5.6.0"', detectionMethod: "manifest" },
            { sourceFile: "tsconfig.json", snippet: '"strict": true', detectionMethod: "manifest" },
          ],
          linkedRepos: ["skill-plus-web", "portfolio-v3", "skill-plus-api"],
        },
        {
          method: "import",
          evidence: [
            { sourceFile: "src/app/router.tsx", line: 1, snippet: 'import { createBrowserRouter } from "react-router-dom"', detectionMethod: "import" },
            { sourceFile: "src/shared/types/index.ts", line: 1, snippet: "export interface Developer {", detectionMethod: "import" },
          ],
          linkedRepos: ["skill-plus-web", "portfolio-v3"],
        },
        {
          method: "file",
          evidence: [
            { sourceFile: "*.tsx", snippet: "TypeScript React components", detectionMethod: "file" },
            { sourceFile: "*.ts", snippet: "TypeScript source files", detectionMethod: "file" },
          ],
          linkedRepos: ["skill-plus-web", "skill-plus-api", "react-component-lib"],
        },
        {
          method: "config",
          evidence: [
            { sourceFile: ".eslintrc.js", snippet: "@typescript-eslint/parser", detectionMethod: "config" },
            { sourceFile: "vite.config.ts", snippet: "TypeScript path aliases", detectionMethod: "config" },
          ],
          linkedRepos: ["skill-plus-web", "portfolio-v3"],
        },
      ],
    },
    React: {
      repos: [
        { repoName: "skill-plus-web", confidence: 98 },
        { repoName: "portfolio-v3", confidence: 92 },
        { repoName: "react-component-lib", confidence: 95 },
        { repoName: "mobile-app", confidence: 80 },
      ],
      evidenceGroups: [
        {
          method: "manifest",
          evidence: [
            { sourceFile: "package.json", line: 3, snippet: '"react": "^19.0.0"', detectionMethod: "manifest" },
            { sourceFile: "package.json", line: 4, snippet: '"react-dom": "^19.0.0"', detectionMethod: "manifest" },
          ],
          linkedRepos: ["skill-plus-web", "portfolio-v3", "react-component-lib"],
        },
        {
          method: "import",
          evidence: [
            { sourceFile: "src/app/App.tsx", line: 1, snippet: 'import { BrowserRouter } from "react-router-dom"', detectionMethod: "import" },
            { sourceFile: "src/features/dashboard/components/overview-page.tsx", line: 1, snippet: 'import { useQuery } from "@tanstack/react-query"', detectionMethod: "import" },
          ],
          linkedRepos: ["skill-plus-web", "portfolio-v3"],
        },
        {
          method: "file",
          evidence: [
            { sourceFile: "*.tsx", snippet: "React component files", detectionMethod: "file" },
          ],
          linkedRepos: ["skill-plus-web", "portfolio-v3", "react-component-lib"],
        },
      ],
    },
    Rust: {
      repos: [
        { repoName: "rust-web-server", confidence: 95 },
      ],
      evidenceGroups: [
        {
          method: "manifest",
          evidence: [
            { sourceFile: "Cargo.toml", snippet: '[package]\nname = "rust-web-server"', detectionMethod: "manifest" },
          ],
          linkedRepos: ["rust-web-server"],
        },
        {
          method: "file",
          evidence: [
            { sourceFile: "src/main.rs", snippet: "fn main() {", detectionMethod: "file" },
            { sourceFile: "src/handlers/*.rs", snippet: "async fn handler()", detectionMethod: "file" },
          ],
          linkedRepos: ["rust-web-server"],
        },
        {
          method: "config",
          evidence: [
            { sourceFile: "Cargo.toml", snippet: 'tokio = { version = "1.40", features = ["full"] }', detectionMethod: "config" },
            { sourceFile: ".cargo/config.toml", snippet: "[build]\ntarget = 'x86_64-unknown-linux-gnu'", detectionMethod: "config" },
          ],
          linkedRepos: ["rust-web-server"],
        },
      ],
    },
    Docker: {
      repos: [
        { repoName: "skill-plus-api", confidence: 82 },
        { repoName: "data-pipeline", confidence: 75 },
        { repoName: "terraform-infra", confidence: 70 },
        { repoName: "rust-web-server", confidence: 60 },
      ],
      evidenceGroups: [
        {
          method: "file",
          evidence: [
            { sourceFile: "Dockerfile", snippet: "FROM node:20-alpine AS builder", detectionMethod: "file" },
            { sourceFile: "docker-compose.yml", snippet: "services:\n  api:\n    build: .", detectionMethod: "file" },
          ],
          linkedRepos: ["skill-plus-api", "data-pipeline"],
        },
        {
          method: "config",
          evidence: [
            { sourceFile: ".dockerignore", snippet: "node_modules\ndist", detectionMethod: "config" },
            { sourceFile: "docker-compose.yml", snippet: "ports:\n  - '3000:3000'", detectionMethod: "config" },
          ],
          linkedRepos: ["skill-plus-api"],
        },
      ],
    },
  };

  const detail = detailMap[skill.name];

  return {
    ...skill,
    repos: detail?.repos ?? [
      { repoName: "skill-plus-web", confidence: skill.confidence },
    ],
    evidenceGroups: detail?.evidenceGroups ?? [
      {
        method: "file" as const,
        evidence: [
          { sourceFile: `${skill.name.toLowerCase()}.*`, snippet: `${skill.name} usage detected`, detectionMethod: "file" as const },
        ],
        linkedRepos: ["skill-plus-web"],
      },
    ],
  };
}

// ============================================================
// Public API
// ============================================================

export type SkillSortKey = "name" | "confidence" | "repos" | "category";
export type SkillSortDir = "asc" | "desc";

export interface SkillFilters {
  search: string;
  category: SkillCategory | "all";
  sortBy: SkillSortKey;
  sortDir: SkillSortDir;
}

/**
 * Fetch all skills with filtering and sorting.
 */
export async function fetchSkills(
  filters: SkillFilters,
): Promise<Skill[]> {
  if (featureFlags.structuralGraph) {
    return apiClient.get<Skill[]>(endpoints.skills.list, {
      params: {
        search: filters.search,
        category: filters.category,
        sort: filters.sortBy,
        dir: filters.sortDir,
      },
    });
  }

  await delay(300);
  let results = [...MOCK_SKILLS];

  // Search
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q),
    );
  }

  // Category filter
  if (filters.category !== "all") {
    results = results.filter((s) => s.category === filters.category);
  }

  // Sort
  results.sort((a, b) => {
    let cmp = 0;
    switch (filters.sortBy) {
      case "name":
        cmp = a.name.localeCompare(b.name);
        break;
      case "confidence":
        cmp = a.confidence - b.confidence;
        break;
      case "repos":
        cmp = a.repoCount - b.repoCount;
        break;
      case "category":
        cmp = a.category.localeCompare(b.category);
        break;
    }
    return filters.sortDir === "desc" ? -cmp : cmp;
  });

  return results;
}

/**
 * Fetch unique skill categories for filter.
 */
export async function fetchSkillCategories(): Promise<SkillCategory[]> {
  if (featureFlags.structuralGraph) {
    return apiClient.get<SkillCategory[]>(endpoints.skills.categories);
  }
  await delay(100);
  const cats = new Set(MOCK_SKILLS.map((s) => s.category));
  return Array.from(cats).sort();
}

/**
 * Fetch skill detail by name.
 */
export async function fetchSkillDetail(
  skillName: string,
): Promise<SkillDetail | null> {
  if (featureFlags.structuralGraph) {
    try {
      return await apiClient.get<SkillDetail>(endpoints.skills.detail(skillName));
    } catch {
      return null;
    }
  }
  await delay(400);
  const skill = MOCK_SKILLS.find(
    (s) => s.name.toLowerCase() === skillName.toLowerCase(),
  );
  if (!skill) return null;
  return buildSkillDetail(skill);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
