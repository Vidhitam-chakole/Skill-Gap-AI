/**
 * Database Schema — Drizzle ORM + SQLite
 * Maps directly to the frontend TypeScript types in src/shared/types/index.ts
 */

import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ============================================================
// Users & Auth
// ============================================================

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatar: text("avatar").default(""),
  bio: text("bio").default(""),
  joinDate: text("join_date").notNull(),
});

export const oauthConnections = sqliteTable("oauth_connections", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // "github" | "linkedin"
  providerUserId: text("provider_user_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  username: text("username"),
  avatarUrl: text("avatar_url"),
  repositoryCount: integer("repository_count").default(0),
  connectedAt: text("connected_at").notNull(),
});

// ============================================================
// Career Profile
// ============================================================

export const careerProfiles = sqliteTable("career_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  company: text("company").default(""),
  currentRole: text("current_role").default(""),
  targetRole: text("target_role").default(""),
  careerPath: text("career_path").default(""),
  yearsOfExperience: integer("years_of_experience").default(0),
  experienceLevel: text("experience_level").default("mid"),
  careerGoals: text("career_goals").default("[]"), // JSON array
});

// ============================================================
// Analysis Runs
// ============================================================

export const analysisRuns = sqliteTable("analysis_runs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull(), // queued | running | completed | failed | cancelled
  currentStage: text("current_stage").default("queued"),
  startedAt: text("started_at").notNull(),
  completedAt: text("completed_at"),
  error: text("error"),
  confidence: real("confidence").default(0),
  repoCount: integer("repo_count").default(0),
  qualityAvg: real("quality_avg").default(0),
  analyzerVersion: text("analyzer_version").default("1.0.0"),
});

export const pipelineEvents = sqliteTable("pipeline_events", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull().references(() => analysisRuns.id, { onDelete: "cascade" }),
  stage: text("stage").notNull(),
  startedAt: text("started_at").notNull(),
  completedAt: text("completed_at"),
  error: text("error"),
  progress: integer("progress").default(0),
  message: text("message"),
});

// ============================================================
// Repositories
// ============================================================

export const repositories = sqliteTable("repositories", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  runId: text("run_id").references(() => analysisRuns.id),
  name: text("name").notNull(),
  description: text("description").default(""),
  url: text("url").default(""),
  primaryLanguage: text("primary_language").default(""),
  stars: integer("stars").default(0),
  isPrivate: integer("is_private", { mode: "boolean" }).default(false),
  lastUpdated: text("last_updated"),
  qualityScore: real("quality_score").default(0),
  readmeSummary: text("readme_summary").default(""),
});

// ============================================================
// Technologies
// ============================================================

export const technologies = sqliteTable("technologies", {
  id: text("id").primaryKey(),
  repoId: text("repo_id").notNull().references(() => repositories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  version: text("version"),
  category: text("category").notNull(), // language | framework | library | database | devops | testing
  confidence: real("confidence").notNull(),
  detectionSource: text("detection_source").notNull(), // manifest | import | file | config | dependency
});

export const technologyFiles = sqliteTable("technology_files", {
  id: text("id").primaryKey(),
  technologyId: text("technology_id").notNull().references(() => technologies.id, { onDelete: "cascade" }),
  filePath: text("file_path").notNull(),
});

// ============================================================
// Skills
// ============================================================

export const skills = sqliteTable("skills", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  runId: text("run_id").references(() => analysisRuns.id),
  name: text("name").notNull(),
  category: text("category").notNull(),
  confidence: real("confidence").notNull(),
  repoCount: integer("repo_count").default(0),
  depthLevel: integer("depth_level").default(0),
  depthScore: real("depth_score").default(0),
});

export const skillEvidence = sqliteTable("skill_evidence", {
  id: text("id").primaryKey(),
  skillId: text("skill_id").notNull().references(() => skills.id, { onDelete: "cascade" }),
  sourceFile: text("source_file").notNull(),
  line: integer("line"),
  snippet: text("snippet"),
  detectionMethod: text("detection_method").notNull(),
  repositoryName: text("repository_name"),
});

