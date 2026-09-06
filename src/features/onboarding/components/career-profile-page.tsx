/**
 * Career Profile Setup — BRUTALIST
 * Reference: Design Spec Part C, Screen 5, Brutalism × Neo-Maximalism restyle
 */

import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  careerProfileSchema,
  type CareerProfileFormData,
  CAREER_GOALS,
  EXPERIENCE_LEVELS,
} from "@/shared/schemas/forms";
import { useAuthStore } from "@/shared/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export default function CareerProfilePage() {
  const navigate = useNavigate();
  const { setCareerProfile, setOnboardingStep, onboarding } = useAuthStore();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CareerProfileFormData>({
    resolver: zodResolver(careerProfileSchema),
    mode: "onBlur",
    defaultValues: {
      company: onboarding.careerProfile?.company ?? "",
      currentRole: onboarding.careerProfile?.currentRole ?? "",
      targetRole: onboarding.careerProfile?.targetRole ?? "",
      yearsOfExperience: onboarding.careerProfile?.yearsOfExperience ?? 3,
      experienceLevel: onboarding.careerProfile?.experienceLevel ?? "mid",
      careerPath: onboarding.careerProfile?.careerPath ?? "",
      careerGoals: onboarding.careerProfile?.careerGoals ?? [],
    },
  });

  const onSubmit = (data: CareerProfileFormData) => {
    setCareerProfile({
      company: data.company,
      currentRole: data.currentRole,
      targetRole: data.targetRole,
      yearsOfExperience: data.yearsOfExperience,
      experienceLevel: data.experienceLevel,
      careerPath: data.careerPath ?? "",
      careerGoals: data.careerGoals,
    });
    setOnboardingStep(2);
    navigate("/onboarding/add-sources");
  };

  const inputClass = cn(
    "border-2 border-border-strong bg-bg-surface-alt font-mono text-body-sm",
    "focus:border-brand-primary focus:shadow-brutal-accent focus:ring-0",
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      <div>
        <span className="brutal-tag border-brand-primary text-brand-primary mb-3 inline-block">Step 02</span>
        <h1 className="font-display text-heading-lg font-black uppercase tracking-tight text-text-primary">
          Career Profile
        </h1>
        <p className="mt-2 font-mono text-body-md text-text-secondary">
          Tell us about your career so we can tailor recommendations.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Company */}
        <div className="flex flex-col gap-2">
          <label htmlFor="cp-company" className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary">
            Company <span className="text-danger">*</span>
          </label>
          <Input
            id="cp-company"
            placeholder="Acme Corp"
            aria-invalid={!!errors.company}
            className={cn(inputClass, errors.company && "border-danger")}
            {...register("company")}
          />
          {errors.company && <p className="font-mono text-caption text-danger">{errors.company.message}</p>}
        </div>

        {/* Current Role */}
        <div className="flex flex-col gap-2">
          <label htmlFor="cp-current-role" className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary">
            Current Role <span className="text-danger">*</span>
          </label>
          <Input
            id="cp-current-role"
            placeholder="Senior Software Engineer"
            aria-invalid={!!errors.currentRole}
            className={cn(inputClass, errors.currentRole && "border-danger")}
            {...register("currentRole")}
          />
          {errors.currentRole && <p className="font-mono text-caption text-danger">{errors.currentRole.message}</p>}
        </div>

        {/* Target Role */}
        <div className="flex flex-col gap-2">
          <label htmlFor="cp-target-role" className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary">
            Target Role <span className="text-danger">*</span>
          </label>
          <Input
            id="cp-target-role"
            placeholder="Staff Engineer"
            aria-invalid={!!errors.targetRole}
            className={cn(inputClass, errors.targetRole && "border-danger")}
            {...register("targetRole")}
          />
          {errors.targetRole && <p className="font-mono text-caption text-danger">{errors.targetRole.message}</p>}
        </div>

        {/* Years + Level */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="cp-years" className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary">
              Years of Experience <span className="text-danger">*</span>
            </label>
            <Input
              id="cp-years"
              type="number"
              placeholder="5"
              min={0}
              max={50}
              aria-invalid={!!errors.yearsOfExperience}
              className={cn(inputClass, errors.yearsOfExperience && "border-danger")}
              {...register("yearsOfExperience", { valueAsNumber: true })}
            />
            {errors.yearsOfExperience && <p className="font-mono text-caption text-danger">{errors.yearsOfExperience.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="cp-level" className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary">
              Experience Level <span className="text-danger">*</span>
            </label>
            <select
              id="cp-level"
              className={cn(inputClass, "h-10 px-3 py-2")}
              {...register("experienceLevel")}
            >
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Career Path */}
        <div className="flex flex-col gap-2">
          <label htmlFor="cp-career-path" className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary">
            Career Path <span className="text-text-tertiary">(optional)</span>
          </label>
          <Input
            id="cp-career-path"
            placeholder="e.g., Backend → Full-Stack → Staff"
            className={inputClass}
            {...register("careerPath")}
          />
        </div>

        {/* Career Goals */}
        <div className="flex flex-col gap-2">
          <label className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary">
            Career Goals <span className="text-danger">*</span>
          </label>
          <Controller
            name="careerGoals"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {CAREER_GOALS.map((goal) => {
                  const selected = field.value.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => {
                        field.onChange(
                          selected
                            ? field.value.filter((g) => g !== goal.id)
                            : [...field.value, goal.id],
                        );
                      }}
                      className={cn(
                        "border-2 px-3 py-1.5 font-mono text-caption font-bold uppercase tracking-wider transition-all",
                        selected
                          ? "border-brand-primary bg-brand-primary/16 text-brand-primary shadow-brutal-accent"
                          : "border-border-strong bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary",
                      )}
                    >
                      {goal.label}
                    </button>
                  );
                })}
              </div>
            )}
          />
          {errors.careerGoals && <p className="font-mono text-caption text-danger">{errors.careerGoals.message}</p>}
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={() => navigate("/onboarding/profile-type")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="submit" className="font-bold uppercase tracking-wider">
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
