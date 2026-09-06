/**
 * Auth Service
 * Reference: Skill+ Master Product Blueprint v1.0, Part IV §IV.7
 *
 * Thin domain wrapper over the API layer for authentication.
 * Feature flag: featureFlags.authStrategy (Gap #6)
 * When flag is off, uses mock implementations.
 */

import type { Developer } from "@/shared/types";
import { apiClient, endpoints } from "@/shared/api/client";
import { featureFlags } from "@/shared/config/env";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Developer;
  token: string;
}

/**
 * Login with email/password.
 * When authStrategy flag is off, uses mock data.
 */
export async function login(request: LoginRequest): Promise<AuthResponse> {
  if (featureFlags.authStrategy) {
    const response = await apiClient.post<AuthResponse>(endpoints.auth.login, request);
    apiClient.setAuthToken(response.token);
    localStorage.setItem("skill+-auth-token", response.token);
    return response;
  }

  // Mock: simulate network delay
  await new Promise((r) => setTimeout(r, 800));

  if (request.password === "wrong") {
    throw new Error("Invalid email or password");
  }

  const mockUser: Developer = {
    username: request.email.split("@")[0] ?? "user",
    name: request.email.split("@")[0] ?? "User",
    email: request.email,
    avatar: "",
    bio: "Full-stack developer passionate about engineering intelligence.",
    topLanguages: ["TypeScript", "React", "Node.js"],
    joinDate: new Date().toISOString(),
  };

  return {
    user: mockUser,
    token: "mock-jwt-token-" + Date.now(),
  };
}

/**
 * Sign up with email/password.
 */
export async function signup(request: SignupRequest): Promise<AuthResponse> {
  if (featureFlags.authStrategy) {
    const response = await apiClient.post<AuthResponse>(endpoints.auth.signup, request);
    apiClient.setAuthToken(response.token);
    localStorage.setItem("skill+-auth-token", response.token);
    return response;
  }

  // Mock: simulate network delay
  await new Promise((r) => setTimeout(r, 800));

  const mockUser: Developer = {
    username: request.name.toLowerCase().replace(/\s+/g, ""),
    name: request.name,
    email: request.email,
    avatar: "",
    bio: "",
    topLanguages: [],
    joinDate: new Date().toISOString(),
  };

  return {
    user: mockUser,
    token: "mock-jwt-token-" + Date.now(),
  };
}

/**
 * Fetch current authenticated user.
 */
export async function fetchCurrentUser(): Promise<Developer | null> {
  if (featureFlags.authStrategy) {
    try {
      return await apiClient.get<Developer>(endpoints.auth.me);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Logout — clears token and calls backend.
 */
export async function logoutUser(): Promise<void> {
  if (featureFlags.authStrategy) {
    try {
      await apiClient.post(endpoints.auth.logout);
    } catch {
      // Ignore logout errors
    }
  }
  apiClient.setAuthToken(null);
  localStorage.removeItem("skill+-auth-token");
}

// ============================================================
// GitHub OAuth
// Reference: Part I §12, Gap #6, Gap #8
// ============================================================

export interface GitHubOAuthState {
  connected: boolean;
  username: string | null;
  avatarUrl: string | null;
  repositories: number;
}

export async function initiateGitHubOAuth(): Promise<GitHubOAuthState> {
  if (featureFlags.githubVerify) {
    return apiClient.get<GitHubOAuthState>(endpoints.auth.github);
  }

  // Mock: simulate OAuth popup delay
  await new Promise((r) => setTimeout(r, 1500));

  return {
    connected: true,
    username: "octocat",
    avatarUrl: "",
    repositories: 12,
  };
}

export async function verifyGitHubConnection(): Promise<{
  valid: boolean;
  username: string;
  repoCount: number;
  error?: string;
}> {
  if (featureFlags.githubVerify) {
    return apiClient.get(endpoints.auth.githubCallback);
  }

  // Mock: simulate verification delay
  await new Promise((r) => setTimeout(r, 1200));

  return {
    valid: true,
    username: "octocat",
    repoCount: 12,
  };
}

export async function disconnectGitHub(): Promise<void> {
  if (featureFlags.githubVerify) {
    await apiClient.delete(endpoints.auth.github);
    return;
  }
  await new Promise((r) => setTimeout(r, 300));
}
