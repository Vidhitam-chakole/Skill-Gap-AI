/**
 * Auth Store Tests — Fixed to match actual store API
 */

import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../auth-store";
import type { Developer } from "@/shared/types";

const mockUser: Developer = {
  username: "testuser",
  name: "Test User",
  email: "test@example.com",
  avatar: "",
  bio: "Test bio",
  topLanguages: ["TypeScript"],
  joinDate: "2026-01-01T00:00:00Z",
};

describe("AuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      onboardingComplete: false,
      onboarding: { careerProfile: null, githubConnection: null, currentStep: 0 },
    });
    localStorage.clear();
  });

  it("starts unauthenticated", () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it("sets user and marks authenticated", () => {
    const { setUser } = useAuthStore.getState();
    setUser(mockUser);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.username).toBe("testuser");
  });

  it("logout clears state", () => {
    const { setUser, logout } = useAuthStore.getState();
    setUser(mockUser);
    logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it("tracks onboarding step", () => {
    const { setOnboardingStep } = useAuthStore.getState();
    setOnboardingStep(2);
    expect(useAuthStore.getState().onboarding.currentStep).toBe(2);
  });

  it("completes onboarding", () => {
    const { setOnboardingComplete } = useAuthStore.getState();
    setOnboardingComplete(true);
    expect(useAuthStore.getState().onboardingComplete).toBe(true);
  });

  it("stores career profile in onboarding", () => {
    const { setCareerProfile } = useAuthStore.getState();
    const profile = {
      company: "Acme",
      currentRole: "Engineer",
      targetRole: "Staff",
      yearsOfExperience: 5,
      experienceLevel: "senior" as const,
      careerPath: "Staff",
      careerGoals: ["Staff Engineer"],
    };
    setCareerProfile(profile);
    expect(useAuthStore.getState().onboarding.careerProfile?.company).toBe("Acme");
  });

  it("stores github connection in onboarding", () => {
    const { setGithubConnection } = useAuthStore.getState();
    setGithubConnection({ connected: true, username: "octocat", avatarUrl: null, repositories: 12 });
    expect(useAuthStore.getState().onboarding.githubConnection?.username).toBe("octocat");
  });
});
