/**
 * Routing Architecture
 * Reference: Skill+ Master Product Blueprint v1.0, Part IV §IV.3
 *
 * Routes mirror Architecture §1 exactly; every route maps to a screen in Design Spec Part C.
 *
 * Route conventions:
 * - Protected routes use <RequireAuth> that checks Auth Store
 * - Onboarding-gated routes check onboardingComplete flag
 * - Nested routes under /dashboard/* render inside DashboardShell via <Outlet>
 * - Dynamic routes validated at loader level
 * - Loading: route-level Suspense fallbacks use screen skeletons
 * - Error: each route defines errorElement with its Error State component
 */

import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { DashboardShell } from "@/shared/layouts/dashboard-shell";
import { AuthShell } from "@/shared/layouts/auth-shell";
import { OnboardingShell } from "@/shared/layouts/onboarding-shell";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { RequireOnboarding } from "@/features/onboarding/components/require-onboarding";

// ============================================================
// Lazy-loaded feature pages (route-level code splitting)
// ============================================================

// Auth
const LoginPage = lazy(() => import("@/features/auth/components/login-page"));
const SignupPage = lazy(
  () => import("@/features/auth/components/signup-page"),
);

// Onboarding
const WelcomePage = lazy(
  () => import("@/features/onboarding/components/welcome-page"),
);
const ProfileTypePage = lazy(
  () => import("@/features/onboarding/components/profile-type-page"),
);
const CareerProfilePage = lazy(
  () => import("@/features/onboarding/components/career-profile-page"),
);
const AddSourcesPage = lazy(
  () => import("@/features/onboarding/components/add-sources-page"),
);
const VerifySourcesPage = lazy(
  () => import("@/features/onboarding/components/verify-sources-page"),
);

// Analysis
const PipelinePage = lazy(
  () => import("@/features/analysis/components/pipeline-page"),
);

// Dashboard
const OverviewPage = lazy(
  () => import("@/features/dashboard/components/overview-page"),
);

// Repositories
const RepositoryExplorer = lazy(
  () => import("@/features/repositories/components/repository-explorer"),
);
const RepositoryDetail = lazy(
  () => import("@/features/repositories/components/repository-detail"),
);

// Skills
const SkillsExplorer = lazy(
  () => import("@/features/skills/components/skills-explorer"),
);
const SkillDetail = lazy(
  () => import("@/features/skills/components/skill-detail"),
);

// Architecture
const ArchitectureExplorer = lazy(
  () => import("@/features/architecture/components/architecture-explorer"),
);

// Quality
const RepositoryQuality = lazy(
  () => import("@/features/quality/components/repository-quality"),
);

// Report
const EngineeringReport = lazy(
  () => import("@/features/report/components/engineering-report"),
);

// Recommendations
const RecommendationsPage = lazy(
  () => import("@/features/recommendations/components/recommendations-page"),
);

// Roadmap
const LearningRoadmap = lazy(
  () => import("@/features/roadmap/components/learning-roadmap"),
);

// Mentor
const AiCareerMentor = lazy(
  () => import("@/features/mentor/components/ai-career-mentor"),
);

// Workspace
const LearningWorkspace = lazy(
  () => import("@/features/workspace/components/learning-workspace"),
);

// Export
const ExportPage = lazy(
  () => import("@/features/export/components/export-page"),
);

// Settings
const SettingsPage = lazy(
  () => import("@/features/settings/components/settings-page"),
);

// History
const HistoryPage = lazy(
  () => import("@/features/history/components/history-page"),
);

// Recruiter
const RecruiterView = lazy(
  () => import("@/features/recruiter/components/recruiter-view"),
);

// Landing
const LandingPage = lazy(
  () => import("@/features/auth/components/landing-page"),
);

// ============================================================
// Loading fallback
// ============================================================
function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
        <span className="text-body-sm text-text-secondary">Loading...</span>
      </div>
    </div>
  );
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

