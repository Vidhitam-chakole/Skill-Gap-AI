/**
 * Profile Type Selection — BRUTALIST
 *
 * Small intermediate screen between Welcome and Career Profile.
 * NOT a new numbered onboarding step — just a transition screen.
 */

import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/shared/store";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, GraduationCap, Briefcase } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { ProfileType } from "@/shared/store/auth-store";

export default function ProfileTypePage() {
  const navigate = useNavigate();
  const { profileType, setProfileType } = useAuthStore((s) => s.onboarding);
  const setProfile = useAuthStore((s) => s.setProfileType);

  const select = (type: ProfileType) => {
    setProfile(type);
    navigate("/onboarding/career-profile");
  };

  const optionClass = (active: boolean) =>
    cn(
      "flex flex-col items-center gap-3 border-2 px-6 py-5 font-mono transition-all",
      "hover:shadow-brutal-accent hover:-translate-y-0.5",
      active
        ? "border-brand-primary bg-brand-primary/16 text-brand-primary shadow-brutal-accent"
        : "border-border-strong bg-bg-surface text-text-secondary hover:border-brand-primary hover:text-text-primary",
    );

  return (
    <div className="flex flex-col items-start gap-6">
      <div>
        <span className="brutal-tag border-brand-primary text-brand-primary mb-3 inline-block">
          Step 01
        </span>
        <h1 className="font-display text-heading-lg font-black uppercase tracking-tight text-text-primary">
          Are you a…
        </h1>
      </div>

      <div className="flex w-full flex-col gap-4 sm:flex-row">
        <button
          type="button"
          onClick={() => select("student")}
          className={optionClass(profileType === "student")}
        >
          <GraduationCap className="h-8 w-8" />
          <span className="font-display text-body-lg font-bold uppercase tracking-wider">
            Student
          </span>
        </button>

        <button
          type="button"
          onClick={() => select("professional")}
          className={optionClass(profileType === "professional")}
        >
          <Briefcase className="h-8 w-8" />
          <span className="font-display text-body-lg font-bold uppercase tracking-wider">
            Working Professional
          </span>
        </button>
      </div>

      <div className="flex justify-start">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate("/onboarding/welcome")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    </div>
  );
}
