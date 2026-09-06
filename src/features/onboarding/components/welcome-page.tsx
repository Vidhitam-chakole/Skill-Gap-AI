/**
 * Welcome Page — BRUTALIST
 * Reference: Design Spec Part C, Screen 4, Brutalism × Neo-Maximalism restyle
 */

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-start gap-6">
      <div className="flex items-center gap-4">
        <div className="border-2 border-brand-primary bg-brand-primary/16 p-4">
          <Zap className="h-10 w-10 text-brand-primary" />
        </div>
        <span className="brutal-tag border-brand-primary text-brand-primary">
          Step 01
        </span>
      </div>

      <h1 className="font-display text-heading-xl font-black uppercase tracking-tight text-text-primary">
        Welcome to Skill<span className="text-brand-primary">+</span>
      </h1>

      <p className="max-w-lg font-mono text-body-lg text-text-secondary leading-relaxed">
        Let&apos;s build your engineering profile. We&apos;ll connect your GitHub
        and analyze your skills, architecture patterns, and code quality —
        with <span className="text-brand-primary font-bold">evidence</span> for every insight.
      </p>

      {/* Feature bullets */}
      <div className="flex flex-col gap-2 border-l-4 border-brand-primary pl-4">
        {[
          "Skills detection with confidence scores",
          "Architecture pattern recognition",
          "Repository quality analysis",
          "Personalized career recommendations",
        ].map((item) => (
          <span key={item} className="font-mono text-body-sm text-text-secondary">
            → {item}
          </span>
        ))}
      </div>

      <Button size="lg" onClick={() => navigate("/onboarding/profile-type")} className="mt-2 font-bold uppercase tracking-wider">
        Get Started
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}