// ============================================================
// Router
// ============================================================
export const router = createBrowserRouter([
  // Landing (public)
  {
    path: "/",
    element: (
      <SuspenseWrapper>
        <LandingPage />
      </SuspenseWrapper>
    ),
  },

  // Auth (public)
  {
    path: "/",
    element: <AuthShell />,
    children: [
      {
        path: "login",
        element: (
          <SuspenseWrapper>
            <LoginPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "signup",
        element: (
          <SuspenseWrapper>
            <SignupPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },

  // Onboarding (protected, requires incomplete onboarding)
  {
    path: "/onboarding",
    element: (
      <RequireAuth>
        <OnboardingShell />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/onboarding/welcome" replace />,
      },
      {
        path: "welcome",
        element: (
          <SuspenseWrapper>
            <WelcomePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "profile-type",
        element: (
          <SuspenseWrapper>
            <ProfileTypePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "career-profile",
        element: (
          <SuspenseWrapper>
            <CareerProfilePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "add-sources",
        element: (
          <SuspenseWrapper>
            <AddSourcesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "verify-sources",
        element: (
          <SuspenseWrapper>
            <VerifySourcesPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },

  // Analysis (protected, requires onboarding)
  {
    path: "/analyze",
    element: (
      <RequireAuth>
        <RequireOnboarding>
          <SuspenseWrapper>
            <PipelinePage />
          </SuspenseWrapper>
        </RequireOnboarding>
      </RequireAuth>
    ),
  },

  // Dashboard (protected, requires onboarding)
  {
    path: "/dashboard",
    element: (
      <RequireAuth>
        <RequireOnboarding>
          <DashboardShell />
        </RequireOnboarding>
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <OverviewPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "repositories",
        element: (
          <SuspenseWrapper>
            <RepositoryExplorer />
          </SuspenseWrapper>
        ),
      },
      {
        path: "repositories/:repoId",
        element: (
          <SuspenseWrapper>
            <RepositoryDetail />
          </SuspenseWrapper>
        ),
      },
      {
        path: "skills",
        element: (
          <SuspenseWrapper>
            <SkillsExplorer />
          </SuspenseWrapper>
        ),
      },
      {
        path: "skills/:skillId",
        element: (
          <SuspenseWrapper>
            <SkillDetail />
          </SuspenseWrapper>
        ),
      },
      {
        path: "architecture",
        element: (
          <SuspenseWrapper>
            <ArchitectureExplorer />
          </SuspenseWrapper>
        ),
      },
      {
        path: "quality",
        element: (
          <SuspenseWrapper>
            <RepositoryQuality />
          </SuspenseWrapper>
        ),
      },
      {
        path: "report",
        element: (
          <SuspenseWrapper>
            <EngineeringReport />
          </SuspenseWrapper>
        ),
      },
      {
        path: "recommendations",
        element: (
          <SuspenseWrapper>
            <RecommendationsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "roadmap",
        element: (
          <SuspenseWrapper>
            <LearningRoadmap />
          </SuspenseWrapper>
        ),
      },
      {
        path: "mentor",
        element: (
          <SuspenseWrapper>
            <AiCareerMentor />
          </SuspenseWrapper>
        ),
      },
      {
        path: "workspace",
        element: (
          <SuspenseWrapper>
            <LearningWorkspace />
          </SuspenseWrapper>
        ),
      },
      {
        path: "export",
        element: (
          <SuspenseWrapper>
            <ExportPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "settings",
        element: (
          <SuspenseWrapper>
            <SettingsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "history",
        element: (
          <SuspenseWrapper>
            <HistoryPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },

  // Recruiter View (public, token-gated)
  {
    path: "/share/:shareToken",
    element: (
      <SuspenseWrapper>
        <RecruiterView />
      </SuspenseWrapper>
    ),
  },

  // Catch-all redirect
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
