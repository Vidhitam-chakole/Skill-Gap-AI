#!/usr/bin/env node
/**
 * Git Analyzer CLI
 *
 * Usage: npx tsx packages/analysis/git-analyzer/src/cli.ts <repo-path> [repo-name]
 */

import { analyzeRepositories } from "./analyzer.js";
import path from "path";
import fs from "fs";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: npx tsx cli.ts <repo-path> [repo-name]");
  console.log("  <repo-path>  Path to a git repository directory");
  console.log("  [repo-name]  Optional name for the repository");
  console.log("");
  console.log("Examples:");
  console.log("  npx tsx cli.ts /path/to/my-project");
  console.log("  npx tsx cli.ts /path/to/my-project my-project");
  process.exit(1);
}

const repoPath = path.resolve(args[0]!);
const repoName = args[1];

if (!fs.existsSync(repoPath)) {
  console.error(`❌ Path not found: ${repoPath}`);
  process.exit(1);
}

if (!fs.statSync(repoPath).isDirectory()) {
  console.error(`❌ Not a directory: ${repoPath}`);
  process.exit(1);
}

console.log(`🔍 Analyzing repository: ${repoPath}\n`);

const result = analyzeRepositories({
  repoPaths: [repoPath],
  repoNames: repoName ? [repoName] : undefined,
});

const repo = result.repositories[0]!;

// Pretty print results
console.log("═══════════════════════════════════════════════");
console.log(`  📦 Repository: ${repo.name}`);
console.log(`  📝 Description: ${repo.description}`);
console.log(`  💻 Primary Language: ${repo.primaryLanguage}`);
console.log(`  📁 Files: ${repo.fileCount}`);
console.log("═══════════════════════════════════════════════\n");

// Languages
console.log("📊 Languages:");
for (const [lang, count] of Object.entries(repo.languages).slice(0, 10)) {
  console.log(`  ${lang}: ${count} files`);
}
console.log();

// Technologies
console.log(`🛠️  Technologies (${repo.technologies.length}):`);
for (const tech of repo.technologies.slice(0, 15)) {
  console.log(`  ${tech.name} [${tech.category}] — ${tech.confidence}% confidence (${tech.detectionSource})`);
}
console.log();

// Skills
console.log(`🎯 Skills (${repo.skills.length}):`);
for (const skill of repo.skills.slice(0, 15)) {
  const depthLevel = (skill.metadata?.depthLevel as number) ?? 0;
  console.log(`  ${skill.name} [${skill.category}] — ${skill.confidence}% confidence (depth: ${depthLevel})`);
}
console.log();

// Architecture
console.log(`🏗️  Architecture Patterns (${repo.architecture.length}):`);
for (const arch of repo.architecture) {
  console.log(`  ${arch.pattern} — ${arch.confidence}% confidence`);
  console.log(`    Reason: ${arch.structuralReason}`);
}
console.log();

// Quality
console.log("📊 Quality Scores:");
console.log(`  Overall: ${repo.quality.overall}/100`);
console.log(`  Documentation: ${repo.quality.documentation}/100`);
console.log(`  Testing: ${repo.quality.testing}/100`);
console.log(`  CI/CD: ${repo.quality.cicd}/100`);
console.log(`  Structure: ${repo.quality.structure}/100`);
console.log();

// Summary
console.log("═══════════════════════════════════════════════");
console.log(`  📈 Summary`);
console.log(`  Technologies: ${result.summary.detectedTechnologies}`);
console.log(`  Skills: ${result.summary.detectedSkills}`);
console.log(`  Architecture Patterns: ${result.summary.detectedPatterns}`);
console.log(`  Average Quality: ${result.summary.averageQuality}/100`);
console.log("═══════════════════════════════════════════════");

// Write JSON output
const outputPath = path.join(process.cwd(), "analysis-result.json");
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
console.log(`\n💾 Full results saved to: ${outputPath}`);
