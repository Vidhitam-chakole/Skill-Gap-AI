/**
 * Repository Quality Engine
 *
 * Calculates quality scores from filesystem evidence:
 * - Documentation (README, docs folder, JSDoc)
 * - Testing (test files, test config, coverage config)
 * - CI/CD (GitHub Actions, GitLab CI, Jenkinsfile)
 * - Structure (clean directories, naming conventions, config files)
 */

import type { QualityEvidence } from "./types.js";

const QUALITY_WEIGHTS = {
  documentation: 0.2,
  testing: 0.25,
  cicd: 0.2,
  structure: 0.35,
};

export function calculateQuality(
  allFiles: string[],
  testFiles: string[],
  ciCdFiles: string[],
  configFiles: string[],
  directories: string[],
  fileCount: Record<string, number>,
): QualityEvidence {
  // Documentation score
  const docScore = scoreDocumentation(allFiles, directories);

  // Testing score
  const testingScore = scoreTesting(testFiles, allFiles, configFiles);

  // CI/CD score
  const cicdScore = scoreCICD(ciCdFiles, configFiles);

  // Structure score
  const structureScore = scoreStructure(allFiles, directories, fileCount, configFiles);

  const overall = Math.round(
    docScore.score * QUALITY_WEIGHTS.documentation +
    testingScore.score * QUALITY_WEIGHTS.testing +
    cicdScore.score * QUALITY_WEIGHTS.cicd +
    structureScore.score * QUALITY_WEIGHTS.structure
  );

  return {
    documentation: docScore.score,
    testing: testingScore.score,
    cicd: cicdScore.score,
    structure: structureScore.score,
    overall: Math.min(100, overall),
    details: {
      documentation: docScore,
      testing: testingScore,
      cicd: cicdScore,
      structure: structureScore,
    },
  };
}

function scoreDocumentation(allFiles: string[], directories: string[]): { score: number; evidence: string[] } {
  const evidence: string[] = [];
  let score = 0;

  // README
  const hasReadme = allFiles.some((f) => /^readme/i.test(f));
  if (hasReadme) { score += 25; evidence.push("README.md present"); }

  // README quality — check if it's more than a stub
  const hasDetailedReadme = allFiles.some((f) => /readme|CONTRIBUTING|CHANGELOG/i.test(f));
  if (hasDetailedReadme) { score += 10; evidence.push("Additional docs (CONTRIBUTING/CHANGELOG)"); }

  // Docs directory
  const hasDocs = directories.some((d) => /docs?|documentation|wiki/.test(d));
  if (hasDocs) { score += 20; evidence.push("docs/ directory present"); }

  // JSDoc / TypeDoc
  const hasTypeDoc = allFiles.some((f) => /typedoc|jsdoc/.test(f));
  if (hasTypeDoc) { score += 10; evidence.push("TypeDoc/JSDoc config found"); }

  // Inline documentation indicators (comments in source)
  const hasSourceFiles = allFiles.some((f) => /\.(ts|js|py|go|rs|java)$/.test(f));
  if (hasSourceFiles) { score += 10; evidence.push("Source files present for documentation"); }

  // LICENSE
  const hasLicense = allFiles.some((f) => /^license/i.test(f));
  if (hasLicense) { score += 10; evidence.push("LICENSE file present"); }

  // API documentation
  const hasApiDocs = allFiles.some((f) => /swagger|openapi|postman/.test(f));
  if (hasApiDocs) { score += 15; evidence.push("API documentation (Swagger/OpenAPI) found"); }

  return { score: Math.min(100, score), evidence };
}

function scoreTesting(testFiles: string[], allFiles: string[], configFiles: string[]): { score: number; evidence: string[] } {
  const evidence: string[] = [];
  let score = 0;

  // Test files exist
  if (testFiles.length > 0) {
    score += Math.min(30, 10 + testFiles.length * 5);
    evidence.push(`${testFiles.length} test files found`);
  }

  // Test config
  const hasTestConfig = configFiles.some((f) => /jest|vitest|mocha|karma|cypress|playwright/.test(f));
  if (hasTestConfig) { score += 20; evidence.push("Test framework configuration found"); }

  // Coverage config
  const hasCoverage = configFiles.some((f) => /coverage|nyc|istanbul/.test(f)) ||
    allFiles.some((f) => /.nycrc|jest.config/.test(f));
  if (hasCoverage) { score += 15; evidence.push("Coverage configuration found"); }

  // Test-to-source ratio
  const sourceFiles = allFiles.filter((f) => /\.(ts|tsx|js|jsx|py|go|rs|java)$/.test(f) && !testFiles.includes(f));
  if (sourceFiles.length > 0) {
    const ratio = testFiles.length / sourceFiles.length;
    if (ratio >= 0.5) { score += 20; evidence.push(`Excellent test ratio: ${(ratio * 100).toFixed(0)}%`); }
    else if (ratio >= 0.2) { score += 15; evidence.push(`Good test ratio: ${(ratio * 100).toFixed(0)}%`); }
    else if (ratio > 0) { score += 5; evidence.push(`Low test ratio: ${(ratio * 100).toFixed(0)}%`); }
  }

  // E2E tests
  const hasE2E = testFiles.some((f) => /e2e|end.?to.?end|cypress|playwright/.test(f));
  if (hasE2E) { score += 15; evidence.push("E2E tests found"); }

  return { score: Math.min(100, score), evidence };
}

