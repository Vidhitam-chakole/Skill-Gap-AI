/**
 * Login Page — BRUTALIST
 * Reference: Design Spec Part C, Screen 2, Brutalism × Neo-Maximalism restyle
 *
 * Thick-bordered inputs, monospace labels, harsh focus states,
 * raw structural form design.
 */

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/shared/store";
import { login, type AuthResponse } from "@/shared/services/auth-service";
import { loginSchema, type LoginFormData } from "@/shared/schemas/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((s) => s.setUser);
  const setOnboardingComplete = useAuthStore((s) => s.setOnboardingComplete);

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const from = (location.state as { from?: string })?.from ?? "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");
    try {
      const response: AuthResponse = await login(data);
      setUser(response.user);
      setOnboardingComplete(true);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Login failed. Please try again.",
      );
    }
  };

  return (
    <div className="border-2 border-border-strong bg-bg-surface p-8 shadow-card">
      {/* Section header */}
      <div className="mb-6">
        <span className="brutal-overline mb-2 block">Authentication</span>
        <h2 className="font-display text-heading-lg font-black uppercase tracking-tight text-text-primary">
          Welcome back
        </h2>
        <p className="mt-1 font-mono text-body-sm text-text-secondary">
          Sign in to continue to Skill+
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        {serverError && (
          <div
            role="alert"
            className="flex items-center gap-2 border-2 border-danger bg-danger/10 px-4 py-3 font-mono text-body-sm text-danger"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {serverError}
          </div>
        )}

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="login-email"
            className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary"
          >
            Email
          </label>
          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            className={cn(
              "border-2 border-border-strong bg-bg-surface-alt font-mono text-body-sm",
              "focus:border-brand-primary focus:shadow-brutal-accent focus:ring-0",
              errors.email && "border-danger",
              touchedFields.email && !errors.email && "border-success",
            )}
            {...register("email")}
          />
          {errors.email && (
            <p id="login-email-error" className="font-mono text-caption text-danger" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="login-password"
            className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary"
          >
            Password
          </label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "login-password-error" : undefined}
              className={cn(
                "border-2 border-border-strong bg-bg-surface-alt font-mono text-body-sm pr-10",
                "focus:border-brand-primary focus:shadow-brutal-accent focus:ring-0",
                errors.password && "border-danger",
              )}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p id="login-password-error" className="font-mono text-caption text-danger" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full font-bold uppercase tracking-wider">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-border-strong" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-bg-surface px-3 font-mono text-overline font-bold uppercase text-text-tertiary">
            or
          </span>
        </div>
      </div>

      <p className="text-center font-mono text-body-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="font-bold text-brand-primary hover:underline">
          Sign up →
        </Link>
      </p>
    </div>
  );
}
