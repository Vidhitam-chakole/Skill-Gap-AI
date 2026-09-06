/**
 * Git Analyzer Orchestrator
 *
 * Coordinates all analysis engines on scanned repositories.
 * This is the main entry point for analyzing one or more repos.
 */

import { scanRepository, type ScannedRepo } from "./scanner.js";
import { detectLanguages, detectTechnologiesFromDependencies, detectTechnologiesFromConfig, detectTechnologiesFromCI } from "./technology-detector.js";
import { detectSkills } from "./skill-engine.js";
import { detectArchitecture } from "./architecture-detector.js";
import { calculateQuality } from "./quality-engine.js";
import type { GitAnalysisResult, RepositoryAnalysis, TechnologyEvidence, SkillEvidence, ArchitectureEvidence } from "./types.js";

export interface AnalyzeOptions {
  repoPaths: string[];
  repoNames?: string[];
}

export function analyzeRepositories(options: AnalyzeOptions): GitAnalysisResult {
  const { repoPaths, repoNames } = options;
  const repoAnalyses: RepositoryAnalysis[] = [];

  const allTechnologies: TechnologyEvidence[] = [];
  const allSkills: SkillEvidence[] = [];
  const allArchitecture: ArchitectureEvidence[] = [];

  for (let i = 0; i < repoPaths.length; i++) {
    const repoPath = repoPaths[i]!;
    const repoName = repoNames?.[i] || undefined;

    const analysis = analyzeSingleRepository(repoPath, repoName);
    repoAnalyses.push(analysis);

    allTechnologies.push(...analysis.technologies);
    allSkills.push(...analysis.skills);
    allArchitecture.push(...analysis.architecture);
  }

  // Deduplicate technologies across repos
  const dedupedTech = deduplicateTechnologies(allTechnologies);

  // Deduplicate skills
  const dedupedSkills = deduplicateSkills(allSkills);

  const primaryLanguages = [...new Set(repoAnalyses.map((r) => r.primaryLanguage).filter(Boolean))];

  return {
    repositories: repoAnalyses,
    allTechnologies: dedupedTech,
    allSkills: dedupedSkills,
    allArchitecture,
    summary: {
      totalRepos: repoAnalyses.length,
      primaryLanguages,
      detectedTechnologies: dedupedTech.length,
      detectedSkills: dedupedSkills.length,
      detectedPatterns: allArchitecture.length,
      averageQuality: repoAnalyses.length
        ? Math.round(repoAnalyses.reduce((s, r) => s + r.quality.overall, 0) / repoAnalyses.length)
        : 0,
    },
  };
}

