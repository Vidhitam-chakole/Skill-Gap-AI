import type { ConfidenceLevel } from "@/shared/types";

/**
 * Get confidence level from a numeric score
 * Reference: Design Spec §A.2.5 Confidence Scale
 */
export function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score < 50) return "low";
  if (score < 80) return "medium";
  return "high";
}

/**
 * Get confidence color token name from level
 * Reference: Design Spec §A.2.5
 */
export function getConfidenceColor(level: ConfidenceLevel): string {
  switch (level) {
    case "low":
      return "var(--color-confidence-low)";
    case "medium":
      return "var(--color-confidence-medium)";
    case "high":
      return "var(--color-confidence-high)";
  }
}

/**
 * Get quality level from a numeric score (0-100)
 * Reference: Design Spec §A.2.6 Quality Score Scale
 */
export function getQualityLevel(
  score: number,
): "poor" | "fair" | "strong" {
  if (score < 50) return "poor";
  if (score < 75) return "fair";
  return "strong";
}

/**
 * Get quality color from level
 * Reference: Design Spec §A.2.6
 */
export function getQualityColor(
  level: "poor" | "fair" | "strong",
): string {
  switch (level) {
    case "poor":
      return "var(--color-quality-poor)";
    case "fair":
      return "var(--color-quality-fair)";
    case "strong":
      return "var(--color-quality-strong)";
  }
}

/**
 * Severity color mapping
 */
export function getSeverityColor(
  severity: "critical" | "high" | "medium" | "low",
): string {
  switch (severity) {
    case "critical":
      return "var(--color-danger)";
    case "high":
      return "var(--color-warning)";
    case "medium":
      return "var(--color-info)";
    case "low":
      return "var(--color-success)";
  }
}
