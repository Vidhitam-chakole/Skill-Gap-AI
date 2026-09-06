/**
 * Repository Quality Overview
 * Quality score rankings with sub-score breakdown and comparison.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, TrendingUp, TrendingDown, Minus, FileText, TestTube, GitBranch, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/shared/utils/cn";
import { ConfidenceBar } from "@/shared/components/confidence-bar";
import { QualityRing } from "@/shared/components/quality-ring";
import { getConfidenceLevel } from "@/shared/types";
import { fetchQualityOverview, type QualityOverview } from "@/shared/services/quality-service";

type SortKey = "score" | "name" | "docs" | "testing" | "cicd" | "structure";

export default function RepositoryQuality() {
  const navigate = useNavigate();
  const [data, setData] = useState<QualityOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>("score");

  useEffect(() => {
    fetchQualityOverview().then((d) => { setData(d); setLoading(false); });
  }, []);

  const sortedRepos = data
    ? [...data.repos].sort((a, b) => {
        switch (sortBy) {
          case "score": return b.overallScore - a.overallScore;
          case "name": return a.repoName.localeCompare(b.repoName);
          case "docs": return b.subScores.documentation - a.subScores.documentation;
          case "testing": return b.subScores.testing - a.subScores.testing;
          case "cicd": return b.subScores.cicd - a.subScores.cicd;
          case "structure": return b.subScores.structure - a.subScores.structure;
          default: return 0;
        }
      })
    : [];

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse bg-bg-raised" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse bg-bg-raised" />
          ))}
        </div>
      </div>
    );
  }

  const subIcons = { documentation: FileText, testing: TestTube, cicd: GitBranch, structure: LayoutGrid };
  const subLabels = { documentation: "Docs", testing: "Tests", cicd: "CI/CD", structure: "Structure" };

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate("/dashboard")} className="mb-2 flex items-center gap-1 font-mono text-caption text-text-tertiary hover:text-brand-primary transition-colors">
          <ArrowLeft className="h-3 w-3" /> BACK
        </button>
        <span className="brutal-overline block mb-1">Quality</span>
        <h1 className="font-display text-heading-xl font-black uppercase tracking-tight text-text-primary">
          Repository Quality
        </h1>
        <p className="mt-1 font-mono text-body-sm text-text-secondary">
          {data.repos.length} repositories · Average score: {data.averageScore}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(["documentation", "testing", "cicd", "structure"] as const).map((key) => {
          const Icon = subIcons[key];
          const avg = data.subScoreAverages[key];
          const level = getConfidenceLevel(avg);
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 border-border-strong bg-bg-surface p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-text-tertiary" />
                <span className="brutal-overline">{subLabels[key]}</span>
              </div>
              <div className={cn(
                "font-display text-heading-lg font-black",
                level === "high" ? "text-confidence-high" : level === "medium" ? "text-confidence-medium" : "text-confidence-low"
              )}>
                {avg}
              </div>
              <ConfidenceBar confidence={avg} className="mt-2" />
            </motion.div>
          );
        })}
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2">
        <span className="brutal-overline">Sort</span>
        {(["score", "name", "docs", "testing", "cicd", "structure"] as SortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={cn(
              "border-2 px-3 py-1 font-mono text-caption font-bold uppercase transition-all",
              sortBy === key
                ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                : "border-border-strong text-text-secondary hover:border-text-tertiary"
            )}
          >
            {key === "score" ? "Overall" : subLabels[key as keyof typeof subLabels] ?? key}
          </button>
        ))}
      </div>

      {/* Repo Table */}
      <div className="border-2 border-border-strong bg-bg-surface overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-border-strong">
              <th className="px-4 py-3 text-left font-mono text-caption font-bold uppercase text-text-tertiary">Repository</th>
              <th className="px-4 py-3 text-center font-mono text-caption font-bold uppercase text-text-tertiary">Score</th>
              <th className="px-4 py-3 text-center font-mono text-caption font-bold uppercase text-text-tertiary">Docs</th>
              <th className="px-4 py-3 text-center font-mono text-caption font-bold uppercase text-text-tertiary">Tests</th>
              <th className="px-4 py-3 text-center font-mono text-caption font-bold uppercase text-text-tertiary">CI/CD</th>
              <th className="px-4 py-3 text-center font-mono text-caption font-bold uppercase text-text-tertiary">Structure</th>
            </tr>
          </thead>
          <tbody>
            {sortedRepos.map((repo, i) => (
              <motion.tr
                key={repo.repoName}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-border-subtle hover:bg-bg-surface-alt transition-colors cursor-pointer"
                onClick={() => navigate(`/dashboard/repositories/${repo.repoName}`)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <QualityRing score={repo.overallScore} size={36} />
                    <span className="font-mono text-body-sm font-bold text-text-primary">{repo.repoName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={cn(
                    "font-mono text-body-md font-black",
                    repo.overallScore >= 80 ? "text-confidence-high" : repo.overallScore >= 60 ? "text-confidence-medium" : "text-confidence-low"
                  )}>
                    {repo.overallScore}
                  </span>
                </td>
                {(["documentation", "testing", "cicd", "structure"] as const).map((key) => (
                  <td key={key} className="px-4 py-3 text-center">
                    <span className={cn(
                      "font-mono text-body-sm font-bold",
                      repo.subScores[key] >= 80 ? "text-confidence-high" : repo.subScores[key] >= 60 ? "text-confidence-medium" : "text-confidence-low"
                    )}>
                      {repo.subScores[key]}
                    </span>
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
