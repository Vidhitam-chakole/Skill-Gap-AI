/**
 * Architecture Explorer
 * Interactive visualization of architecture patterns across repositories.
 * Shows pattern cards with confidence scores and an SVG force-directed graph.
 */

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { GitBranch, Layers, Network, ArrowLeft, Filter, Box, Cpu, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/shared/utils/cn";
import { ConfidenceBar } from "@/shared/components/confidence-bar";
import { getConfidenceLevel } from "@/shared/types";
import type { ArchitecturePattern } from "@/shared/types";
import type { ArchitectureGraph, ArchitectureNode } from "@/shared/services/architecture-service";
import { fetchArchitecturePatterns, fetchArchitectureGraph } from "@/shared/services/architecture-service";

type ViewMode = "cards" | "graph";
type FilterType = "all" | "repo" | "pattern" | "technology";

export default function ArchitectureExplorer() {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewMode>("cards");
  const [graphFilter, setGraphFilter] = useState<FilterType>("all");
  const [patterns, setPatterns] = useState<ArchitecturePattern[]>([]);
  const [graph, setGraph] = useState<ArchitectureGraph | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchArchitecturePatterns(), fetchArchitectureGraph()]).then(([p, g]) => {
      setPatterns(p);
      setGraph(g);
      setLoading(false);
    });
  }, []);

  const filteredNodes = useMemo(() => {
    if (!graph) return [];
    if (graphFilter === "all") return graph.nodes;
    return graph.nodes.filter((n) => n.type === graphFilter);
  }, [graph, graphFilter]);

  const filteredLinks = useMemo(() => {
    if (!graph) return [];
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    return graph.links.filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target));
  }, [graph, filteredNodes]);

  const nodeTypeConfig = {
    repo: { color: "#B8FF00", icon: Box, label: "Repositories" },
    pattern: { color: "#00D4FF", icon: Layers, label: "Patterns" },
    technology: { color: "#FF3366", icon: Cpu, label: "Technologies" },
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse bg-bg-raised" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse bg-bg-raised" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => navigate("/dashboard")} className="mb-2 flex items-center gap-1 font-mono text-caption text-text-tertiary hover:text-brand-primary transition-colors">
            <ArrowLeft className="h-3 w-3" /> BACK
          </button>
          <span className="brutal-overline block mb-1">Architecture</span>
          <h1 className="font-display text-heading-xl font-black uppercase tracking-tight text-text-primary">
            Pattern Explorer
          </h1>
          <p className="mt-1 font-mono text-body-sm text-text-secondary">
            {patterns.length} patterns detected across your repositories
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("cards")}
            className={cn(
              "flex items-center gap-2 border-2 px-4 py-2 font-mono text-caption font-bold uppercase transition-all",
              view === "cards"
                ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                : "border-border-strong text-text-secondary hover:border-text-tertiary"
            )}
          >
            <Layers className="h-4 w-4" /> Cards
          </button>
          <button
            onClick={() => setView("graph")}
            className={cn(
              "flex items-center gap-2 border-2 px-4 py-2 font-mono text-caption font-bold uppercase transition-all",
              view === "graph"
                ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                : "border-border-strong text-text-secondary hover:border-text-tertiary"
            )}
          >
            <Network className="h-4 w-4" /> Graph
          </button>
        </div>
      </div>

      {/* Cards View */}
      {view === "cards" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {patterns.map((pattern, i) => {
            const level = getConfidenceLevel(pattern.confidence);
            const levelColor = level === "high" ? "text-confidence-high" : level === "medium" ? "text-confidence-medium" : "text-confidence-low";

            return (
              <motion.div
                key={pattern.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="brutal-card p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-display text-body-lg font-bold uppercase tracking-wide text-text-primary">
                    {pattern.name}
                  </h3>
                  <span className={cn("font-mono text-heading-md font-black", levelColor)}>
                    {pattern.confidence}%
                  </span>
                </div>

                <ConfidenceBar confidence={pattern.confidence} className="mb-3" />

                <p className="mb-3 font-mono text-body-sm text-text-secondary leading-relaxed">
                  {pattern.whyDetected}
                </p>

                {pattern.folderModuleRelationships.length > 0 && (
                  <div className="mb-3">
                    <span className="brutal-overline block mb-1">Relationships</span>
                    <div className="flex flex-wrap gap-1">
                      {pattern.folderModuleRelationships.map((rel) => (
                        <span key={rel} className="brutal-tag border-brand-secondary text-brand-secondary">
                          {rel}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="brutal-overline block mb-1">Detected In</span>
                  <div className="flex flex-wrap gap-1">
                    {pattern.detectedFiles.map((file) => (
                      <span key={file} className="font-mono text-overline text-text-tertiary bg-bg-raised px-2 py-0.5">
                        {file}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Graph View */}
      {view === "graph" && graph && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-text-tertiary" />
            <span className="brutal-overline">Filter</span>
            {(["all", "repo", "pattern", "technology"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setGraphFilter(f)}
                className={cn(
                  "border-2 px-3 py-1 font-mono text-caption font-bold uppercase transition-all",
                  graphFilter === f
                    ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                    : "border-border-strong text-text-secondary hover:border-text-tertiary"
                )}
              >
                {f === "all" ? "All" : nodeTypeConfig[f as keyof typeof nodeTypeConfig].label}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-4">
            {(Object.entries(nodeTypeConfig) as [FilterType, { color: string; icon: React.ComponentType<{ className?: string }>; label: string }][]).map(([type, cfg]) => (
              <div key={type} className="flex items-center gap-2">
                <div className="h-3 w-3" style={{ backgroundColor: cfg.color }} />
                <span className="font-mono text-caption text-text-secondary">{cfg.label}</span>
              </div>
            ))}
          </div>

          {/* SVG Graph */}
          <div className="border-2 border-border-strong bg-bg-surface p-4 overflow-hidden">
            <svg viewBox="0 0 800 500" className="w-full h-[500px]">
              {/* Links */}
              {filteredLinks.map((link, i) => {
                const sourceNode = filteredNodes.find((n) => n.id === link.source);
                const targetNode = filteredNodes.find((n) => n.id === link.target);
                if (!sourceNode || !targetNode) return null;
                const sourceIdx = filteredNodes.indexOf(sourceNode);
                const targetIdx = filteredNodes.indexOf(targetNode);
                const angle1 = (sourceIdx / filteredNodes.length) * Math.PI * 2 - Math.PI / 2;
                const angle2 = (targetIdx / filteredNodes.length) * Math.PI * 2 - Math.PI / 2;
                const cx = 400, cy = 250, r = 180;
                const x1 = cx + Math.cos(angle1) * r;
                const y1 = cy + Math.sin(angle1) * r;
                const x2 = cx + Math.cos(angle2) * r;
                const y2 = cy + Math.sin(angle2) * r;

                return (
                  <line
                    key={i}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#444450"
                    strokeWidth={Math.max(1, link.strength / 30)}
                    strokeOpacity={0.6}
                  />
                );
              })}

              {/* Nodes */}
              {filteredNodes.map((node, i) => {
                const angle = (i / filteredNodes.length) * Math.PI * 2 - Math.PI / 2;
                const cx = 400, cy = 250, r = 180;
                const x = cx + Math.cos(angle) * r;
                const y = cy + Math.sin(angle) * r;
                const cfg = nodeTypeConfig[node.type];
                const size = node.type === "repo" ? 24 : node.type === "pattern" ? 20 : 16;

                return (
                  <g key={node.id}>
                    <circle cx={x} cy={y} r={size} fill={cfg.color} fillOpacity={0.2} stroke={cfg.color} strokeWidth={2} />
                    <circle cx={x} cy={y} r={size - 8} fill={cfg.color} />
                    <text
                      x={x}
                      y={y + size + 14}
                      textAnchor="middle"
                      className="fill-text-secondary"
                      fontSize={10}
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {node.label}
                      {node.confidence ? ` (${node.confidence}%)` : ""}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
