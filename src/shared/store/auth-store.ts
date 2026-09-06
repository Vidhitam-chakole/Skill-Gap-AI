import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Developer, CareerProfile, ExperienceLevel } from "@/shared/types";
import type { GitHubOAuthState } from "@/shared/services/auth-service";

export type ProfileType = "student" | "professional" | null;

interface OnboardingData {
  profileType: ProfileType;
  careerProfile: CareerProfile | null;
  githubConnection: GitHubOAuthState | null;
  currentStep: number;
}

interface AuthState {
  user: Developer | null;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  onboarding: OnboardingData;
  setUser: (user: Developer | null) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setProfileType: (type: ProfileType) => void;
  setCareerProfile: (profile: CareerProfile) => void;
  setGithubConnection: (connection: GitHubOAuthState) => void;
  setOnboardingStep: (step: number) => void;
  logout: () => void;
}

const defaultOnboarding: OnboardingData = {
  profileType: null,
  careerProfile: null,
  githubConnection: null,
  currentStep: 0,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      onboardingComplete: false,
      onboarding: defaultOnboarding,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setOnboardingComplete: (complete) =>
        set({ onboardingComplete: complete }),
      setProfileType: (type) =>
        set((state) => ({
          onboarding: { ...state.onboarding, profileType: type },
        })),
      setCareerProfile: (profile) =>
        set((state) => ({
          onboarding: { ...state.onboarding, careerProfile: profile },
        })),
      setGithubConnection: (connection) =>
        set((state) => ({
          onboarding: { ...state.onboarding, githubConnection: connection },
        })),
      setOnboardingStep: (step) =>
        set((state) => ({
          onboarding: { ...state.onboarding, currentStep: step },
        })),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          onboardingComplete: false,
          onboarding: defaultOnboarding,
        }),
    }),
    { name: "skill-plus-auth" },
  ),
);
