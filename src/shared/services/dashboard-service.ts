/**
 * Dashboard Service
 * Reference: Skill+ Master Product Blueprint v1.0, Part IV §IV.7
 *
 * Mock data for dashboard overview including chart data.
 * Swaps to real API when backend is ready.
 */

import type { Skill, Repository, Recommendation, SkillCategory } from "@/shared/types";
import { apiClient, endpoints } from "@/shared/api/client";
import { featureFlags } from "@/shared/config/env";

export interface LanguageBreakdown {
  name: string;
  value: number;
  color: string;
}

export interface QualityDistribution {
  range: string;
  count: number;
}

export interface SkillCategoryData {
  category: SkillCategory;
  count: number;
  avgConfidence: number;
}

export interface ConfidenceTimeline {
  date: string;
  overall: number;
  languages: number;
  frameworks: number;
  devops: number;
}

export interface DashboardOverview {
  reposAnalyzed: number;
  technologiesDetected: number;
  overallConfidence: number;
  repoQualityAvg: number;
  topSkills: Skill[];
  recentRepos: Repository[];
  recommendations: Recommendation[];
  languageBreakdown: LanguageBreakdown[];
  qualityDistribution: QualityDistribution[];
  skillCategories: SkillCategoryData[];
  confidenceTimeline: ConfidenceTimeline[];
}

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  if (featureFlags.engineeringMaturity) {
    return apiClient.get<DashboardOverview>("/api/dashboard/overview");
  }

  // Mock data
  return {
    reposAnalyzed: 12,
    technologiesDetected: 47,
    overallConfidence: 78,
    repoQualityAvg: 72,
    topSkills: [
      { name: "TypeScript", category: "language", confidence: 95, evidence: [], repoCount: 10 },
      { name: "React", category: "framework", confidence: 92, evidence: [], repoCount: 8 },
      { name: "Node.js", category: "framework", confidence: 85, evidence: [], repoCount: 7 },
      { name: "PostgreSQL", category: "database", confidence: 72, evidence: [], repoCount: 5 },
      { name: "Docker", category: "devops", confidence: 68, evidence: [], repoCount: 4 },
      { name: "Rust", category: "language", confidence: 62, evidence: [], repoCount: 3 },
      { name: "Go", category: "language", confidence: 55, evidence: [], repoCount: 2 },
      { name: "Python", category: "language", confidence: 48, evidence: [], repoCount: 3 },
    ],
    recentRepos: [
      { name: "skill-plus-web", description: "Main Skill+ web application", stars: 342, primaryLanguage: "TypeScript", lastUpdated: "2026-08-29T14:22:00Z", qualityScore: 82, url: "", isPrivate: false },
      { name: "portfolio-v3", description: "Personal portfolio with Next.js", stars: 567, primaryLanguage: "TypeScript", lastUpdated: "2026-07-15T18:30:00Z", qualityScore: 88, url: "", isPrivate: false },
      { name: "rust-web-server", description: "High-performance HTTP server in Rust", stars: 312, primaryLanguage: "Rust", lastUpdated: "2026-08-20T13:55:00Z", qualityScore: 76, url: "", isPrivate: false },
    ],
    recommendations: [
      { title: "Add unit tests to backend services", rationale: "Testing coverage is below 30% for critical backend modules.", severity: "high", evidence: [], relatedSkillGaps: ["Testing"], suggestedNextStep: "Start with service layer unit tests" },
    ],
    languageBreakdown: [
      { name: "TypeScript", value: 42, color: "#B8FF00" },
      { name: "Rust", value: 15, color: "#FF3366" },
      { name: "Python", value: 14, color: "#00D4FF" },
      { name: "Go", value: 10, color: "#FF8800" },
      { name: "HCL", value: 8, color: "#B98BFF" },
      { name: "Shell", value: 6, color: "#4DD4D0" },
      { name: "Other", value: 5, color: "#606068" },
    ],
    qualityDistribution: [
      { range: "0–20", count: 0 },
      { range: "21–40", count: 1 },
      { range: "41–60", count: 3 },
      { range: "61–80", count: 5 },
      { range: "81–100", count: 3 },
    ],
    skillCategories: [
      { category: "language", count: 6, avgConfidence: 72 },
      { category: "framework", count: 5, avgConfidence: 81 },
      { category: "library", count: 12, avgConfidence: 65 },
      { category: "database", count: 3, avgConfidence: 68 },
      { category: "devops", count: 4, avgConfidence: 58 },
      { category: "testing", count: 4, avgConfidence: 45 },
    ],
    confidenceTimeline: [
      { date: "Jan", overall: 45, languages: 50, frameworks: 42, devops: 30 },
      { date: "Feb", overall: 52, languages: 58, frameworks: 50, devops: 35 },
      { date: "Mar", overall: 58, languages: 62, frameworks: 55, devops: 42 },
      { date: "Apr", overall: 61, languages: 65, frameworks: 60, devops: 48 },
      { date: "May", overall: 65, languages: 70, frameworks: 64, devops: 50 },
      { date: "Jun", overall: 68, languages: 74, frameworks: 68, devops: 52 },
      { date: "Jul", overall: 72, languages: 80, frameworks: 72, devops: 58 },
      { date: "Aug", overall: 78, languages: 88, frameworks: 82, devops: 65 },
    ],
  };
}
