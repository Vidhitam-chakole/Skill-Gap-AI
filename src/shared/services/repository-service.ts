/**
 * Repository Service
 * Mock data for Repository Explorer and Detail views.
 * Swaps to real API when backend is ready.
 */

import type {
  Repository,
  RepositoryDetail,
  SkillCategory,
} from "@/shared/types";
import { apiClient, endpoints } from "@/shared/api/client";
import { featureFlags } from "@/shared/config/env";

const MOCK_REPOSITORIES: Repository[] = [
  { name: "skill-plus-web", description: "Main web application — React + TypeScript SPA for Skill+", stars: 342, primaryLanguage: "TypeScript", lastUpdated: "2026-08-29T14:22:00Z", qualityScore: 82, url: "https://github.com/user/skill-plus-web", isPrivate: false },
  { name: "skill-plus-api", description: "Backend REST API — Node.js + Express service layer", stars: 189, primaryLanguage: "TypeScript", lastUpdated: "2026-08-28T09:15:00Z", qualityScore: 71, url: "https://github.com/user/skill-plus-api", isPrivate: false },
  { name: "portfolio-v3", description: "Personal portfolio — Next.js with MDX blog and dark mode", stars: 567, primaryLanguage: "TypeScript", lastUpdated: "2026-07-15T18:30:00Z", qualityScore: 88, url: "https://github.com/user/portfolio-v3", isPrivate: false },
  { name: "cli-toolkit", description: "Developer CLI utilities — file generation, project scaffolding", stars: 98, primaryLanguage: "Go", lastUpdated: "2026-06-20T11:45:00Z", qualityScore: 65, url: "https://github.com/user/cli-toolkit", isPrivate: false },
  { name: "ml-experiments", description: "Machine learning experiments — PyTorch transformers and fine-tuning", stars: 234, primaryLanguage: "Python", lastUpdated: "2026-08-10T08:20:00Z", qualityScore: 54, url: "https://github.com/user/ml-experiments", isPrivate: false },
  { name: "dotfiles", description: "Personal dotfiles — Neovim, tmux, zsh configuration", stars: 45, primaryLanguage: "Shell", lastUpdated: "2026-08-25T16:10:00Z", qualityScore: 42, url: "https://github.com/user/dotfiles", isPrivate: false },
  { name: "rust-web-server", description: "High-performance HTTP server built with Tokio and Axum", stars: 312, primaryLanguage: "Rust", lastUpdated: "2026-08-20T13:55:00Z", qualityScore: 76, url: "https://github.com/user/rust-web-server", isPrivate: false },
  { name: "react-component-lib", description: "Reusable UI component library — Radix + Tailwind + Storybook", stars: 178, primaryLanguage: "TypeScript", lastUpdated: "2026-08-05T10:30:00Z", qualityScore: 91, url: "https://github.com/user/react-component-lib", isPrivate: false },
  { name: "terraform-infra", description: "Infrastructure as Code — AWS ECS, RDS, CloudFront setup", stars: 67, primaryLanguage: "HCL", lastUpdated: "2026-07-28T15:00:00Z", qualityScore: 59, url: "https://github.com/user/terraform-infra", isPrivate: true },
  { name: "data-pipeline", description: "ETL pipeline for analytics — Airflow + dbt + Snowflake", stars: 143, primaryLanguage: "Python", lastUpdated: "2026-08-18T12:00:00Z", qualityScore: 68, url: "https://github.com/user/data-pipeline", isPrivate: false },
  { name: "mobile-app", description: "React Native cross-platform mobile app — fitness tracker", stars: 89, primaryLanguage: "TypeScript", lastUpdated: "2026-05-12T09:30:00Z", qualityScore: 58, url: "https://github.com/user/mobile-app", isPrivate: false },
  { name: "graphql-gateway", description: "GraphQL API gateway — Apollo Federation v2 microservices", stars: 201, primaryLanguage: "TypeScript", lastUpdated: "2026-08-22T17:45:00Z", qualityScore: 74, url: "https://github.com/user/graphql-gateway", isPrivate: false },
];

function buildDetail(repo: Repository): RepositoryDetail {
  return {
    ...repo,
    readmeSummary: `Repository for ${repo.name} — a ${repo.primaryLanguage} project.`,
    techChips: [repo.primaryLanguage],
    dependencies: [{ name: repo.primaryLanguage.toLowerCase(), version: "latest", category: "language" as SkillCategory }],
    qualitySubScores: {
      documentation: Math.floor(repo.qualityScore * 0.9),
      testing: Math.floor(repo.qualityScore * 0.7),
      cicd: Math.floor(repo.qualityScore * 0.85),
      structure: Math.floor(repo.qualityScore * 1.05),
    },
    architecturePatterns: [
      { name: "Standard Layout", confidence: 50, detectedFiles: ["src/"], folderModuleRelationships: [], whyDetected: "Default project structure detected." },
    ],
  };
}

export type RepoSortKey = "name" | "quality" | "stars" | "updated";
export type RepoSortDir = "asc" | "desc";

export interface RepoFilters {
  search: string;
  language: string | "all";
  sortBy: RepoSortKey;
  sortDir: RepoSortDir;
}

export async function fetchRepositories(filters: RepoFilters): Promise<Repository[]> {
  if (featureFlags.structuralGraph) {
    return apiClient.get<Repository[]>(endpoints.repos.list, {
      params: {
        search: filters.search,
        language: filters.language,
        sort: filters.sortBy,
        dir: filters.sortDir,
      },
    });
  }

  await delay(300);
  let results = [...MOCK_REPOSITORIES];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter((r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }
  if (filters.language !== "all") {
    results = results.filter((r) => r.primaryLanguage === filters.language);
  }
  results.sort((a, b) => {
    let cmp = 0;
    switch (filters.sortBy) {
      case "name": cmp = a.name.localeCompare(b.name); break;
      case "quality": cmp = a.qualityScore - b.qualityScore; break;
      case "stars": cmp = a.stars - b.stars; break;
      case "updated": cmp = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime(); break;
    }
    return filters.sortDir === "desc" ? -cmp : cmp;
  });
  return results;
}

export async function fetchRepoLanguages(): Promise<string[]> {
  if (featureFlags.structuralGraph) {
    return apiClient.get<string[]>(endpoints.repos.languages);
  }
  await delay(100);
  return Array.from(new Set(MOCK_REPOSITORIES.map((r) => r.primaryLanguage))).sort();
}

export async function fetchRepositoryDetail(repoName: string): Promise<RepositoryDetail | null> {
  if (featureFlags.structuralGraph) {
    try {
      return await apiClient.get<RepositoryDetail>(endpoints.repos.detail(repoName));
    } catch {
      return null;
    }
  }
  await delay(400);
  const repo = MOCK_REPOSITORIES.find((r) => r.name === repoName);
  if (!repo) return null;
  return buildDetail(repo);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