export const skillRepos = sqliteTable("skill_repos", {
  id: text("id").primaryKey(),
  skillId: text("skill_id").notNull().references(() => skills.id, { onDelete: "cascade" }),
  repoName: text("repo_name").notNull(),
  confidence: real("confidence").notNull(),
});

// ============================================================
// Architecture
// ============================================================

export const architecturePatterns = sqliteTable("architecture_patterns", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  runId: text("run_id").references(() => analysisRuns.id),
  name: text("name").notNull(),
  confidence: real("confidence").notNull(),
  whyDetected: text("why_detected").default(""),
});

export const architectureFiles = sqliteTable("architecture_files", {
  id: text("id").primaryKey(),
  patternId: text("pattern_id").notNull().references(() => architecturePatterns.id, { onDelete: "cascade" }),
  filePath: text("file_path").notNull(),
});

export const architectureRelationships = sqliteTable("architecture_relationships", {
  id: text("id").primaryKey(),
  patternId: text("pattern_id").notNull().references(() => architecturePatterns.id, { onDelete: "cascade" }),
  relationship: text("relationship").notNull(),
});

// ============================================================
// Quality
// ============================================================

export const qualityScores = sqliteTable("quality_scores", {
  id: text("id").primaryKey(),
  repoId: text("repo_id").notNull().references(() => repositories.id, { onDelete: "cascade" }),
  overallScore: real("overall_score").notNull(),
  documentation: real("documentation").default(0),
  testing: real("testing").default(0),
  cicd: real("cicd").default(0),
  structure: real("structure").default(0),
});

// ============================================================
// Recommendations & Roadmap
// ============================================================

export const recommendations = sqliteTable("recommendations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  rationale: text("rationale").default(""),
  severity: text("severity").notNull(),
  relatedSkillGaps: text("related_skill_gaps").default("[]"),
  suggestedNextStep: text("suggested_next_step").default(""),
  dismissed: integer("dismissed", { mode: "boolean" }).default(false),
});

export const roadmapSteps = sqliteTable("roadmap_steps", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
  title: text("title").notNull(),
  description: text("description").default(""),
  linkedSkillGaps: text("linked_skill_gaps").default("[]"),
  estimatedDuration: text("estimated_duration").default(""),
  status: text("status").default("not_started"),
});

// ============================================================
// Mentor
// ============================================================

export const mentorConversations = sqliteTable("mentor_conversations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  messageCount: integer("message_count").default(0),
});

export const mentorMessages = sqliteTable("mentor_messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").notNull().references(() => mentorConversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
});

// ============================================================
// Settings
// ============================================================

export const userSettings = sqliteTable("user_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  emailDigest: integer("email_digest", { mode: "boolean" }).default(true),
  skillUpdates: integer("skill_updates", { mode: "boolean" }).default(true),
  recommendationsNotif: integer("recommendations_notif", { mode: "boolean" }).default(true),
  theme: text("theme").default("dark"),
});

// ============================================================
// Workspace
// ============================================================

export const workspaceBoards = sqliteTable("workspace_boards", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
});

export const workspaceTabs = sqliteTable("workspace_tabs", {
  id: text("id").primaryKey(),
  boardId: text("board_id").notNull().references(() => workspaceBoards.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  orderIndex: integer("order_index").default(0),
});

export const workspaceItems = sqliteTable("workspace_items", {
  id: text("id").primaryKey(),
  tabId: text("tab_id").notNull().references(() => workspaceTabs.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").default(""),
  status: text("status").default("todo"),
  linkedRoadmapStep: text("linked_roadmap_step"),
  notes: text("notes").default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ============================================================
// Exports & Shares
// ============================================================

export const shareLinks = sqliteTable("share_links", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  recruiterView: integer("recruiter_view", { mode: "boolean" }).default(false),
});
