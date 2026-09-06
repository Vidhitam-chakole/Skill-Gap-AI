/**
 * Export Page
 * Export engineering report in multiple formats and generate share links.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, ArrowLeft, FileText, Code, FileJson, Link, Copy, Check, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/shared/utils/cn";
import { generateExport, generateShareLink } from "@/shared/services/export-service";
import type { ExportFormat, SharedReport } from "@/shared/types";

const formats: { key: ExportFormat; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { key: "pdf", label: "PDF Report", icon: FileText, description: "Full visual report with charts and formatting" },
  { key: "markdown", label: "Markdown", icon: Code, description: "Structured text for documentation and wikis" },
  { key: "json", label: "JSON Data", icon: FileJson, description: "Raw data for programmatic consumption" },
];

export default function ExportPage() {
  const navigate = useNavigate();
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [downloadResult, setDownloadResult] = useState<{ format: ExportFormat; url: string; size: string } | null>(null);
  const [shareLink, setShareLink] = useState<SharedReport | null>(null);
  const [generatingShare, setGeneratingShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setExporting(format);
    setDownloadResult(null);
    const result = await generateExport(format);
    setDownloadResult({ format, url: result.downloadUrl, size: result.fileSize });
    setExporting(null);
  };

  const handleShareLink = async () => {
    setGeneratingShare(true);
    const link = await generateShareLink();
    setShareLink(link);
    setGeneratingShare(false);
  };

  const handleCopy = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate("/dashboard")} className="mb-2 flex items-center gap-1 font-mono text-caption text-text-tertiary hover:text-brand-primary transition-colors">
          <ArrowLeft className="h-3 w-3" /> BACK
        </button>
        <span className="brutal-overline block mb-1">Export</span>
        <h1 className="font-display text-heading-xl font-black uppercase tracking-tight text-text-primary">
          Export & Share
        </h1>
        <p className="mt-1 font-mono text-body-sm text-text-secondary">
          Download your engineering report or generate a shareable link
        </p>
      </div>

      {/* Format Selection */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {formats.map((fmt, i) => {
          const Icon = fmt.icon;
          const isExporting = exporting === fmt.key;
          const result = downloadResult?.format === fmt.key;

          return (
            <motion.div
              key={fmt.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "border-2 bg-bg-surface p-5 transition-all",
                result ? "border-confidence-high" : "border-border-strong hover:border-brand-primary"
              )}
            >
              <Icon className="mb-3 h-8 w-8 text-brand-primary" />
              <h3 className="font-display text-body-lg font-bold uppercase tracking-wide text-text-primary mb-1">
                {fmt.label}
              </h3>
              <p className="mb-4 font-mono text-caption text-text-secondary">{fmt.description}</p>

              {result ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-confidence-high">
                    <Check className="h-4 w-4" />
                    <span className="font-mono text-caption font-bold">Ready ({downloadResult?.size})</span>
                  </div>
                  <a
                    href={downloadResult!.url}
                    className="flex w-full items-center justify-center gap-2 border-2 border-confidence-high bg-confidence-high/10 px-4 py-2 font-mono text-caption font-bold uppercase text-confidence-high hover:bg-confidence-high/20 transition-all"
                  >
                    <Download className="h-4 w-4" /> Download
                  </a>
                </div>
              ) : (
                <button
                  onClick={() => handleExport(fmt.key)}
                  disabled={isExporting}
                  className="flex w-full items-center justify-center gap-2 border-2 border-border-strong bg-bg-surface-alt px-4 py-2 font-mono text-caption font-bold uppercase text-text-secondary hover:border-brand-primary hover:text-brand-primary transition-all disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" /> Export
                    </>
                  )}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Share Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="border-2 border-border-strong bg-bg-surface p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Link className="h-5 w-5 text-brand-secondary" />
          <span className="font-display text-body-lg font-bold uppercase tracking-wide text-text-primary">
            Shareable Link
          </span>
        </div>
        <p className="mb-4 font-mono text-body-sm text-text-secondary">
          Generate a public link to share your engineering profile with recruiters or collaborators.
        </p>

        {shareLink ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-2 border-confidence-high bg-confidence-high/5 p-3">
              <ExternalLink className="h-4 w-4 shrink-0 text-confidence-high" />
              <span className="flex-1 font-mono text-body-sm text-text-primary truncate">{shareLink.url}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 border-2 border-border-strong px-3 py-1 font-mono text-caption font-bold uppercase text-text-secondary hover:border-brand-primary hover:text-brand-primary transition-all"
              >
                {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
              </button>
            </div>
            <p className="font-mono text-caption text-text-tertiary">
              Expires {new Date(shareLink.expiresAt).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <button
            onClick={handleShareLink}
            disabled={generatingShare}
            className="flex items-center gap-2 border-2 border-brand-secondary bg-brand-secondary/10 px-4 py-2 font-mono text-caption font-bold uppercase text-brand-secondary hover:bg-brand-secondary/20 transition-all disabled:opacity-50"
          >
            {generatingShare ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-secondary border-t-transparent" />
                Generating...
              </>
            ) : (
              <>
                <Link className="h-4 w-4" /> Generate Share Link
              </>
            )}
          </button>
        )}
      </motion.div>
    </div>
  );
}
