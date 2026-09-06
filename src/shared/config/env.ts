/**
 * Environment Configuration
 * Reference: Skill+ Master Product Blueprint v1.0, Part IV §IV.9
 *
 * Feature flags use the VITE_FEATURE_FLAGS mechanism.
 * Every BACKEND-GAP-flagged feature is gated behind these flags.
 * When a flag is false, the UI renders its documented "Coming Soon" /
 * disabled / degraded state.
 */

const env = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string,
  VITE_WS_URL: import.meta.env.VITE_WS_URL as string,
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN as string,
};

export const config = {
  apiBaseUrl: env.VITE_API_BASE_URL ?? "http://localhost:3001",
  wsUrl: env.VITE_WS_URL ?? "ws://localhost:3001",
  sentryDsn: env.VITE_SENTRY_DSN ?? "",
} as const;

/**
 * Feature Flags
 * Each flag corresponds to a backend gap from Part I §12.
 * UI ships with graceful degradation until the flag flips.
 */
export const featureFlags = {
  /** Gap #1: Pipeline stage real-time events */
  realTimePipeline: parseFlag("VITE_FEATURE_REALTIME_PIPELINE", false),
  /** Gap #2: Developer identity/engineering maturity */
  engineeringMaturity: parseFlag("VITE_FEATURE_ENGINEERING_MATURITY", false),
  /** Gap #3: Skills/Architecture structural graph data */
  structuralGraph: parseFlag("VITE_FEATURE_STRUCTURAL_GRAPH", false),
  /** Gap #5: Public share-link generation */
  publicShareLinks: parseFlag("VITE_FEATURE_PUBLIC_SHARE_LINKS", false),
  /** Gap #6: Auth strategy */
  authStrategy: parseFlag("VITE_FEATURE_AUTH_STRATEGY", false),
  /** Gap #7: Career profile backend persistence */
  careerProfile: parseFlag("VITE_FEATURE_CAREER_PROFILE", false),
  /** Gap #8: GitHub verify endpoint */
  githubVerify: parseFlag("VITE_FEATURE_GITHUB_VERIFY", false),
  /** Gap #9: AI orchestration endpoint */
  aiMentor: parseFlag("VITE_FEATURE_AI_MENTOR", false),
  /** Gap #10: Workspace persistence */
  workspacePersistence: parseFlag("VITE_FEATURE_WORKSPACE_PERSISTENCE", false),
  /** Gap #11: Analysis history storage */
  analysisHistory: parseFlag("VITE_FEATURE_ANALYSIS_HISTORY", false),
} as const;

function parseFlag(key: string, defaultValue: boolean): boolean {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === "true" || value === "1";
}
