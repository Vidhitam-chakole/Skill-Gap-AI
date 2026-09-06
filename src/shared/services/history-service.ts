/**
 * History Service
 * Mock data for Analysis History page.
 */

import type { AnalysisRun } from "@/shared/types";
import { apiClient, endpoints } from "@/shared/api/client";
import { featureFlags } from "@/shared/config/env";

const MOCK_RUNS: AnalysisRun[] = [
  { id: "run-5", date: "2026-08-29T15:00:00Z", confidence: 78, repoCount: 12, qualityAvg: 72, status: "complete" },
  { id: "run-4", date: "2026-08-15T10:30:00Z", confidence: 72, repoCount: 11, qualityAvg: 68, status: "complete" },
  { id: "run-3", date: "2026-08-01T14:00:00Z", confidence: 65, repoCount: 10, qualityAvg: 62, status: "complete" },
  { id: "run-2", date: "2026-07-15T09:00:00Z", confidence: 58, repoCount: 9, qualityAvg: 55, status: "complete" },
  { id: "run-1", date: "2026-07-01T16:00:00Z", confidence: 45, repoCount: 8, qualityAvg: 48, status: "complete" },
];

export async function fetchAnalysisRuns(): Promise<AnalysisRun[]> {
  if (featureFlags.analysisHistory) {
    return apiClient.get<AnalysisRun[]>(endpoints.history.runs);
  }
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_RUNS;
}