function analyzeSingleRepository(repoPath: string, repoName?: string): RepositoryAnalysis {
  const scanned = scanRepository(repoPath, repoName);

  // 1. Detect languages from file extensions
  const languages = detectLanguages(scanned.fileCount);
  const primaryLanguage = Object.entries(languages).sort(([, a], [, b]) => b - a)[0]?.[0] || "Unknown";

  // 2. Detect technologies from multiple sources
  const techFromDeps = detectTechnologiesFromDependencies(
    scanned.dependencies, scanned.devDependencies, scanned.name, scanned.allFiles
  );
  const techFromConfig = detectTechnologiesFromConfig(scanned.configFiles, scanned.name);
  const techFromCI = detectTechnologiesFromCI(scanned.ciCdFiles, scanned.name);

  // Add language-based technologies
  const techFromLangs: TechnologyEvidence[] = Object.entries(languages).map(([lang, count]) => ({
    id: `tech-${lang.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    name: lang,
    category: "language" as const,
    confidence: Math.min(95, 50 + count * 3),
    detectionSource: "source_code" as const,
    repositories: [scanned.name],
    files: scanned.allFiles.filter((f) => {
      const ext = "." + f.split(".").pop();
      const langMap: Record<string, string[]> = {
        TypeScript: [".ts", ".tsx"], JavaScript: [".js", ".jsx"], Python: [".py"],
        Go: [".go"], Rust: [".rs"], Java: [".java"], Ruby: [".rb"], PHP: [".php"],
        Shell: [".sh", ".bash"], C: [".c"], "C++": [".cpp"], "C#": [".cs"],
      };
      return langMap[lang]?.includes(ext);
    }),
    usageCount: count,
  }));

  // Merge all technologies (deduplicate by name)
  const techMap = new Map<string, TechnologyEvidence>();
  for (const tech of [...techFromLangs, ...techFromDeps, ...techFromConfig, ...techFromCI]) {
    if (techMap.has(tech.name)) {
      const existing = techMap.get(tech.name)!;
      existing.confidence = Math.min(100, Math.max(existing.confidence, tech.confidence));
      existing.files = [...new Set([...existing.files, ...tech.files])];
      existing.repositories = [...new Set([...existing.repositories, ...tech.repositories])];
    } else {
      techMap.set(tech.name, { ...tech });
    }
  }

  // 3. Detect skills
  const fileLists = new Map<string, string[]>();
  fileLists.set(scanned.name, scanned.allFiles);
  const skills = detectSkills(Array.from(techMap.values()), [scanned.name], fileLists);

  // 4. Detect architecture patterns
  const architecture = detectArchitecture(
    scanned.directories, fileLists, scanned.allFiles, scanned.dependencies, scanned.devDependencies
  );

  // 5. Calculate quality
  const quality = calculateQuality(
    scanned.allFiles, scanned.testFiles, scanned.ciCdFiles, scanned.configFiles,
    scanned.directories, scanned.fileCount
  );

  return {
    name: scanned.name,
    description: extractDescription(scanned.readmeContent, scanned.name),
    primaryLanguage,
    languages,
    stars: 0,
    isPrivate: false,
    lastUpdated: new Date().toISOString(),
    technologies: Array.from(techMap.values()),
    skills,
    architecture,
    quality,
    readmeSummary: scanned.readmeContent.slice(0, 500),
    dependencies: scanned.dependencies,
    devDependencies: scanned.devDependencies,
    fileCount: scanned.allFiles.length,
    directoryStructure: scanned.directories.slice(0, 50),
    configFiles: scanned.configFiles,
    ciCdFiles: scanned.ciCdFiles,
    testFiles: scanned.testFiles,
    dockerFiles: scanned.dockerFiles,
  };
}

function extractDescription(readme: string, name: string): string {
  if (!readme) return `Repository: ${name}`;
  // Take first non-heading, non-empty line
  const lines = readme.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("!") && trimmed.length > 10) {
      return trimmed.slice(0, 200);
    }
  }
  return `Repository: ${name}`;
}

function deduplicateTechnologies(techs: TechnologyEvidence[]): TechnologyEvidence[] {
  const map = new Map<string, TechnologyEvidence>();
  for (const tech of techs) {
    if (map.has(tech.name)) {
      const existing = map.get(tech.name)!;
      existing.confidence = Math.min(100, Math.max(existing.confidence, tech.confidence));
      existing.files = [...new Set([...existing.files, ...tech.files])];
      existing.repositories = [...new Set([...existing.repositories, ...tech.repositories])];
      existing.usageCount += tech.usageCount;
    } else {
      map.set(tech.name, { ...tech });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.confidence - a.confidence);
}

function deduplicateSkills(skills: SkillEvidence[]): SkillEvidence[] {
  const map = new Map<string, SkillEvidence>();
  for (const skill of skills) {
    if (map.has(skill.name)) {
      const existing = map.get(skill.name)!;
      existing.confidence = Math.min(100, Math.max(existing.confidence, skill.confidence));
      existing.strength = Math.min(100, Math.max(existing.strength, skill.strength));
    } else {
      map.set(skill.name, { ...skill });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.confidence - a.confidence);
}
