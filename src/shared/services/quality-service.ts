/**
 * Quality Service
 * Mock data for Repository Quality overview page.
 */

import type { RepositoryQuality, QualitySubScores } from "@/shared/types";
import { apiClient, endpoints } from "@/shared/api/client";
import { featureFlags } from "@/shared/config/env";

const MOCK_QUALITY: RepositoryQuality[] = [
  { repoName: "react-component-lib", overallScore: 91, subScores: { documentation: 95, testing: 88, cicd: 92, structure: 89 }, stars: 178, lastUpdated: "2026-08-05T10:30:00Z" },
  { repoName: "portfolio-v3", overallScore: 88, subScores: { documentation: 92, testing: 70, cicd: 95, structure: 94 }, stars: 567, lastUpdated: "2026-07-15T18:30:00Z" },
  { repoName: "skill-plus-web", overallScore: 82, subScores: { documentation: 78, testing: 65, cicd: 88, structure: 90 }, stars: 342, lastUpdated: "2026-08-29T14:22:00Z" },
  { repoName: "graphql-gateway", overallScore: 74, subScores: { documentation: 68, testing: 62, cicd: 80, structure: 82 }, stars: 201, lastUpdated: "2026-08-22T17:45:00Z" },
  { repoName: "rust-web-server", overallScore: 76, subScores: { documentation: 60, testing: 82, cicd: 70, structure: 85 }, stars: 312, lastUpdated: "2026-08-20T13:55:00Z" },
  { repoName: "skill-plus-api", overallScore: 71, subScores: { documentation: 55, testing: 48, cicd: 72, structure: 78 }, stars: 189, lastUpdated: "2026-08-28T09:15:00Z" },
  { repoName: "data-pipeline", overallScore: 68, subScores: { documentation: 62, testing: 55, cicd: 70, structure: 72 }, stars: 143, lastUpdated: "2026-08-18T12:00:00Z" },
  { repoName: "cli-toolkit", overallScore: 65, subScores: { documentation: 58, testing: 52, cicd: 68, structure: 70 }, stars: 98, lastUpdated: "2026-06-20T11:45:00Z" },
  { repoName: "terraform-infra", overallScore: 59, subScores: { documentation: 50, testing: 45, cicd: 62, structure: 65 }, stars: 67, lastUpdated: "2026-07-28T15:00:00Z" },
  { repoName: "mobile-app", overallScore: 58, subScores: { documentation: 52, testing: 42, cicd: 55, structure: 60 }, stars: 89, lastUpdated: "2026-05-12T09:30:00Z" },
  { repoName: "ml-experiments", overallScore: 54, subScores: { documentation: 48, testing: 38, cicd: 52, structure: 58 }, stars: 234, lastUpdated: "2026-08-10T08:20:00Z" },
  { repoName: "dotfiles", overallScore: 42, subScores: { documentation: 35, testing: 20, cicd: 30, structure: 55 }, stars: 45, lastUpdated: "2026-08-25T16:10:00Z" },
];

export interface QualityOverview {
  repos: RepositoryQuality[];
  averageScore: number;
  bestRepo: string;
  worstRepo: string;
  subScoreAverages: QualitySubScores;
}

export async function fetchQualityOverview(): Promise<QualityOverview> {
  if (featureFlags.structuralGraph) {
    return apiClient.get<QualityOverview>(endpoints.quality.overview);
  }
  await new Promise((r) => setTimeout(r, 300));
  const avg = Math.round(MOCK_QUALITY.reduce((s, r) => s + r.overallScore, 0) / MOCK_QUALITY.length);
  return {
    repos: MOCK_QUALITY,
    averageScore: avg,
    bestRepo: MOCK_QUALITY[0].repoName,
    worstRepo: MOCK_QUALITY[MOCK_QUALITY.length - 1].repoName,
    subScoreAverages: {
      documentation: Math.round(MOCK_QUALITY.reduce((s, r) => s + r.subScores.documentation, 0) / MOCK_QUALITY.length),
      testing: Math.round(MOCK_QUALITY.reduce((s, r) => s + r.subScores.testing, 0) / MOCK_QUALITY.length),
      cicd: Math.round(MOCK_QUALITY.reduce((s, r) => s + r.subScores.cicd, 0) / MOCK_QUALITY.length),
      structure: Math.round(MOCK_QUALITY.reduce((s, r) => s + r.subScores.structure, 0) / MOCK_QUALITY.length),
    },
  };
}
