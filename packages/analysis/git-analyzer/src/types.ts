/**
 * Normalized Evidence Types
 * Every analyzer produces these — intelligence engines consume them.
 */

export interface TechnologyEvidence {
  id: string;
  name: string;
  category: "language" | "framework" | "library" | "database" | "cloud" | "devops" | "testing" | "build" | "architecture";
  confidence: number; // 0-100
  detectionSource: "source_code" | "dependency" | "config" | "build" | "ci_cd" | "readme" | "file_extension";
  repositories: string[];
  files: string[];
  usageCount: number;
}

export interface SkillEvidence {
  id: string;
  name: string;
  category: string;
  confidence: number;
  strength: number;
  source: "github" | "linkedin" | "career_profile" | "project" | "certification" | "assessment";
  repository?: string;
  file?: string;
  snippet?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface ArchitectureEvidence {
  pattern: string;
  confidence: number;
  files: string[];
  directories: string[];
  imports: string[];
  structuralReason: string;
}

export interface QualityEvidence {
  documentation: number;
  testing: number;
  cicd: number;
  structure: number;
  overall: number;
  details: Record<string, { score: number; evidence: string[] }>;
}

export interface RepositoryAnalysis {
  name: string;
  url?: string;
  description: string;
  primaryLanguage: string;
  languages: Record<string, number>;
  stars: number;
  isPrivate: boolean;
  lastUpdated: string;
  technologies: TechnologyEvidence[];
  skills: SkillEvidence[];
  architecture: ArchitectureEvidence[];
  quality: QualityEvidence;
  readmeSummary: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  fileCount: number;
  directoryStructure: string[];
  configFiles: string[];
  ciCdFiles: string[];
  testFiles: string[];
  dockerFiles: string[];
}

export interface GitAnalysisResult {
  repositories: RepositoryAnalysis[];
  allTechnologies: TechnologyEvidence[];
  allSkills: SkillEvidence[];
  allArchitecture: ArchitectureEvidence[];
  summary: {
    totalRepos: number;
    primaryLanguages: string[];
    detectedTechnologies: number;
    detectedSkills: number;
    detectedPatterns: number;
    averageQuality: number;
  };
}
