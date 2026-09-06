/**
 * Auth Flow Integration Tests — Final Fix
 * Tests the login/signup form rendering and validation.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { useAuthStore } from "@/shared/store/auth-store";
import LoginPage from "../components/login-page";
import SignupPage from "../components/signup-page";

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe("Login Page", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      onboardingComplete: false,
      onboarding: { careerProfile: null, githubConnection: null, currentStep: 0 },
    });
    localStorage.clear();
  });

  it("renders login form with email and password fields", () => {
    render(<LoginPage />, { wrapper: TestWrapper });
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign In/i })).toBeInTheDocument();
  });

  it("shows validation error for empty email on blur", async () => {
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper: TestWrapper });

    const emailInput = screen.getByLabelText(/Email/i);
    await user.click(emailInput);
    await user.tab(); // blur

    // Zod validation shows error on blur
    await screen.findByText(/required/i);
  });

  it("shows validation error for empty password on blur", async () => {
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper: TestWrapper });

    const passwordInput = screen.getByLabelText(/Password/i);
    await user.click(passwordInput);
    await user.tab(); // blur

    await screen.findByText(/required/i);
  });
});

describe("Signup Page", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      onboardingComplete: false,
      onboarding: { careerProfile: null, githubConnection: null, currentStep: 0 },
    });
    localStorage.clear();
  });

  it("renders signup form with all fields", () => {
    render(<SignupPage />, { wrapper: TestWrapper });
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Account/i })).toBeInTheDocument();
  });

  it("shows password strength checks on typing", async () => {
    const user = userEvent.setup();
    render(<SignupPage />, { wrapper: TestWrapper });

    const passwordInput = screen.getByLabelText(/^Password/i);
    await user.type(passwordInput, "weak");

    // Should show password check labels (8+ chars, UPPER, lower, 0-9)
    expect(screen.getByText("8+ chars")).toBeInTheDocument();
    expect(screen.getByText("UPPER")).toBeInTheDocument();
    expect(screen.getByText("lower")).toBeInTheDocument();
    expect(screen.getByText("0-9")).toBeInTheDocument();
  });

  it("shows confirm password mismatch", async () => {
    const user = userEvent.setup();
    render(<SignupPage />, { wrapper: TestWrapper });

    const passwordInput = screen.getByLabelText(/^Password/i);
    const confirmInput = screen.getByLabelText(/Confirm Password/i);
    await user.type(passwordInput, "StrongPass1");
    await user.type(confirmInput, "DifferentPass1");
    await user.tab(); // blur confirm

    await screen.findByText(/match/i);
  });
});
