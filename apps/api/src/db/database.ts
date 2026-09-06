/**
 * Database Connection — Drizzle ORM + sql.js (pure-JS SQLite)
 */

import initSqlJs, { type Database as SqlJsDatabase } from "sql.js";
import { drizzle } from "drizzle-orm/sql-js";
import * as schema from "./schema.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.resolve(__dirname, "../../data");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const dbPath = path.join(dbDir, "skillplus.db");

let sqlInstance: SqlJsDatabase;
let dbReady: ReturnType<typeof drizzle<typeof schema>>;

const MIGRATION_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
    avatar TEXT DEFAULT '', bio TEXT DEFAULT '', join_date TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS oauth_connections (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, provider_user_id TEXT NOT NULL,
    access_token TEXT, refresh_token TEXT, username TEXT, avatar_url TEXT,
    repository_count INTEGER DEFAULT 0, connected_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS career_profiles (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company TEXT DEFAULT '', current_role TEXT DEFAULT '', target_role TEXT DEFAULT '',
    career_path TEXT DEFAULT '', years_of_experience INTEGER DEFAULT 0,
    experience_level TEXT DEFAULT 'mid', career_goals TEXT DEFAULT '[]'
  );
  CREATE TABLE IF NOT EXISTS analysis_runs (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL, current_stage TEXT DEFAULT 'queued',
    started_at TEXT NOT NULL, completed_at TEXT, error TEXT,
    confidence REAL DEFAULT 0, repo_count INTEGER DEFAULT 0,
    quality_avg REAL DEFAULT 0, analyzer_version TEXT DEFAULT '1.0.0'
  );
  CREATE TABLE IF NOT EXISTS pipeline_events (
    id TEXT PRIMARY KEY, run_id TEXT NOT NULL REFERENCES analysis_runs(id) ON DELETE CASCADE,
    stage TEXT NOT NULL, started_at TEXT NOT NULL, completed_at TEXT,
    error TEXT, progress INTEGER DEFAULT 0, message TEXT
  );
  CREATE TABLE IF NOT EXISTS repositories (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    run_id TEXT REFERENCES analysis_runs(id),
    name TEXT NOT NULL, description TEXT DEFAULT '', url TEXT DEFAULT '',
    primary_language TEXT DEFAULT '', stars INTEGER DEFAULT 0,
    is_private INTEGER DEFAULT 0, last_updated TEXT,
    quality_score REAL DEFAULT 0, readme_summary TEXT DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS technologies (
    id TEXT PRIMARY KEY, repo_id TEXT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    name TEXT NOT NULL, version TEXT, category TEXT NOT NULL,
    confidence REAL NOT NULL, detection_source TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS technology_files (
    id TEXT PRIMARY KEY, technology_id TEXT NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    run_id TEXT REFERENCES analysis_runs(id),
    name TEXT NOT NULL, category TEXT NOT NULL, confidence REAL NOT NULL,
    repo_count INTEGER DEFAULT 0, depth_level INTEGER DEFAULT 0, depth_score REAL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS skill_evidence (
    id TEXT PRIMARY KEY, skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    source_file TEXT NOT NULL, line INTEGER, snippet TEXT,
    detection_method TEXT NOT NULL, repository_name TEXT
  );
  CREATE TABLE IF NOT EXISTS skill_repos (
    id TEXT PRIMARY KEY, skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    repo_name TEXT NOT NULL, confidence REAL NOT NULL
  );
  CREATE TABLE IF NOT EXISTS architecture_patterns (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    run_id TEXT REFERENCES analysis_runs(id),
    name TEXT NOT NULL, confidence REAL NOT NULL, why_detected TEXT DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS architecture_files (
    id TEXT PRIMARY KEY, pattern_id TEXT NOT NULL REFERENCES architecture_patterns(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS architecture_relationships (
    id TEXT PRIMARY KEY, pattern_id TEXT NOT NULL REFERENCES architecture_patterns(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS quality_scores (
    id TEXT PRIMARY KEY, repo_id TEXT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    overall_score REAL NOT NULL, documentation REAL DEFAULT 0,
    testing REAL DEFAULT 0, cicd REAL DEFAULT 0, structure REAL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS recommendations (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL, rationale TEXT DEFAULT '', severity TEXT NOT NULL,
    related_skill_gaps TEXT DEFAULT '[]', suggested_next_step TEXT DEFAULT '',
    dismissed INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS roadmap_steps (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL, title TEXT NOT NULL, description TEXT DEFAULT '',
    linked_skill_gaps TEXT DEFAULT '[]', estimated_duration TEXT DEFAULT '',
    status TEXT DEFAULT 'not_started'
  );
  CREATE TABLE IF NOT EXISTS mentor_conversations (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
    message_count INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS mentor_messages (
    id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL REFERENCES mentor_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS user_settings (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email_digest INTEGER DEFAULT 1, skill_updates INTEGER DEFAULT 1,
    recommendations_notif INTEGER DEFAULT 1, theme TEXT DEFAULT 'dark'
  );
  CREATE TABLE IF NOT EXISTS workspace_boards (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS workspace_tabs (
    id TEXT PRIMARY KEY, board_id TEXT NOT NULL REFERENCES workspace_boards(id) ON DELETE CASCADE,
    name TEXT NOT NULL, order_index INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS workspace_items (
    id TEXT PRIMARY KEY, tab_id TEXT NOT NULL REFERENCES workspace_tabs(id) ON DELETE CASCADE,
    title TEXT NOT NULL, description TEXT DEFAULT '', status TEXT DEFAULT 'todo',
    linked_roadmap_step TEXT, notes TEXT DEFAULT '',
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS share_links (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL, recruiter_view INTEGER DEFAULT 0
  );
`;

export async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    sqlInstance = new SQL.Database(buffer);
  } else {
    sqlInstance = new SQL.Database();
  }

  sqlInstance.run("PRAGMA journal_mode = WAL");
  sqlInstance.run("PRAGMA foreign_keys = ON");

  // Auto-create tables if missing
  sqlInstance.exec(MIGRATION_SQL);
  saveDb();

  dbReady = drizzle(sqlInstance, { schema });
  return dbReady;
}

export function getDb() {
  if (!dbReady) throw new Error("Database not initialized. Call initDb() first.");
  return dbReady;
}

export function saveDb() {
  if (!sqlInstance) return;
  const data = sqlInstance.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

export function closeDb() {
  saveDb();
  sqlInstance?.close();
}

process.on("exit", () => saveDb());
process.on("SIGINT", () => { saveDb(); process.exit(0); });
process.on("SIGTERM", () => { saveDb(); process.exit(0); });
