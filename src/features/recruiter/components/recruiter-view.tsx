/**
 * Recruiter View
 * Public shareable page for recruiters to view a developer's engineering profile.
 * Token-gated via /share/:shareToken route.
 */

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ExternalLink, Shield, Star, Code, TrendingUp, MapPin, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/shared/utils/cn";
import { QualityRing } from "@/shared/components/quality-ring";
import { ConfidenceBar } from "@/shared/components/confidence-bar";
import { SkillChip } from "@/shared/components/skill-chip";
import { getConfidenceLevel } from "@/shared/types";
import { fetchDashboardOverview, type DashboardOverview } from "@/shared/services/dashboard-service";
import { fetchEngineeringReport, type EngineeringReport } from "@/shared/services/report-service";

export default function RecruiterView() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [report, setReport] = useState<EngineeringReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([fetchDashboardOverview(), fetchEngineeringReport()])
      .then(([o, r]) => { setOverview(o); setReport(r); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
          <span className="font-mono text-body-sm text-text-secondary">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error || !overview || !report) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-heading-lg font-black uppercase text-text-primary mb-2">Profile Not Found</h1>
          <p className="font-mono text-body-sm text-text-secondary">This share link may have expired or been revoked.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <div className="border-b-2 border-border-strong bg-bg-surface">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center border-2 border-brand-primary bg-brand-primary/10 text-brand-primary">
              <span className="font-display text-heading-lg font-black">S+</span>
            </div>
            <div>
              <span className="brutal-overline block mb-1">Engineering Profile</span>
              <h1 className="font-display text-heading-xl font-black uppercase tracking-tight text-text-primary">
                {report.developerName}
              </h1>
              <p className="mt-1 font-mono text-body-sm text-text-secondary">
                Skill+ Verified Engineering Intelligence
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        {/* Maturity Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="border-2 border-brand-primary bg-bg-surface p-6 shadow-brutal-accent"
        >
          <div className="flex items-center gap-8">
            <QualityRing score={report.overallMaturity} size={100} />
            <div>
              <span className="brutal-overline block mb-1">Engineering Maturity</span>
              <span className="font-display text-heading-xl font-black text-brand-primary">
                {report.overallMaturity}/100
              </span>
              <p className="mt-1 font-mono text-body-sm text-text-secondary">
                Based on analysis of {overview.reposAnalyzed} repositories and {overview.technologiesDetected} technologies
              </p>
            </div>
          </div>
        </motion.div>

        {/* Top Skills */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="border-2 border-border-strong bg-bg-surface p-5">
          <span className="brutal-overline block mb-4">Top Skills</span>
          <div className="flex flex-wrap gap-2">
            {overview.topSkills.map((skill) => (
              <SkillChip key={skill.name} name={skill.name} confidence={skill.confidence} category={skill.category} />
            ))}
          </div>
        </motion.div>

        {/* Repo Quality */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="border-2 border-border-strong bg-bg-surface p-5">
          <span className="brutal-overline block mb-4">Repository Quality</span>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {overview.recentRepos.map((repo) => (
              <div key={repo.name} className="border border-border-subtle bg-bg-surface-alt p-3">
                <div className="flex items-center gap-3 mb-2">
                  <QualityRing score={repo.qualityScore} size={32} />
                  <span className="font-mono text-body-sm font-bold text-text-primary">{repo.name}</span>
                </div>
                <ConfidenceBar confidence={repo.qualityScore} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Strengths */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="border-2 border-confidence-high/30 bg-bg-surface p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-confidence-high" />
            <span className="font-display text-body-lg font-bold uppercase tracking-wide text-confidence-high">Key Strengths</span>
          </div>
          <ul className="space-y-2">
            {report.topStrengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-confidence-high" />
                <span className="font-mono text-body-sm text-text-secondary">{s}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Footer */}
        <div className="border-t-2 border-border-strong pt-4 text-center">
          <p className="font-mono text-caption text-text-tertiary">
            Verified by Skill+ · Engineering Intelligence · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
