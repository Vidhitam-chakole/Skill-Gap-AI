/**
 * Recommendation & Roadmap Service
 * Mock data for Recommendations and Learning Roadmap pages.
 */

import type {
  Recommendation,
  LearningRoadmap,
  LearningRoadmapStep,
  Severity,
} from "@/shared/types";
import { apiClient, endpoints } from "@/shared/api/client";
import { featureFlags } from "@/shared/config/env";

// ============================================================
// Mock Recommendations
// ============================================================

const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    title: "Increase unit test coverage on backend services",
    rationale:
      "Testing coverage is below 30% for critical backend modules (skill-plus-api). The detection heuristic found only 3 test files across 7 service modules. This creates a regression risk when deploying API changes.",
    severity: "high",
    linkedEvidence: [
      { sourceFile: "src/services/", detectionMethod: "file" },
      { sourceFile: "src/__tests__/", detectionMethod: "file" },
    ],
    relatedSkillGaps: ["Testing", "Jest", "Vitest"],
    suggestedNextStep:
      "Start with service-layer unit tests for the auth and repository services, then expand to integration tests.",
  },
  {
    title: "Add CI/CD pipeline for automated deployments",
    rationale:
      "No CI/CD configuration detected. Deployments appear to be manual, which increases the risk of shipping broken code and slows iteration speed.",
    severity: "critical",
    linkedEvidence: [
      { sourceFile: ".github/workflows/", detectionMethod: "file" },
      { sourceFile: "Dockerfile", detectionMethod: "file" },
    ],
    relatedSkillGaps: ["DevOps", "Docker", "GitHub Actions"],
    suggestedNextStep:
      "Set up GitHub Actions with lint → test → build → deploy stages for the main branch.",
  },
  {
    title: "Document the API with OpenAPI/Swagger",
    rationale:
      "The skill-plus-api has 12 endpoints but no API documentation. This makes integration difficult for frontend consumers and external contributors.",
    severity: "medium",
    linkedEvidence: [
      { sourceFile: "src/routes/", detectionMethod: "import" },
      { sourceFile: "package.json", detectionMethod: "manifest" },
    ],
    relatedSkillGaps: ["Documentation", "OpenAPI"],
    suggestedNextStep:
      "Add Swagger JSDoc decorators to existing route handlers and generate an OpenAPI spec.",
  },
  {
    title: "Migrate from Redux to Zustand for client state",
    rationale:
      "The mobile-app uses Redux with heavy boilerplate. Zustand is already used in skill-plus-web and provides a simpler API with less code, improving developer velocity.",
    severity: "low",
    linkedEvidence: [
      { sourceFile: "mobile-app/src/store/", detectionMethod: "file" },
      { sourceFile: "mobile-app/package.json", detectionMethod: "manifest" },
    ],
    relatedSkillGaps: ["State Management", "Zustand"],
    suggestedNextStep:
      "Start by migrating the auth state slice to Zustand, then progressively move other slices.",
  },
  {
    title: "Add end-to-end tests for critical user flows",
    rationale:
      "Playwright is listed as a dependency but only 1 E2E test exists. Critical flows like login, onboarding, and analysis have no E2E coverage.",
    severity: "high",
    linkedEvidence: [
      { sourceFile: "tests/e2e/", detectionMethod: "file" },
      { sourceFile: "playwright.config.ts", detectionMethod: "config" },
    ],
    relatedSkillGaps: ["Testing", "Playwright", "E2E"],
    suggestedNextStep:
      "Write E2E tests for the signup → onboarding → analysis → dashboard flow first.",
  },
];

// ============================================================
// Mock Learning Roadmap
// ============================================================

const MOCK_ROADMAP: LearningRoadmap = {
  totalEstimatedDuration: "8–12 weeks",
  steps: [
    {
      order: 1,
      title: "Master Testing Fundamentals",
      description:
        "Build a solid foundation in testing strategy, unit testing with Vitest, and test-driven development patterns. Focus on the testing pyramid and writing testable code.",
      linkedSkillGaps: ["Testing", "Jest", "Vitest"],
      estimatedDuration: "2 weeks",
      status: "not_started",
    },
    {
      order: 2,
      title: "CI/CD Pipeline Setup",
      description:
        "Learn GitHub Actions to create automated build, test, and deployment pipelines. Understand environment management, secrets, and deployment strategies.",
      linkedSkillGaps: ["DevOps", "GitHub Actions"],
      estimatedDuration: "1 week",
      status: "not_started",
    },
    {
      order: 3,
      title: "E2E Testing with Playwright",
      description:
        "Master Playwright for end-to-end testing. Write tests for critical user flows, handle authentication states, and create reusable page object models.",
      linkedSkillGaps: ["Testing", "Playwright", "E2E"],
      estimatedDuration: "2 weeks",
      status: "not_started",
    },
    {
      order: 4,
      title: "API Documentation & OpenAPI",
      description:
        "Learn to document REST APIs using OpenAPI/Swagger. Generate interactive docs, validate request/response schemas, and integrate with frontend consumers.",
      linkedSkillGaps: ["Documentation", "OpenAPI"],
      estimatedDuration: "1 week",
      status: "not_started",
    },
    {
      order: 5,
      title: "Advanced Docker & Container Orchestration",
      description:
        "Deepen Docker knowledge with multi-stage builds, compose orchestration, health checks, and basic Kubernetes concepts for production deployments.",
      linkedSkillGaps: ["DevOps", "Docker", "Kubernetes"],
      estimatedDuration: "2–3 weeks",
      status: "not_started",
    },
    {
      order: 6,
      title: "Performance Optimization",
      description:
        "Learn profiling, bundle analysis, lazy loading, caching strategies, and database query optimization to improve application performance.",
      linkedSkillGaps: ["Performance", "Optimization"],
      estimatedDuration: "1–2 weeks",
      status: "not_started",
    },
  ],
};

// ============================================================
// Public API
// ============================================================

/**
 * Fetch all recommendations.
 */
export async function fetchRecommendations(): Promise<Recommendation[]> {
  if (featureFlags.engineeringMaturity) {
    return apiClient.get<Recommendation[]>(endpoints.recommendations.list);
  }
  await delay(300);
  return MOCK_RECOMMENDATIONS;
}

/**
 * Fetch the learning roadmap.
 */
export async function fetchLearningRoadmap(): Promise<LearningRoadmap> {
  if (featureFlags.engineeringMaturity) {
    return apiClient.get<LearningRoadmap>(endpoints.roadmap.get);
  }
  await delay(300);
  return MOCK_ROADMAP;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
