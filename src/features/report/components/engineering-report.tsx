/**
 * Engineering Report
 * Comprehensive engineering maturity report with strengths, gaps, and recommendations.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ArrowLeft, TrendingUp, AlertTriangle, Download, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/shared/utils/cn";
import { ConfidenceBar } from "@/shared/components/confidence-bar";
import { QualityRing } from "@/shared/components/quality-ring";
import { getConfidenceLevel } from "@/shared/types";
import { fetchEngineeringReport, generateReport, type EngineeringReport } from "@/shared/services/report-service";

export default function EngineeringReportPage() {
  const navigate = useNavigate();
  const [report, setReport] = useState<EngineeringReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchEngineeringReport().then((r) => { setReport(r); setLoading(false); });
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    await generateReport();
    setGenerating(false);
  };

  if (loading || !report) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse bg-bg-raised" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse bg-bg-raised" />
          ))}
        </div>
      </div>
    );
  }

  const maturityLevel = getConfidenceLevel(report.overallMaturity);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => navigate("/dashboard")} className="mb-2 flex items-center gap-1 font-mono text-caption text-text-tertiary hover:text-brand-primary transition-colors">
            <ArrowLeft className="h-3 w-3" /> BACK
          </button>
          <span className="brutal-overline block mb-1">Report</span>
          <h1 className="font-display text-heading-xl font-black uppercase tracking-tight text-text-primary">
            Engineering Report
          </h1>
          <p className="mt-1 font-mono text-body-sm text-text-secondary">
            Generated {new Date(report.generatedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 border-2 border-border-strong bg-bg-surface px-4 py-2 font-mono text-caption font-bold uppercase text-text-secondary hover:border-brand-primary hover:text-brand-primary transition-all disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", generating && "animate-spin")} />
            Regenerate
          </button>
          <button className="flex items-center gap-2 border-2 border-brand-primary bg-brand-primary/10 px-4 py-2 font-mono text-caption font-bold uppercase text-brand-primary hover:bg-brand-primary/20 transition-all">
            <Download className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Maturity Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="border-2 border-brand-primary bg-bg-surface p-6 shadow-brutal-accent"
      >
        <div className="flex items-center gap-8">
          <QualityRing score={report.overallMaturity} size={100} />
          <div>
            <span className="brutal-overline block mb-1">Engineering Maturity</span>
            <div className={cn(
              "font-display text-heading-xl font-black",
              maturityLevel === "high" ? "text-confidence-high" : maturityLevel === "medium" ? "text-confidence-medium" : "text-confidence-low"
            )}>
              {report.overallMaturity}/100
            </div>
            <p className="mt-1 font-mono text-body-sm text-text-secondary">
              {maturityLevel === "high" ? "Strong engineering maturity" : maturityLevel === "medium" ? "Growing engineering maturity" : "Developing engineering maturity"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Strengths & Gaps */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="border-2 border-confidence-high/30 bg-bg-surface p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-confidence-high" />
            <span className="font-display text-body-lg font-bold uppercase tracking-wide text-confidence-high">Strengths</span>
          </div>
          <ul className="space-y-3">
            {report.topStrengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 shrink-0 bg-confidence-high" />
                <span className="font-mono text-body-sm text-text-secondary">{s}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="border-2 border-danger/30 bg-bg-surface p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-danger" />
            <span className="font-display text-body-lg font-bold uppercase tracking-wide text-danger">Gaps</span>
          </div>
          <ul className="space-y-3">
            {report.topGaps.map((g, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 shrink-0 bg-danger" />
                <span className="font-mono text-body-sm text-text-secondary">{g}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Skills Summary */}
      <div className="border-2 border-border-strong bg-bg-surface p-5">
        <span className="brutal-overline block mb-4">Skills Summary</span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {report.skillsSummary.map((skill, i) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="border border-border-subtle bg-bg-surface-alt p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-body-sm font-bold text-text-primary">{skill.name}</span>
                <span className={cn(
                  "font-mono text-caption font-bold",
                  skill.confidence >= 80 ? "text-confidence-high" : skill.confidence >= 60 ? "text-confidence-medium" : "text-confidence-low"
                )}>
                  {skill.confidence}%
                </span>
              </div>
              <ConfidenceBar confidence={skill.confidence} />
              <span className="brutal-tag mt-2 border-text-tertiary text-text-tertiary text-overline">{skill.category}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="border-2 border-border-strong bg-bg-surface p-5">
        <span className="brutal-overline block mb-4">Recommended Actions</span>
        <div className="space-y-3">
          {report.recommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 border border-border-subtle bg-bg-surface-alt p-3"
            >
              <span className={cn(
                "shrink-0 border-2 px-2 py-0.5 font-mono text-overline font-bold uppercase",
                rec.priority === "Critical" ? "border-danger text-danger" :
                rec.priority === "High" ? "border-brand-tertiary text-brand-tertiary" :
                "border-text-tertiary text-text-tertiary"
              )}>
                {rec.priority}
              </span>
              <span className="flex-1 font-mono text-body-sm text-text-primary">{rec.title}</span>
              <span className="font-mono text-caption text-text-tertiary">{rec.effort}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
