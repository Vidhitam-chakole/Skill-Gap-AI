/**
 * Signup Page — BRUTALIST
 * Reference: Design Spec Part C, Screen 3, Brutalism × Neo-Maximalism restyle
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/shared/store";
import { signup, type AuthResponse } from "@/shared/services/auth-service";
import { signupSchema, type SignupFormData } from "@/shared/schemas/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, AlertCircle, Check, X } from "lucide-react";
import { cn } from "@/shared/utils/cn";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ chars", met: password.length >= 8 },
    { label: "UPPER", met: /[A-Z]/.test(password) },
    { label: "lower", met: /[a-z]/.test(password) },
    { label: "0-9", met: /\d/.test(password) },
  ];

  if (!password) return null;
  const metCount = checks.filter((c) => c.met).length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 border border-border-subtle transition-colors",
              i < metCount
                ? metCount <= 2
                  ? "bg-danger"
                  : metCount === 3
                    ? "bg-warning"
                    : "bg-success"
                : "bg-bg-surface-alt",
            )}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map((check) => (
          <span
            key={check.label}
            className={cn(
              "flex items-center gap-1 font-mono text-overline font-bold uppercase tracking-wider",
              check.met ? "text-success" : "text-text-tertiary",
            )}
          >
            {check.met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            {check.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password");

  const onSubmit = async (data: SignupFormData) => {
    setServerError("");
    try {
      const response: AuthResponse = await signup({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setUser(response.user);
      navigate("/onboarding/welcome", { replace: true });
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Failed to create account.",
      );
    }
  };

  return (
    <div className="border-2 border-border-strong bg-bg-surface p-8 shadow-card">
      <div className="mb-6">
        <span className="brutal-overline mb-2 block">Get started</span>
        <h2 className="font-display text-heading-lg font-black uppercase tracking-tight text-text-primary">
          Create account
        </h2>
        <p className="mt-1 font-mono text-body-sm text-text-secondary">
          Start analyzing your engineering profile
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {serverError && (
          <div role="alert" className="flex items-center gap-2 border-2 border-danger bg-danger/10 px-4 py-3 font-mono text-body-sm text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {serverError}
          </div>
        )}

        {/* Name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="signup-name" className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary">
            Full Name
          </label>
          <Input
            id="signup-name"
            placeholder="John Doe"
            autoComplete="name"
            aria-invalid={!!errors.name}
            className={cn(
              "border-2 border-border-strong bg-bg-surface-alt font-mono text-body-sm",
              "focus:border-brand-primary focus:shadow-brutal-accent focus:ring-0",
              errors.name && "border-danger",
              touchedFields.name && !errors.name && "border-success",
            )}
            {...register("name")}
          />
          {errors.name && <p className="font-mono text-caption text-danger" role="alert">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="signup-email" className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary">
            Email
          </label>
          <Input
            id="signup-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            className={cn(
              "border-2 border-border-strong bg-bg-surface-alt font-mono text-body-sm",
              "focus:border-brand-primary focus:shadow-brutal-accent focus:ring-0",
              errors.email && "border-danger",
              touchedFields.email && !errors.email && "border-success",
            )}
            {...register("email")}
          />
          {errors.email && <p className="font-mono text-caption text-danger" role="alert">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label htmlFor="signup-password" className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary">
            Password
          </label>
          <div className="relative">
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              className={cn(
                "border-2 border-border-strong bg-bg-surface-alt font-mono text-body-sm pr-10",
                "focus:border-brand-primary focus:shadow-brutal-accent focus:ring-0",
                errors.password && "border-danger",
              )}
              {...register("password")}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary" tabIndex={-1}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrength password={passwordValue} />
          {errors.password && <p className="font-mono text-caption text-danger" role="alert">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-2">
          <label htmlFor="signup-confirm" className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary">
            Confirm Password
          </label>
          <div className="relative">
            <Input
              id="signup-confirm"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              className={cn(
                "border-2 border-border-strong bg-bg-surface-alt font-mono text-body-sm pr-10",
                "focus:border-brand-primary focus:shadow-brutal-accent focus:ring-0",
                errors.confirmPassword && "border-danger",
              )}
              {...register("confirmPassword")}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary" tabIndex={-1}>
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="font-mono text-caption text-danger" role="alert">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full font-bold uppercase tracking-wider">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center font-mono text-body-sm text-text-secondary">
        Already have an account?{" "}
        <Link to="/login" className="font-bold text-brand-primary hover:underline">
          Sign in →
        </Link>
      </p>
    </div>
  );
}
