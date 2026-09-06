/**
 * Architecture Service
 * Mock data for Architecture Explorer page.
 */

import type { ArchitecturePattern } from "@/shared/types";
import { apiClient, endpoints } from "@/shared/api/client";
import { featureFlags } from "@/shared/config/env";

export interface ArchitectureNode {
  id: string;
  label: string;
  type: "repo" | "pattern" | "technology";
  confidence?: number;
  children?: string[];
}

export interface ArchitectureLink {
  source: string;
  target: string;
  strength: number;
}

export interface ArchitectureGraph {
  nodes: ArchitectureNode[];
  links: ArchitectureLink[];
}

const MOCK_PATTERNS: ArchitecturePattern[] = [
  { name: "Feature-Sliced Design", confidence: 88, detectedFiles: ["src/features/", "src/shared/", "src/app/"], folderModuleRelationships: ["features → shared", "app → features"], whyDetected: "Clear layer boundaries with features/, shared/, and app/ directories." },
  { name: "Component Composition", confidence: 82, detectedFiles: ["src/shared/components/", "src/components/ui/"], folderModuleRelationships: ["shared/components → features"], whyDetected: "Reusable UI primitives composed into domain-specific components." },
  { name: "Middleware Pattern", confidence: 90, detectedFiles: ["src/middleware/"], folderModuleRelationships: ["middleware → handlers"], whyDetected: "Tower middleware stack for auth, rate limiting, and logging." },
  { name: "App Router", confidence: 95, detectedFiles: ["app/page.tsx", "app/layout.tsx", "app/blog/"], folderModuleRelationships: ["app → components", "app → lib"], whyDetected: "Next.js App Router with nested layouts and server components." },
  { name: "Content Layer", confidence: 85, detectedFiles: ["content/", "app/blog/"], folderModuleRelationships: ["content → app/blog"], whyDetected: "MDX content files processed through a dedicated content layer." },
  { name: "Layered Architecture", confidence: 78, detectedFiles: ["src/handlers/", "src/services/", "src/models/"], folderModuleRelationships: ["handlers → services → models"], whyDetected: "Clear separation between HTTP handlers, business logic, and data models." },
  { name: "Monorepo Structure", confidence: 72, detectedFiles: ["packages/", "apps/"], folderModuleRelationships: ["apps → packages"], whyDetected: "Multiple applications sharing common packages in a monorepo." },
  { name: "Repository Pattern", confidence: 65, detectedFiles: ["src/repositories/"], folderModuleRelationships: ["repositories → models"], whyDetected: "Data access layer abstracted behind repository interfaces." },
];

const MOCK_GRAPH: ArchitectureGraph = {
  nodes: [
    { id: "skill-plus-web", label: "skill-plus-web", type: "repo" },
    { id: "skill-plus-api", label: "skill-plus-api", type: "repo" },
    { id: "portfolio-v3", label: "portfolio-v3", type: "repo" },
    { id: "rust-web-server", label: "rust-web-server", type: "repo" },
    { id: "fsd", label: "Feature-Sliced Design", type: "pattern", confidence: 88 },
    { id: "middleware", label: "Middleware Pattern", type: "pattern", confidence: 90 },
    { id: "app-router", label: "App Router", type: "pattern", confidence: 95 },
    { id: "layered", label: "Layered Architecture", type: "pattern", confidence: 78 },
    { id: "typescript", label: "TypeScript", type: "technology", confidence: 95 },
    { id: "react", label: "React", type: "technology", confidence: 92 },
    { id: "rust", label: "Rust", type: "technology", confidence: 62 },
    { id: "node", label: "Node.js", type: "technology", confidence: 85 },
  ],
  links: [
    { source: "skill-plus-web", target: "fsd", strength: 88 },
    { source: "skill-plus-web", target: "typescript", strength: 95 },
    { source: "skill-plus-web", target: "react", strength: 92 },
    { source: "skill-plus-api", target: "middleware", strength: 90 },
    { source: "skill-plus-api", target: "typescript", strength: 90 },
    { source: "skill-plus-api", target: "node", strength: 85 },
    { source: "portfolio-v3", target: "app-router", strength: 95 },
    { source: "portfolio-v3", target: "typescript", strength: 88 },
    { source: "rust-web-server", target: "layered", strength: 78 },
    { source: "rust-web-server", target: "rust", strength: 62 },
    { source: "rust-web-server", target: "middleware", strength: 90 },
    { source: "skill-plus-web", target: "skill-plus-api", strength: 75 },
  ],
};

export async function fetchArchitecturePatterns(): Promise<ArchitecturePattern[]> {
  if (featureFlags.structuralGraph) {
    return apiClient.get<ArchitecturePattern[]>(endpoints.architecture.patterns);
  }
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_PATTERNS;
}

export async function fetchArchitectureGraph(): Promise<ArchitectureGraph> {
  if (featureFlags.structuralGraph) {
    return apiClient.get<ArchitectureGraph>(endpoints.architecture.graph);
  }
  await new Promise((r) => setTimeout(r, 400));
  return MOCK_GRAPH;
}
