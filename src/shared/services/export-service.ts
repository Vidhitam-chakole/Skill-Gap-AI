/**
 * Export Service
 * Mock data for Export page.
 */

import type { ExportFormat, SharedReport } from "@/shared/types";
import { apiClient, endpoints } from "@/shared/api/client";
import { featureFlags } from "@/shared/config/env";

export async function generateExport(format: ExportFormat): Promise<{ downloadUrl: string; fileSize: string }> {
  if (featureFlags.publicShareLinks) {
    return apiClient.post(endpoints.report.generate, { format });
  }
  await new Promise((r) => setTimeout(r, 2000));
  const sizes: Record<ExportFormat, string> = { pdf: "2.4 MB", markdown: "128 KB", json: "84 KB" };
  return { downloadUrl: `#mock-${format}`, fileSize: sizes[format] };
}

export async function generateShareLink(): Promise<SharedReport> {
  if (featureFlags.publicShareLinks) {
    return apiClient.post<SharedReport>(endpoints.export.share);
  }
  await new Promise((r) => setTimeout(r, 1500));
  return {
    token: "share-" + Date.now(),
    url: `https://skill+.app/share/mock-token`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    recruiterView: false,
  };
}
