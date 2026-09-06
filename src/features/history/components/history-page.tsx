/**
 * History Page
 * Analysis run history with timeline view and run comparison.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ArrowLeft, CheckCircle, XCircle, Loader, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/shared/utils/cn";
import { QualityRing } from "@/shared/components/quality-ring";
import { ConfidenceBar } from "@/shared/components/confidence-bar";
import { fetchAnalysisRuns } from "@/shared/services/history-service";
import type { AnalysisRun } from "@/shared/types";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState<AnalysisRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalysisRuns().then((r) => { setRuns(r); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse bg-bg-raised" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse bg-bg-raised" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate("/dashboard")} className="mb-2 flex items-center gap-1 font-mono text-caption text-text-tertiary hover:text-brand-primary transition-colors">
          <ArrowLeft className="h-3 w-3" /> BACK
        </button>
        <span className="brutal-overline block mb-1">History</span>
        <h1 className="font-display text-heading-xl font-black uppercase tracking-tight text-text-primary">
          Analysis History
        </h1>
        <p className="mt-1 font-mono text-body-sm text-text-secondary">
          {runs.length} analysis runs on record
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Runs", value: runs.length },
          { label: "Latest Confidence", value: runs[0]?.confidence ?? 0 },
          { label: "Improvement", value: runs.length > 1 ? `+${runs[0].confidence - runs[runs.length - 1].confidence}%` : "N/A" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border-2 border-border-strong bg-bg-surface p-4"
          >
            <span className="brutal-overline block mb-1">{kpi.label}</span>
            <span className="font-display text-heading-lg font-black text-text-primary">{kpi.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Timeline */}
      <div className="border-2 border-border-strong bg-bg-surface p-5">
        <span className="brutal-overline block mb-4">Run Timeline</span>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.2 bg-border-strong" />

          <div className="space-y-4">
            {runs.map((run, i) => {
              const prev = runs[i + 1];
              const confidenceDelta = prev ? run.confidence - prev.confidence : 0;
              const isSelected = selectedRun === run.id;

              return (
                <motion.div
                  key={run.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "relative ml-10 border-2 p-4 transition-all cursor-pointer",
                    isSelected
                      ? "border-brand-primary bg-brand-primary/5 shadow-brutal-accent"
                      : "border-border-strong bg-bg-surface hover:border-text-tertiary"
                  )}
                  onClick={() => setSelectedRun(isSelected ? null : run.id)}
                >
                  {/* Timeline dot */}
                  <div className={cn(
                    "absolute -left-[2.75rem] top-4 h-4 w-4 border-2",
                    run.status === "complete" ? "border-confidence-high bg-confidence-high" :
                    run.status === "failed" ? "border-danger bg-danger" :
                    "border-confidence-medium bg-confidence-medium"
                  )} />

                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {run.status === "complete" ? (
                          <CheckCircle className="h-4 w-4 text-confidence-high" />
                        ) : run.status === "failed" ? (
                          <XCircle className="h-4 w-4 text-danger" />
                        ) : (
                          <Loader className="h-4 w-4 text-confidence-medium animate-spin" />
                        )}
                        <span className="font-mono text-body-sm font-bold text-text-primary">
                          Run #{runs.length - i}
                        </span>
                        <span className={cn(
                          "brutal-tag",
                          run.status === "complete" ? "border-confidence-high text-confidence-high" :
                          run.status === "failed" ? "border-danger text-danger" :
                          "border-confidence-medium text-confidence-medium"
                        )}>
                          {run.status}
                        </span>
                      </div>
                      <p className="font-mono text-caption text-text-tertiary">
                        {formatDate(run.date)} at {formatTime(run.date)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="brutal-overline block">Confidence</span>
                        <span className={cn(
                          "font-mono text-body-md font-black",
                          run.confidence >= 70 ? "text-confidence-high" : run.confidence >= 50 ? "text-confidence-medium" : "text-confidence-low"
                        )}>
                          {run.confidence}%
                        </span>
                      </div>
                      {confidenceDelta !== 0 && (
                        <div className={cn(
                          "flex items-center gap-1",
                          confidenceDelta > 0 ? "text-confidence-high" : "text-confidence-low"
                        )}>
                          {confidenceDelta > 0 ? <TrendingUp className="h-4 w-4" /> : confidenceDelta < 0 ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                          <span className="font-mono text-caption font-bold">
                            {confidenceDelta > 0 ? "+" : ""}{confidenceDelta}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 grid grid-cols-2 gap-4 border-t-2 border-border-strong pt-4"
                    >
                      <div>
                        <span className="brutal-overline block mb-1">Repos Analyzed</span>
                        <span className="font-mono text-body-md font-bold text-text-primary">{run.repoCount}</span>
                      </div>
                      <div>
                        <span className="brutal-overline block mb-1">Avg Quality</span>
                        <span className="font-mono text-body-md font-bold text-text-primary">{run.qualityAvg}/100</span>
                      </div>
                      <div className="col-span-2">
                        <span className="brutal-overline block mb-1">Confidence</span>
                        <ConfidenceBar confidence={run.confidence} />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
