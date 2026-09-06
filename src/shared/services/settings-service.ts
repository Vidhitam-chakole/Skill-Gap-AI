/**
 * Settings Service
 * Mock data for Settings page.
 */

import type { UserSettings } from "@/shared/types";
import { apiClient, endpoints } from "@/shared/api/client";
import { featureFlags } from "@/shared/config/env";

const MOCK_SETTINGS: UserSettings = {
  account: { name: "Developer", email: "dev@example.com", avatar: "" },
  careerProfile: {
    company: "Acme Corp",
    yearsOfExperience: 5,
    currentRole: "Software Engineer",
    careerPath: "Staff Engineer",
    targetRole: "Staff Engineer",
    experienceLevel: "senior",
    careerGoals: ["Staff Engineer", "Open Source Leader", "Technical Writer"],
  },
  notificationPrefs: { emailDigest: true, skillUpdates: true, recommendations: true },
  theme: "dark",
};

export async function fetchSettings(): Promise<UserSettings> {
  if (featureFlags.careerProfile) {
    return apiClient.get<UserSettings>(endpoints.settings.get);
  }
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_SETTINGS;
}

export async function updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  if (featureFlags.careerProfile) {
    return apiClient.put<UserSettings>(endpoints.settings.update, settings);
  }
  await new Promise((r) => setTimeout(r, 300));
  return { ...MOCK_SETTINGS, ...settings };
}
