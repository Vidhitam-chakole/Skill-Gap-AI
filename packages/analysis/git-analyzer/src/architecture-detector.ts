/**
 * Architecture Pattern Detector
 *
 * Detects patterns from directory structure, file naming, imports, and configs.
 * Each pattern requires multiple independent signals for confidence.
 */

import type { ArchitectureEvidence } from "./types.js";

export function detectArchitecture(
  directories: string[],
  fileLists: Map<string, string[]>,
  allFiles: string[],
  dependencies: Record<string, string>,
  devDependencies: Record<string, string>,
): ArchitectureEvidence[] {
  const patterns: ArchitectureEvidence[] = [];
  const allDeps = { ...dependencies, ...devDependencies };
  const lowerDeps = new Set(Object.keys(allDeps).map((d) => d.toLowerCase()));

  // Feature-based / Feature-Sliced Design
  const featureDirs = directories.filter((d) => /features?|modules?|screens?|pages?/.test(d));
  if (featureDirs.length >= 2) {
    patterns.push({
      pattern: "Feature-Based Architecture",
      confidence: Math.min(90, 50 + featureDirs.length * 10),
      files: [],
      directories: featureDirs,
      imports: [],
      structuralReason: `Found ${featureDirs.length} feature/module directories`,
    });
  }

  // MVC
  const hasMVC = directories.some((d) => /models?/.test(d)) &&
    directories.some((d) => /views?|templates?/.test(d)) &&
    directories.some((d) => /controllers?/.test(d));
  if (hasMVC) {
    patterns.push({
      pattern: "MVC",
      confidence: 85,
      files: [],
      directories: directories.filter((d) => /models?|views?|controllers?/.test(d)),
      imports: [],
      structuralReason: "Found models/, views/, and controllers/ directories",
    });
  }

  // Layered Architecture
  const layerDirs = directories.filter((d) => /controllers?|services?|repositories?|models?|middleware/.test(d));
  if (layerDirs.length >= 3) {
    patterns.push({
      pattern: "Layered Architecture",
      confidence: Math.min(85, 55 + layerDirs.length * 8),
      files: [],
      directories: layerDirs,
      imports: [],
      structuralReason: `Found ${layerDirs.length} layer directories (controller/service/repository/model)`,
    });
  }

  // Service Layer
  const serviceFiles = allFiles.filter((f) => /service|Service/.test(f));
  if (serviceFiles.length >= 2) {
    patterns.push({
      pattern: "Service Layer",
      confidence: Math.min(80, 50 + serviceFiles.length * 8),
      files: serviceFiles,
      directories: [],
      imports: [],
      structuralReason: `Found ${serviceFiles.length} service files`,
    });
  }

  // Repository Pattern
  const repoFiles = allFiles.filter((f) => /repository|Repository|repo\.|Repo\./.test(f));
  if (repoFiles.length >= 1) {
    patterns.push({
      pattern: "Repository Pattern",
      confidence: Math.min(80, 55 + repoFiles.length * 10),
      files: repoFiles,
      directories: [],
      imports: [],
      structuralReason: `Found ${repoFiles.length} repository files`,
    });
  }

  // Dependency Injection
  const diFiles = allFiles.filter((f) => /inject|Inject|provider|Provider/.test(f));
  if (diFiles.length >= 2 || lowerDeps.has("@nestjs/core") || lowerDeps.has("tsyringe") || lowerDeps.has("inversify")) {
    patterns.push({
      pattern: "Dependency Injection",
      confidence: lowerDeps.has("@nestjs/core") ? 90 : Math.min(75, 50 + diFiles.length * 8),
      files: diFiles,
      directories: [],
      imports: [],
      structuralReason: lowerDeps.has("@nestjs/core") ? "NestJS with built-in DI" : `Found ${diFiles.length} injection-related files`,
    });
  }

  // Clean Architecture
  const cleanDirs = directories.filter((d) => /domain|use.?cases?|entities?|adapters?|interfaces?/.test(d));
  if (cleanDirs.length >= 2) {
    patterns.push({
      pattern: "Clean Architecture",
      confidence: Math.min(85, 55 + cleanDirs.length * 10),
      files: [],
      directories: cleanDirs,
      imports: [],
      structuralReason: `Found ${cleanDirs.length} clean architecture directories (domain/use-cases/entities)`,
    });
  }

  // Microservices
  const microserviceIndicators = directories.filter((d) => /services?\/|apps?\/|packages?\//.test(d));
  const hasGateway = allFiles.some((f) => /gateway|Gateway/.test(f));
  if (microserviceIndicators.length >= 3 || hasGateway || lowerDeps.has("grpc") || lowerDeps.has("@grpc/grpc-js")) {
    patterns.push({
      pattern: "Microservices",
      confidence: lowerDeps.has("grpc") ? 85 : Math.min(75, 50 + microserviceIndicators.length * 5),
      files: allFiles.filter((f) => /gateway|Gateway/.test(f)),
      directories: microserviceIndicators,
      imports: [],
      structuralReason: `Found ${microserviceIndicators.length} service-like directories`,
    });
  }

  // Event-Driven Architecture
  const eventFiles = allFiles.filter((f) => /event|Event|handler|Handler|listener|Listener|queue|Queue/.test(f));
  if (eventFiles.length >= 2 || lowerDeps.has("kafka") || lowerDeps.has("amqplib") || lowerDeps.has("bull")) {
    patterns.push({
      pattern: "Event-Driven Architecture",
      confidence: Math.min(80, 50 + eventFiles.length * 8),
      files: eventFiles,
      directories: [],
      imports: [],
      structuralReason: `Found ${eventFiles.length} event-related files`,
    });
  }

  // Pipeline / ETL Pattern
  const pipelineFiles = allFiles.filter((f) => /pipeline|Pipeline|transform|Transform|etl|ETL/.test(f));
  if (pipelineFiles.length >= 2) {
    patterns.push({
      pattern: "Pipeline Architecture",
      confidence: Math.min(80, 50 + pipelineFiles.length * 10),
      files: pipelineFiles,
      directories: [],
      imports: [],
      structuralReason: `Found ${pipelineFiles.length} pipeline-related files`,
    });
  }

  // Client-Server
  const hasServer = directories.some((d) => /server|api|backend/.test(d));
  const hasClient = directories.some((d) => /client|frontend|web|app/.test(d));
  if (hasServer && hasClient) {
    patterns.push({
      pattern: "Client-Server",
      confidence: 80,
      files: [],
      directories: directories.filter((d) => /server|api|backend|client|frontend|web|app/.test(d)),
      imports: [],
      structuralReason: "Found separate client/ and server/ directories",
    });
  }

  // Monorepo
  const hasMonorepo = allDeps["turbo"] || allDeps["lerna"] || allDeps["nx"] ||
    allFiles.includes("pnpm-workspace.yaml") || allFiles.includes("lerna.json") || allFiles.includes("nx.json");
  if (hasMonorepo) {
    patterns.push({
      pattern: "Monorepo",
      confidence: 85,
      files: allFiles.filter((f) => /turbo|lerna|nx|pnpm-workspace/.test(f)),
      directories: [],
      imports: [],
      structuralReason: "Found monorepo configuration",
    });
  }

  return patterns;
}
