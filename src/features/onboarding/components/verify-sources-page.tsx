/**
 * Verify Profile Sources — BRUTALIST × NEO-MAXIMALIST
 * Reference: Design Spec Part C, Screen 7, Brutalism restyle
 *
 * Raw verification flow with thick borders, monospace status,
 * structural progress indicators.
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/shared/store";
import { verifyGitHubConnection } from "@/shared/services/auth-service";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle,
  GitBranch,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";

type VerifyState = "idle" | "checking" | "success" | "error";

interface VerifyResult {
  username: string;
  repoCount: number;
  error?: string;
}

export default function VerifySourcesPage() {
  const navigate = useNavigate();
  const { setOnboardingComplete, setOnboardingStep, onboarding } = useAuthStore();
  const [state, setState] = useState<VerifyState>("idle");
  const [result, setResult] = useState<VerifyResult | null>(null);

  const handleVerify = useCallback(async () => {
    setState("checking");
    try {
      const verification = await verifyGitHubConnection();
      if (verification.valid) {
        setResult({
          username: verification.username,
          repoCount: verification.repoCount,
        });
        setState("success");
      } else {
        setResult({
          username: "",
          repoCount: 0,
          error: verification.error ?? "Verification failed",
        });
        setState("error");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Verification failed";
      setResult({ username: "", repoCount: 0, error: message });
      setState("error");
    }
  }, []);

  const handleComplete = () => {
    setOnboardingComplete(true);
    setOnboardingStep(4);
    navigate("/analyze", { replace: true });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <span className="brutal-overline text-text-tertiary">Step 4 of 4</span>
        <h1 className="mt-1 font-display text-heading-xl font-black uppercase tracking-tight text-text-primary">
          Verify Sources
        </h1>
        <p className="mt-2 font-mono text-body-md text-text-secondary">
          Confirm your GitHub connection is working correctly.
        </p>
      </div>

      {/* Verification Card */}
      <div
        className={cn(
          "border-2 bg-bg-surface p-6 shadow-card transition-all",
          state === "success"
            ? "border-success"
            : state === "error"
              ? "border-danger"
              : "border-border-strong",
        )}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "border-2 p-3",
              state === "success"
                ? "border-success bg-success/10 text-success"
                : state === "error"
                  ? "border-danger bg-danger/10 text-danger"
                  : "border-border-subtle bg-bg-surface-alt text-text-secondary",
            )}
          >
            <GitBranch className="h-6 w-6" />
          </div>

          <div className="flex-1">
            <h3 className="font-mono text-body-md font-bold uppercase tracking-wide text-text-primary">
              GitHub
            </h3>
            <p className="mt-1 font-mono text-body-sm text-text-secondary">
              {state === "idle" && "Click verify to check your connection"}
              {state === "checking" && "Verifying connection..."}
              {state === "success" &&
                `Connected as @${result?.username}`}
              {state === "error" &&
                (result?.error ?? "Verification failed")}
            </p>
            {state === "success" && result && (
              <p className="mt-1 font-mono text-caption text-success">
                {result.repoCount} repositories accessible
              </p>
            )}
          </div>

          <div className="shrink-0">
            {state === "idle" && (
              <Button onClick={handleVerify} variant="secondary" className="font-bold uppercase tracking-wider">
                Verify
              </Button>
            )}
            {state === "checking" && (
              <Button disabled variant="secondary">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </Button>
            )}
            {state === "success" && (
              <div className="border-2 border-success p-2">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            )}
            {state === "error" && (
              <Button onClick={handleVerify} variant="secondary" className="font-bold uppercase">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            )}
          </div>
        </div>

        {/* Error detail */}
        {state === "error" && result?.error && (
          <div className="mt-4 flex items-center gap-3 border-2 border-danger bg-danger/8 px-4 py-3 font-mono text-body-sm text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {result.error}
          </div>
        )}

        {/* Success detail */}
        {state === "success" && (
          <div className="mt-4 border-2 border-success bg-success/6 px-4 py-3 font-mono text-body-sm text-success">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>
                Your GitHub account is connected and verified. We can access
                your public repositories for analysis.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between border-t-2 border-border-strong pt-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/onboarding/add-sources")}
          className="font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleComplete}
          disabled={state !== "success"}
          className="font-bold uppercase tracking-wider"
        >
          Start Analysis
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
