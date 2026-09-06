/**
 * Landing Page — BRUTALIST × NEO-MAXIMALIST
 * Reference: Design Spec Part C, Screen 1, Brutalism × Neo-Maximalism restyle
 *
 * Bold raw typography, overlapping elements, thick borders,
 * high contrast, maximal density, structural honesty.
 */

import { Link } from "react-router-dom";
import { ArrowRight, GitBranch, BarChart3, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      {/* Nav */}
      <header className="flex items-center justify-between border-b-2 border-border-strong px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-brand-primary text-text-inverse shadow-brutal">
            <span className="font-mono text-sm font-black">S+</span>
          </div>
          <span className="font-mono text-heading-md font-black uppercase tracking-tight text-text-primary">
            Skill<span className="text-brand-primary">+</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero — Neo-Maximalist */}
      <section className="relative mx-auto max-w-6xl px-6 py-20 md:py-32">
        {/* Background accent stripes */}
        <div className="absolute right-0 top-0 h-64 w-64 bg-brand-primary/8 -skew-x-12" />
        <div className="absolute bottom-0 left-0 h-48 w-48 bg-brand-secondary/8 skew-x-12" />

        <div className="relative">
          {/* Overline */}
          <div className="mb-4">
            <span className="brutal-tag border-brand-primary text-brand-primary">
              <Zap className="h-3 w-3" />
              Open Beta
            </span>
          </div>

          {/* Main heading — heavy, brutalist */}
          <h1 className="font-display text-[48px] leading-[52px] font-black uppercase tracking-tight text-text-primary md:text-[72px] md:leading-[78px]">
            Engineering
            <br />
            intelligence,
            <br />
            <span className="text-brand-primary brutal-glow">explained.</span>
          </h1>

          {/* Subtext */}
          <p className="mt-6 max-w-xl font-mono text-body-lg text-text-secondary">
            Skill+ analyzes your GitHub repositories to surface skills,
            architecture patterns, and quality scores — with{" "}
            <span className="text-brand-primary font-bold">evidence</span> for
            every claim.
          </p>

          {/* CTA */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="text-base font-bold uppercase tracking-wider">
                Start Free Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <span className="font-mono text-caption text-text-tertiary">
              No credit card required. Free for open source.
            </span>
          </div>
        </div>
      </section>

      {/* Feature Cards — Brutalist Grid */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        {/* Section header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="h-1 flex-1 bg-brand-primary" />
          <span className="brutal-overline">What we do</span>
          <div className="h-1 flex-1 bg-brand-primary" />
        </div>

        <div className="grid gap-0 md:grid-cols-3">
          {[
            {
              icon: GitBranch,
              title: "Repo Analysis",
              desc: "Deep analysis of your repositories, technologies, and dependencies.",
              accent: "brand-primary",
              number: "01",
            },
            {
              icon: BarChart3,
              title: "Skill Mapping",
              desc: "Visualize your skills with confidence scores backed by evidence.",
              accent: "brand-secondary",
              number: "02",
            },
            {
              icon: Sparkles,
              title: "AI Career Mentor",
              desc: "Get personalized guidance grounded in your actual engineering data.",
              accent: "brand-tertiary",
              number: "03",
            },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className={`relative border-2 border-border-strong bg-bg-surface p-8 transition-all hover:-translate-y-1 hover:shadow-card-hover ${
                i < 2 ? "md:border-r-0" : ""
              }`}
            >
              {/* Number badge */}
              <span className="absolute right-3 top-3 font-mono text-[48px] font-black text-border-subtle leading-none">
                {feature.number}
              </span>

              <feature.icon className={`mb-4 h-8 w-8 text-${feature.accent}`} />
              <h3 className="font-mono text-heading-md font-black uppercase tracking-wide text-text-primary">
                {feature.title}
              </h3>
              <p className="mt-3 font-mono text-body-sm text-text-secondary leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-border-strong px-6 py-6">
        <div className="mx-auto max-w-5xl flex flex-col items-center justify-between gap-4 md:flex-row">
          <span className="font-mono text-caption font-bold uppercase tracking-widest text-text-tertiary">
            Skill+ v1.0 — Engineering Intelligence
          </span>
          <span className="font-mono text-overline text-text-tertiary">
            Built for developers who want to understand their craft.
          </span>
        </div>
      </footer>
    </div>
  );
}
