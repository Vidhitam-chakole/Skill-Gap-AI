/**
 * Workspace Service
 * Mock data for Learning Workspace page.
 */

import type { WorkspaceBoard, WorkspaceItem } from "@/shared/types";
import { apiClient, endpoints } from "@/shared/api/client";
import { featureFlags } from "@/shared/config/env";

const MOCK_BOARDS: WorkspaceBoard[] = [
  {
    id: "board-1",
    name: "Testing Mastery",
    tabs: [
      {
        id: "tab-1",
        name: "In Progress",
        items: [
          { id: "item-1", title: "Learn Vitest basics", description: "Complete Vitest fundamentals course", status: "in_progress", linkedRoadmapStep: "Master Testing Fundamentals", notes: "Started with the official docs", createdAt: "2026-08-25T10:00:00Z", updatedAt: "2026-08-29T14:00:00Z" },
          { id: "item-2", title: "Write unit tests for auth service", description: "Cover login, signup, and token refresh", status: "in_progress", notes: "3 tests written, need 12 more", createdAt: "2026-08-27T09:00:00Z", updatedAt: "2026-08-29T11:00:00Z" },
        ],
      },
      {
        id: "tab-2",
        name: "Todo",
        items: [
          { id: "item-3", title: "Write integration tests for API routes", description: "Test all 12 endpoints", status: "todo", notes: "", createdAt: "2026-08-25T10:00:00Z", updatedAt: "2026-08-25T10:00:00Z" },
          { id: "item-4", title: "Set up Playwright E2E tests", description: "Write E2E test for signup → dashboard flow", status: "todo", notes: "", createdAt: "2026-08-25T10:00:00Z", updatedAt: "2026-08-25T10:00:00Z" },
        ],
      },
      {
        id: "tab-3",
        name: "Done",
        items: [
          { id: "item-5", title: "Configure Vitest in project", description: "Set up vitest.config.ts and test utilities", status: "done", notes: "Configured with path aliases and React testing library", createdAt: "2026-08-24T10:00:00Z", updatedAt: "2026-08-25T09:00:00Z" },
        ],
      },
    ],
  },
  {
    id: "board-2",
    name: "CI/CD Pipeline",
    tabs: [
      {
        id: "tab-4",
        name: "Research",
        items: [
          { id: "item-6", title: "Compare GitHub Actions vs CircleCI", description: "Evaluate CI/CD platforms", status: "done", notes: "GitHub Actions wins for cost and integration", createdAt: "2026-08-20T10:00:00Z", updatedAt: "2026-08-22T14:00:00Z" },
        ],
      },
      {
        id: "tab-5",
        name: "Todo",
        items: [
          { id: "item-7", title: "Create .github/workflows/ci.yml", description: "Lint, test, build pipeline", status: "todo", notes: "", createdAt: "2026-08-22T14:00:00Z", updatedAt: "2026-08-22T14:00:00Z" },
          { id: "item-8", title: "Set up staging deployment", description: "Auto-deploy to staging on main branch", status: "todo", notes: "", createdAt: "2026-08-22T14:00:00Z", updatedAt: "2026-08-22T14:00:00Z" },
        ],
      },
    ],
  },
];

export async function fetchWorkspaceBoards(): Promise<WorkspaceBoard[]> {
  if (featureFlags.workspacePersistence) {
    return apiClient.get<WorkspaceBoard[]>(endpoints.workspace.boards);
  }
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_BOARDS;
}

export async function createWorkspaceItem(
  boardId: string,
  tabId: string,
  item: Omit<WorkspaceItem, "id" | "createdAt" | "updatedAt">,
): Promise<WorkspaceItem> {
  if (featureFlags.workspacePersistence) {
    return apiClient.post<WorkspaceItem>(endpoints.workspace.items(boardId), { tabId, ...item });
  }
  await new Promise((r) => setTimeout(r, 200));
  return {
    ...item,
    id: "item-" + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
