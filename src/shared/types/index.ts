/**
 * Skill+ Entity Types
 * Reference: Skill+ Master Product Blueprint v1.0, Part I §2.2.1 (Entity Map)
 * and Part IV §IV.6 (TypeScript Architecture)
 */

// ============================================================
// Core Entities
// ============================================================

export interface Developer {
  username: string;
  avatar: string;
  bio: string;
  topLanguages: string[];
  joinDate: string;
  name: string;
  email: string;
}

export interface Repository {
  name: string;
  description: string;
  stars: number;
  primaryLanguage: string;
  lastUpdated: string;
  qualityScore: number;
  url: string;
  isPrivate: boolean;
}

export interface RepositoryDetail extends Repository {
  readmeSummary: string;
  techChips: string[];
  dependencies: Dependency[];
  qualitySubScores: QualitySubScores;
  architecturePatterns: ArchitecturePattern[];
}

export interface Dependency {
  name: string;
  version: string;
  category: SkillCategory;
}

export interface Skill {
  name: string;
  category: SkillCategory;
  confidence: number;
  evidence: Evidence[];
  repoCount: number;
}

export interface SkillDetail extends Skill {
  repos: SkillRepoReference[];
  evidenceGroups: EvidenceGroup[];
}

export interface SkillRepoReference {
  repoName: string;
  confidence: number;
}

export type SkillCategory =
  | "language"
  | "framework"
  | "library"
  | "database"
  | "devops"
  | "testing";

export interface Technology {
  name: string;
  version?: string;
  detectionSource: string;
  confidence: number;
  detectedFiles: string[];
}

export interface ArchitecturePattern {
  name: string;
  confidence: number;
  detectedFiles: string[];
  folderModuleRelationships: string[];
  whyDetected: string;
}

export interface Evidence {
  sourceFile: string;
  line?: number;
  snippet?: string;
  detectionMethod: EvidenceDetectionMethod;
}

export type EvidenceDetectionMethod =
  | "manifest"
  | "import"
  | "file"
  | "config"
  | "dependency";

export interface EvidenceGroup {
  method: EvidenceDetectionMethod;
  evidence: Evidence[];
  linkedRepos: string[];
}

// ============================================================
// Scores & Confidence
// ============================================================

export interface QualitySubScores {
  documentation: number;
  testing: number;
  cicd: number;
  structure: number;
}

export interface RepositoryQuality {
  repoName: string;
  overallScore: number;
  subScores: QualitySubScores;
  stars: number;
  lastUpdated: string;
}

export interface ConfidenceData {
  score: number;
  contributingSignals: string[];
}

export type ConfidenceLevel = "low" | "medium" | "high";

export function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score < 50) return "low";
  if (score < 80) return "medium";
  return "high";
}

// ============================================================
// Recommendations & Roadmap
// ============================================================

export interface Recommendation {
  title: string;
  rationale: string;
  severity: Severity;
  linkedEvidence: Evidence[];
  relatedSkillGaps: string[];
  suggestedNextStep: string;
}

export type Severity = "critical" | "high" | "medium" | "low";

export interface LearningRoadmapStep {
  order: number;
  title: string;
  description: string;
  linkedSkillGaps: string[];
  estimatedDuration: string;
  status: RoadmapStepStatus;
}

export type RoadmapStepStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "skipped";

export interface LearningRoadmap {
  steps: LearningRoadmapStep[];
  totalEstimatedDuration: string;
}

// ============================================================
// AI Mentor
// ============================================================

export interface MentorConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface MentorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  groundingContext?: GroundingContext;
}

export interface GroundingContext {
  developerProfile: boolean;
  githubAnalysis: boolean;
  skills: string[];
  engineeringMaturity: number;
  repoQuality: number;
  strengths: string[];
  weaknesses: string[];
  careerGoals: string[];
}

// ============================================================
// Workspace
// ============================================================

export interface WorkspaceBoard {
  id: string;
  name: string;
  tabs: WorkspaceTab[];
}

export interface WorkspaceTab {
  id: string;
  name: string;
  items: WorkspaceItem[];
}

export interface WorkspaceItem {
  id: string;
  title: string;
  description: string;
  status: WorkspaceItemStatus;
  linkedRoadmapStep?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkspaceItemStatus =
  | "todo"
  | "in_progress"
  | "done"
  | "blocked";

// ============================================================
// Analysis Pipeline
// ============================================================

export type PipelineStage =
  | "queued"
  | "cloning"
  | "analyzing"
  | "synthesizing"
  | "complete"
  | "failed";

export interface PipelineStatus {
  currentStage: PipelineStage;
  stages: PipelineStageEvent[];
  startedAt: string;
  estimatedCompletion?: string;
}

export interface PipelineStageEvent {
  stage: PipelineStage;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

// ============================================================
// History
// ============================================================

export interface AnalysisRun {
  id: string;
  date: string;
  confidence: number;
  repoCount: number;
  qualityAvg: number;
  status: "complete" | "in_progress" | "failed";
}

export interface AnalysisDiff {
  runA: AnalysisRun;
  runB: AnalysisRun;
  skillChanges: SkillDiff[];
  qualityChanges: QualityDiff[];
}

export interface SkillDiff {
  skillName: string;
  confidenceA: number;
  confidenceB: number;
  change: number;
}

export interface QualityDiff {
  repoName: string;
  scoreA: number;
  scoreB: number;
  change: number;
}

// ============================================================
// Settings
// ============================================================

export interface UserSettings {
  account: AccountSettings;
  careerProfile: CareerProfile;
  notificationPrefs: NotificationPrefs;
  theme: "dark" | "light" | "system";
}

export interface AccountSettings {
  name: string;
  email: string;
  avatar: string;
}

export interface CareerProfile {
  company: string;
  yearsOfExperience: number;
  currentRole: string;
  careerPath: string;
  targetRole: string;
  experienceLevel: ExperienceLevel;
  careerGoals: string[];
}

export type ExperienceLevel =
  | "junior"
  | "mid"
  | "senior"
  | "staff"
  | "principal"
  | "lead";

export interface NotificationPrefs {
  emailDigest: boolean;
  skillUpdates: boolean;
  recommendations: boolean;
}

// ============================================================
// Export
// ============================================================

export type ExportFormat = "pdf" | "markdown" | "json";

export interface SharedReport {
  token: string;
  url: string;
  expiresAt: string;
  recruiterView: boolean;
}

// ============================================================
// Navigation
// ============================================================

export interface NavItem {
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

// ============================================================
// API Response Wrappers
// ============================================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
