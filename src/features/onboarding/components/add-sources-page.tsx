/**
 * Add Profile Sources — BRUTALIST
 * Reference: Design Spec Part C, Screen 6, Brutalism × Neo-Maximalism restyle
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/shared/store";
import { initiateGitHubOAuth, type GitHubOAuthState } from "@/shared/services/auth-service";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, GitBranch, Loader2, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { cn } from "@/shared/utils/cn";

type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

export default function AddSourcesPage() {
  const navigate = useNavigate();
  const { setGithubConnection, setOnboardingStep, onboarding } = useAuthStore();
  const [state, setState] = useState<ConnectionState>(
    onboarding.githubConnection?.connected ? "connected" : "disconnected",
  );
  const [connectionData, setConnectionData] = useState<GitHubOAuthState | null>(onboarding.githubConnection);
  const [errorMsg, setErrorMsg] = useState("");

  const handleConnect = useCallback(async () => {
    setState("connecting");
    setErrorMsg("");
    try {
      const result = await initiateGitHubOAuth();
      setConnectionData(result);
      setGithubConnection(result);
      setState("connected");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to connect GitHub.");
      setState("error");
    }
  }, [setGithubConnection]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="brutal-tag border-brand-secondary text-brand-secondary mb-3 inline-block">Step 03</span>
        <h1 className="font-display text-heading-lg font-black uppercase tracking-tight text-text-primary">
          Add Profile Sources
        </h1>
        <p className="mt-2 font-mono text-body-md text-text-secondary">
          Connect your GitHub account to analyze your repositories.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* GitHub Card */}
        <div className={cn(
          "border-2 bg-bg-surface p-6 shadow-card transition-all",
          state === "connected" ? "border-success shadow-[4px_4px_0px_0px_var(--color-success)]" : "border-border-strong",
        )}>
          <div className="flex items-center gap-4">
            <div className={cn("p-3 border-2 border-border-strong", state === "connected" ? "bg-success/16 border-success" : "bg-bg-surface-alt")}>
              <GitBranch className={cn("h-6 w-6", state === "connected" ? "text-success" : "text-text-primary")} />
            </div>
            <div className="flex-1">
              <h3 className="font-mono text-body-md font-bold uppercase text-text-primary">GitHub</h3>
              <p className="font-mono text-body-sm text-text-secondary">
                {state === "disconnected" && "Connect your GitHub account"}
                {state === "connecting" && "Connecting to GitHub..."}
                {state === "connected" && `@${connectionData?.username} — ${connectionData?.repositories ?? 0} repos`}
                {state === "error" && errorMsg}
              </p>
            </div>
            <div className="shrink-0">
              {state === "disconnected" && (
                <Button onClick={handleConnect} variant="secondary">
                  <ExternalLink className="mr-2 h-4 w-4" /> Connect
                </Button>
              )}
              {state === "connecting" && (
                <Button disabled variant="secondary">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...
                </Button>
              )}
              {state === "connected" && <CheckCircle className="h-6 w-6 text-success" />}
              {state === "error" && (
                <Button onClick={handleConnect} variant="secondary">Retry</Button>
              )}
            </div>
          </div>
          {state === "error" && errorMsg && (
            <div className="mt-4 flex items-center gap-2 border-2 border-danger bg-danger/10 px-4 py-3 font-mono text-body-sm text-danger">
              <AlertCircle className="h-4 w-4 shrink-0" /> {errorMsg}
            </div>
          )}
        </div>

        {/* Coming soon */}
        <div className="border-2 border-dashed border-border-strong bg-bg-surface-alt p-6 text-center">
          <p className="font-mono text-body-sm text-text-tertiary uppercase tracking-wider">
            More sources (GitLab, Bitbucket) coming soon...
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => navigate("/onboarding/career-profile")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={() => { setOnboardingStep(3); navigate("/onboarding/verify-sources"); }} disabled={state !== "connected"} className="font-bold uppercase tracking-wider">
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
