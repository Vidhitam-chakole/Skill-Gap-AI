/**
 * Database Seeder — uses sql.js directly
 */

import initSqlJs from "sql.js";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbDir = path.resolve(__dirname, "../../data");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const dbPath = path.join(dbDir, "skillplus.db");
const SQL = await initSqlJs();
const sqlite = fs.existsSync(dbPath) ? new SQL.Database(fs.readFileSync(dbPath)) : new SQL.Database();
sqlite.run("PRAGMA foreign_keys = ON");

const userId = "user-dev-001";
const now = new Date().toISOString();
const pwHash = bcrypt.hashSync("password123", 12);

sqlite.run(`INSERT OR IGNORE INTO users (id, email, name, username, password_hash, avatar, bio, join_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [userId, "dev@example.com", "Developer", "dev", pwHash, "", "Full-stack developer", now]);
sqlite.run(`INSERT OR IGNORE INTO user_settings (id, user_id) VALUES (?, ?)`, ["settings-dev", userId]);
sqlite.run(`INSERT OR IGNORE INTO career_profiles (id, user_id, company, current_role, target_role, years_of_experience, experience_level, career_goals) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, ["career-dev", userId, "Acme Corp", "Software Engineer", "Staff Engineer", 5, "senior", JSON.stringify(["Staff Engineer", "Open Source Leader"])]);

// Repos
const repos: [string, string, string, number, number][] = [
  ["skill-plus-web", "Main Skill+ web application", "TypeScript", 342, 82],
  ["skill-plus-api", "Backend REST API", "TypeScript", 189, 71],
  ["portfolio-v3", "Personal portfolio with Next.js", "TypeScript", 567, 88],
  ["cli-toolkit", "Developer CLI utilities", "Go", 98, 65],
  ["ml-experiments", "ML experiments with PyTorch", "Python", 234, 54],
  ["dotfiles", "Personal dotfiles", "Shell", 45, 42],
  ["rust-web-server", "High-performance HTTP server in Rust", "Rust", 312, 76],
  ["react-component-lib", "Reusable UI component library", "TypeScript", 178, 91],
  ["terraform-infra", "Infrastructure as Code", "HCL", 67, 59],
  ["data-pipeline", "ETL pipeline for analytics", "Python", 143, 68],
  ["mobile-app", "React Native mobile app", "TypeScript", 89, 58],
  ["graphql-gateway", "GraphQL API gateway", "TypeScript", 201, 74],
];

for (const [name, desc, lang, stars, score] of repos) {
  const id = `repo-${name}`;
  sqlite.run(`INSERT OR IGNORE INTO repositories (id, user_id, name, description, primary_language, stars, quality_score, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [id, userId, name, desc, lang, stars, score, now]);
  sqlite.run(`INSERT OR IGNORE INTO quality_scores (id, repo_id, overall_score, documentation, testing, cicd, structure) VALUES (?, ?, ?, ?, ?, ?, ?)`, [`qs-${name}`, id, score, Math.round(score * 0.9), Math.round(score * 0.7), Math.round(score * 0.85), Math.round(score * 1.05)]);
}

// Skills
const skillsData: [string, string, number, number][] = [
  ["TypeScript", "language", 95, 10], ["React", "framework", 92, 8], ["Node.js", "framework", 85, 7],
  ["Rust", "language", 62, 3], ["Python", "language", 48, 3], ["Go", "language", 55, 2],
  ["PostgreSQL", "database", 72, 5], ["Docker", "devops", 68, 4], ["Tailwind CSS", "library", 88, 6],
  ["Zod", "library", 74, 4], ["TanStack Query", "library", 70, 5], ["Jest", "testing", 45, 3],
  ["Vitest", "testing", 52, 2], ["Playwright", "testing", 38, 1], ["Next.js", "framework", 78, 3],
  ["Vite", "devops", 82, 6], ["Recharts", "library", 65, 2], ["Zustand", "library", 60, 2],
  ["Framer Motion", "library", 58, 2], ["Redis", "database", 42, 2],
];

for (const [name, cat, conf, repoCount] of skillsData) {
  sqlite.run(`INSERT OR IGNORE INTO skills (id, user_id, name, category, confidence, repo_count, depth_level, depth_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [`skill-${name}`, userId, name, cat, conf, repoCount, Math.floor(conf / 20), conf]);
}

// Architecture patterns
const patterns: [string, number][] = [["Feature-Sliced Design", 88], ["Component Composition", 82], ["Middleware Pattern", 90], ["App Router", 95], ["Layered Architecture", 78], ["Repository Pattern", 65]];
for (const [name, conf] of patterns) {
  sqlite.run(`INSERT OR IGNORE INTO architecture_patterns (id, user_id, name, confidence, why_detected) VALUES (?, ?, ?, ?, ?)`, [`arch-${name}`, userId, name, conf, "Detected from repository structure and code patterns"]);
}

// Recommendations
const recs: [string, string, string, string][] = [
  ["Add unit tests to backend services", "Testing coverage below 30%", "high", "Start with service layer unit tests"],
  ["Set up CI/CD pipeline", "No CI/CD configuration detected", "critical", "Set up GitHub Actions with lint, test, build stages"],
  ["Document API with OpenAPI", "12 endpoints with no documentation", "medium", "Add Swagger JSDoc to route handlers"],
  ["Migrate Redux to Zustand", "Heavy boilerplate in mobile-app", "low", "Start with auth state slice"],
];
for (const [title, rationale, severity, step] of recs) {
  sqlite.run(`INSERT OR IGNORE INTO recommendations (id, user_id, title, rationale, severity, suggested_next_step) VALUES (?, ?, ?, ?, ?, ?)`, [`rec-${title.slice(0, 20)}`, userId, title, rationale, severity, step]);
}

// Roadmap
const steps: [number, string, string, string, string][] = [
  [1, "Master Testing Fundamentals", "Build solid foundation in testing", "2 weeks", "not_started"],
  [2, "CI/CD Pipeline Setup", "Learn GitHub Actions for automated pipelines", "1 week", "not_started"],
  [3, "E2E Testing with Playwright", "Master Playwright for end-to-end testing", "2 weeks", "not_started"],
  [4, "API Documentation", "Learn OpenAPI/Swagger for API docs", "1 week", "not_started"],
  [5, "Advanced Docker", "Deepen Docker knowledge with orchestration", "2-3 weeks", "not_started"],
  [6, "Performance Optimization", "Learn profiling and caching strategies", "1-2 weeks", "not_started"],
];
for (const [order, title, desc, dur, status] of steps) {
  sqlite.run(`INSERT OR IGNORE INTO roadmap_steps (id, user_id, order_index, title, description, estimated_duration, status) VALUES (?, ?, ?, ?, ?, ?, ?)`, [`step-${order}`, userId, order, title, desc, dur, status]);
}

// Analysis run
sqlite.run(`INSERT OR IGNORE INTO analysis_runs (id, user_id, status, current_stage, started_at, completed_at, confidence, repo_count, quality_avg) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, ["run-dev-001", userId, "complete", "complete", now, now, 78, 12, 72]);

// Save
const data = sqlite.export();
fs.writeFileSync(dbPath, Buffer.from(data));
sqlite.close();
console.log("✅ Database seeded with development data");
