/**
 * Format Utility Tests
 */

import { describe, it, expect } from "vitest";
import { formatRelativeDate, formatNumber, formatPercent } from "../format";

describe("formatRelativeDate", () => {
  it("formats recent dates as minutes ago", () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const result = formatRelativeDate(fiveMinutesAgo.toISOString());
    expect(result).toMatch(/\d+m ago/);
  });

  it("formats hours ago", () => {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const result = formatRelativeDate(twoHoursAgo.toISOString());
    expect(result).toMatch(/\d+h ago/);
  });

  it("formats days ago", () => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const result = formatRelativeDate(threeDaysAgo.toISOString());
    expect(result).toMatch(/\d+d ago/);
  });

  it("formats weeks ago", () => {
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const result = formatRelativeDate(twoWeeksAgo.toISOString());
    expect(result).toMatch(/\d+w ago/);
  });

  it("formats months ago", () => {
    const now = new Date();
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const result = formatRelativeDate(twoMonthsAgo.toISOString());
    expect(result).toMatch(/\d+mo ago/);
  });
});

describe("formatNumber", () => {
  it("formats small numbers without suffix", () => {
    expect(formatNumber(42)).toBe("42");
    expect(formatNumber(999)).toBe("999");
  });

  it("formats thousands with K suffix", () => {
    expect(formatNumber(1500)).toBe("1.5K");
    expect(formatNumber(10000)).toBe("10.0K");
    expect(formatNumber(100000)).toBe("100.0K");
  });

  it("formats millions with M suffix", () => {
    expect(formatNumber(1500000)).toBe("1.5M");
    expect(formatNumber(2000000)).toBe("2.0M");
  });
});

describe("formatPercent", () => {
  it("formats percentage", () => {
    expect(formatPercent(75)).toBe("75%");
    expect(formatPercent(0)).toBe("0%");
    expect(formatPercent(100)).toBe("100%");
  });

  it("rounds decimals", () => {
    expect(formatPercent(75.6)).toBe("76%");
    expect(formatPercent(75.4)).toBe("75%");
  });
});
