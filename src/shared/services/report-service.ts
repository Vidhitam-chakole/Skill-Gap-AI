/**
 * Report Service
 * Mock data for the Engineering Report page.
 */

import type { Skill, RepositoryQuality } from "@/shared/types";
import { apiClient, endpoints } from "@/shared/api/client";
import { featureFlags } from "@/shared/config/env";

export interface EngineeringReport {
  generatedAt: string;
  developerName: string;
  overallMaturity: number;
  topStrengths: string[];
  topGaps: string[];
  skillsSummary: { name: string; confidence: number; category: string }[];
  repoQualitySummary: { name: string; score: number }[];
  recommendations: { title: string; priority: string; effort: string }[];
}

const MOCK_REPORT: EngineeringReport = {
  generatedAt: "2026-08-29T15:00:00Z",
  developerName: "Developer",
  overallMaturity: 72,
  topStrengths: [
    "Strong TypeScript expertise (95% confidence across 10 repos)",
    "Full-stack capability with React + Node.js",
    "Active open-source contributor (1.8K+ total stars)",
    "Good architectural patterns (Feature-Sliced Design, Middleware)",
  ],
  topGaps: [
    "Testing coverage below 30% on backend services",
    "No CI/CD pipeline detected",
    "Limited DevOps/container orchestration experience",
    "No API documentation",
  ],
  skillsSummary: [
    { name: "TypeScript", confidence: 95, category: "language" },
    { name: "React", confidence: 92, category: "framework" },
    { name: "Node.js", confidence: 85, category: "framework" },
    { name: "PostgreSQL", confidence: 72, category: "database" },
    { name: "Docker", confidence: 68, category: "devops" },
    { name: "Rust", confidence: 62, category: "language" },
    { name: "Go", confidence: 55, category: "language" },
    { name: "Python", confidence: 48, category: "language" },
  ],
  repoQualitySummary: [
    { name: "react-component-lib", score: 91 },
    { name: "portfolio-v3", score: 88 },
    { name: "skill-plus-web", score: 82 },
    { name: "rust-web-server", score: 76 },
    { name: "graphql-gateway", score: 74 },
    { name: "skill-plus-api", score: 71 },
    { name: "data-pipeline", score: 68 },
    { name: "cli-toolkit", score: 65 },
  ],
  recommendations: [
    { title: "Set up CI/CD pipeline", priority: "Critical", effort: "1 week" },
    { title: "Increase test coverage to 60%+", priority: "High", effort: "2 weeks" },
    { title: "Document API with OpenAPI", priority: "Medium", effort: "1 week" },
    { title: "Write architecture decision records", priority: "Medium", effort: "1 week" },
  ],
};

export async function fetchEngineeringReport(): Promise<EngineeringReport> {
  if (featureFlags.engineeringMaturity) {
    return apiClient.get<EngineeringReport>(endpoints.report.latest);
  }
  await new Promise((r) => setTimeout(r, 400));
  return MOCK_REPORT;
}

export async function generateReport(): Promise<{ downloadUrl: string }> {
  if (featureFlags.engineeringMaturity) {
    return apiClient.post(endpoints.report.generate);
  }
  await new Promise((r) => setTimeout(r, 2000));
  return { downloadUrl: "#mock-download" };
}
