/**
 * Confidence Utility Tests
 */

import { describe, it, expect } from "vitest";
import { getConfidenceLevel } from "@/shared/types";

describe("getConfidenceLevel", () => {
  it("returns 'low' for scores below 50", () => {
    expect(getConfidenceLevel(0)).toBe("low");
    expect(getConfidenceLevel(25)).toBe("low");
    expect(getConfidenceLevel(49)).toBe("low");
  });

  it("returns 'medium' for scores 50-79", () => {
    expect(getConfidenceLevel(50)).toBe("medium");
    expect(getConfidenceLevel(65)).toBe("medium");
    expect(getConfidenceLevel(79)).toBe("medium");
  });

  it("returns 'high' for scores 80+", () => {
    expect(getConfidenceLevel(80)).toBe("high");
    expect(getConfidenceLevel(90)).toBe("high");
    expect(getConfidenceLevel(100)).toBe("high");
  });

  it("handles edge cases", () => {
    expect(getConfidenceLevel(49.9)).toBe("low");
    expect(getConfidenceLevel(50.1)).toBe("medium");
    expect(getConfidenceLevel(79.9)).toBe("medium");
    expect(getConfidenceLevel(80.1)).toBe("high");
  });
});
