/**
 * @skillplus/git-analyzer
 *
 * Filesystem-based git repository analyzer.
 * Analyzes repository directories to detect technologies, skills,
 * architecture patterns, and quality scores.
 */

export { analyzeRepositories, type AnalyzeOptions } from "./analyzer.js";
export { scanRepository, type ScannedRepo } from "./scanner.js";
export { detectLanguages, detectTechnologiesFromDependencies, detectTechnologiesFromConfig, detectTechnologiesFromCI } from "./technology-detector.js";
export { detectSkills } from "./skill-engine.js";
export { detectArchitecture } from "./architecture-detector.js";
export { calculateQuality } from "./quality-engine.js";
export type {
  TechnologyEvidence,
  SkillEvidence,
  ArchitectureEvidence,
  QualityEvidence,
  RepositoryAnalysis,
  GitAnalysisResult,
} from "./types.js";