function scoreCICD(ciCdFiles: string[], configFiles: string[]): { score: number; evidence: string[] } {
  const evidence: string[] = [];
  let score = 0;

  // GitHub Actions
  const hasActions = ciCdFiles.some((f) => f.includes(".github/workflows"));
  if (hasActions) { score += 30; evidence.push("GitHub Actions workflows found"); }

  // GitLab CI
  const hasGitLab = ciCdFiles.some((f) => /gitlab-ci/.test(f));
  if (hasGitLab) { score += 30; evidence.push("GitLab CI config found"); }

  // Jenkins
  const hasJenkins = ciCdFiles.some((f) => /jenkinsfile/i.test(f));
  if (hasJenkins) { score += 25; evidence.push("Jenkins pipeline found"); }

  // Docker in CI
  const hasDockerCI = ciCdFiles.some((f) => /docker/i.test(f));
  if (hasDockerCI) { score += 10; evidence.push("Docker in CI pipeline"); }

  // Pre-commit hooks
  const hasPreCommit = configFiles.some((f) => /pre-commit|husky|lint-staged/.test(f));
  if (hasPreCommit) { score += 15; evidence.push("Pre-commit hooks configured"); }

  // Linting in CI
  const hasLinting = configFiles.some((f) => /eslint|prettier|biome|ruff|clippy/.test(f));
  if (hasLinting) { score += 15; evidence.push("Linting configured"); }

  return { score: Math.min(100, score), evidence };
}

function scoreStructure(
  allFiles: string[],
  directories: string[],
  fileCount: Record<string, number>,
  configFiles: string[],
): { score: number; evidence: string[] } {
  const evidence: string[] = [];
  let score = 0;

  // Config files present
  if (configFiles.length > 0) {
    score += Math.min(20, 5 + configFiles.length * 3);
    evidence.push(`${configFiles.length} config files found`);
  }

  // TypeScript config
  const hasTS = configFiles.some((f) => /tsconfig/.test(f));
  if (hasTS) { score += 15; evidence.push("TypeScript configured"); }

  // ESLint / Prettier
  const hasLint = configFiles.some((f) => /eslint|prettier|biome/.test(f));
  if (hasLint) { score += 10; evidence.push("Linting/formatting configured"); }

  // .gitignore
  const hasGitignore = allFiles.includes(".gitignore");
  if (hasGitignore) { score += 5; evidence.push(".gitignore present"); }

  // Directory organization — not too flat
  if (directories.length >= 3) { score += 15; evidence.push(`${directories.length} directories (good organization)`); }
  else if (directories.length >= 1) { score += 5; evidence.push(`${directories.length} directories (minimal structure)`); }

  // Not too many files in root
  const rootFiles = allFiles.filter((f) => !f.includes("/"));
  if (rootFiles.length <= 15) { score += 10; evidence.push(`Clean root (${rootFiles.length} files)`); }
  else { score += 3; evidence.push(`Cluttered root (${rootFiles.length} files)`); }

  // Environment config
  const hasEnv = allFiles.some((f) => /\.env|\.env\./.test(f));
  if (hasEnv) { score += 5; evidence.push("Environment config present"); }

  // Package manager lockfile
  const hasLockfile = allFiles.some((f) => /package-lock|yarn\.lock|pnpm-lock|go\.sum|Cargo\.lock|poetry\.lock/.test(f));
  if (hasLockfile) { score += 10; evidence.push("Lockfile present"); }

  // Docker support
  const hasDocker = allFiles.some((f) => /Dockerfile|docker-compose/.test(f));
  if (hasDocker) { score += 5; evidence.push("Docker support"); }

  return { score: Math.min(100, score), evidence };
}
