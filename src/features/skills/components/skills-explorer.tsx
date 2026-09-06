/**
 * Skills Explorer — BRUTALIST × NEO-MAXIMALIST
 * Reference: Design Spec Part C, Screen 12
 *
 * Features:
 * - Grid mode: skill chips in responsive grid
 * - Network graph mode: SVG force-directed visualization
 * - Search by name
 * - Filter by category (language, framework, library, etc.)
 * - Sort by name, confidence, repos
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Cpu,
  Grid3X3,
  Network,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
} from "lucide-react";
import {
  fetchSkills,
  fetchSkillCategories,
  type SkillFilters,
  type SkillSortKey,
  type SkillSortDir,
} from "@/shared/services";
import { ConfidenceBar } from "@/shared/components/confidence-bar";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { cn } from "@/shared/utils/cn";
import { getConfidenceColor } from "@/shared/utils/confidence";
import type { SkillCategory, Skill } from "@/shared/types";

type ViewMode = "grid" | "network";

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  language: "Language",
  framework: "Framework",
  library: "Library",
  database: "Database",
  devops: "DevOps",
  testing: "Testing",
};

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  language: "#B8FF00",
  framework: "#00D4FF",
  library: "#FF3366",
  database: "#FF8800",
  devops: "#B98BFF",
  testing: "#4DD4D0",
};

const SORT_OPTIONS: { key: SkillSortKey; label: string }[] = [
  { key: "confidence", label: "Confidence" },
  { key: "name", label: "Name" },
  { key: "repos", label: "Repos" },
  { key: "category", label: "Category" },
];

export default function SkillsExplorer() {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<SkillCategory | "all">("all");
  const [sortBy, setSortBy] = useState<SkillSortKey>("confidence");
  const [sortDir, setSortDir] = useState<SkillSortDir>("desc");
  const [showFilters, setShowFilters] = useState(false);

  const filters: SkillFilters = useMemo(
    () => ({ search, category, sortBy, sortDir }),
    [search, category, sortBy, sortDir],
  );

  const {
    data: skills,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["skills", filters],
    queryFn: () => fetchSkills(filters),
  });

  const { data: categories } = useQuery({
    queryKey: ["skill-categories"],
    queryFn: fetchSkillCategories,
  });

  const toggleSort = (key: SkillSortKey) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  };

  if (error) {
    return (
      <ErrorState
        title="Failed to load skills"
        message="Something went wrong while fetching skills."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="brutal-overline text-text-tertiary">Discover</span>
          <h1 className="mt-1 font-display text-heading-xl font-black uppercase tracking-tight text-text-primary">
            Skills & Technologies
          </h1>
        </div>

        {/* View Mode Toggle */}
        <div className="flex border-2 border-border-strong">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex items-center gap-2 border-r-2 border-border-strong px-4 py-2.5 font-mono text-caption font-bold uppercase tracking-wider transition-all",
              viewMode === "grid"
                ? "bg-brand-primary/10 text-brand-primary"
                : "text-text-tertiary hover:text-text-secondary",
            )}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
            Grid
          </button>
          <button
            onClick={() => setViewMode("network")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 font-mono text-caption font-bold uppercase tracking-wider transition-all",
              viewMode === "network"
                ? "bg-brand-primary/10 text-brand-primary"
                : "text-text-tertiary hover:text-text-secondary",
            )}
          >
            <Network className="h-3.5 w-3.5" />
            Graph
          </button>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col gap-3 border-2 border-border-strong bg-bg-surface p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-2 border-border-strong bg-bg-surface-alt py-2.5 pl-10 pr-4 font-mono text-body-sm text-text-primary placeholder:text-text-tertiary placeholder:italic focus:border-brand-primary focus:shadow-brutal-accent focus:outline-none"
            />
          </div>

          <button
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "flex items-center gap-2 border-2 px-4 py-2.5 font-mono text-caption font-bold uppercase tracking-wider transition-all",
              showFilters
                ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                : "border-border-strong bg-bg-surface-alt text-text-secondary hover:border-brand-primary",
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>

          <div className="flex border-2 border-border-strong">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => toggleSort(opt.key)}
                className={cn(
                  "flex items-center gap-1 border-r border-border-strong px-3 py-2.5 font-mono text-caption font-bold uppercase tracking-wider transition-all last:border-r-0",
                  sortBy === opt.key
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "text-text-tertiary hover:text-text-secondary",
                )}
              >
                {opt.label}
                {sortBy === opt.key &&
                  (sortDir === "desc" ? (
                    <ArrowDown className="h-3 w-3" />
                  ) : (
                    <ArrowUp className="h-3 w-3" />
                  ))}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        {showFilters && categories && (
          <div className="flex items-center gap-3 border-t-2 border-border-subtle pt-3">
            <span className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary">
              Category
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategory("all")}
                className={cn(
                  "border-2 px-3 py-1 font-mono text-caption font-bold uppercase tracking-wider transition-all",
                  category === "all"
                    ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                    : "border-border-strong text-text-tertiary hover:border-brand-primary",
                )}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "border-2 px-3 py-1 font-mono text-caption font-bold uppercase tracking-wider transition-all",
                    category === cat
                      ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                      : "border-border-strong text-text-tertiary hover:border-brand-primary",
                  )}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active filters */}
        {(search || category !== "all") && (
          <div className="flex items-center gap-2 border-t-2 border-border-subtle pt-3">
            <span className="font-mono text-overline font-bold text-text-tertiary">
              Active:
            </span>
            {search && (
              <span className="brutal-tag border-brand-secondary text-brand-secondary">
                "{search}"
              </span>
            )}
            {category !== "all" && (
              <span className="brutal-tag border-brand-tertiary text-brand-tertiary">
                {CATEGORY_LABELS[category]}
              </span>
            )}
            <button
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
              className="ml-2 font-mono text-caption font-bold text-danger hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      <span className="font-mono text-caption font-bold uppercase tracking-widest text-text-tertiary">
        {isLoading ? "Loading..." : `${skills?.length ?? 0} skills`}
      </span>

      {/* ============================================================ */}
      {/* GRID VIEW */}
      {/* ============================================================ */}
      {viewMode === "grid" && (
        <>
          {isLoading ? (
            <GridSkeleton />
          ) : skills && skills.length > 0 ? (
            <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {skills.map((skill, i) => (
                <div
                  key={skill.name}
                  className={cn(
                    "group flex flex-col border-2 border-border-strong bg-bg-surface p-5 transition-all cursor-pointer",
                    "hover:-translate-y-1 hover:shadow-card-hover",
                    i > 0 && "sm:-ml-0.5",
                    "max-sm:border-t-0 max-sm:first:border-t-2",
                  )}
                  onClick={() =>
                    navigate(`/dashboard/skills/${skill.name.toLowerCase()}`)
                  }
                  role="button"
                  tabIndex={0}
                >
                  {/* Category badge */}
                  <span
                    className="mb-3 inline-flex w-fit border-2 px-2 py-0.5 font-mono text-overline font-bold uppercase tracking-wider"
                    style={{
                      color: CATEGORY_COLORS[skill.category],
                      borderColor: CATEGORY_COLORS[skill.category],
                      backgroundColor: `${CATEGORY_COLORS[skill.category]}10`,
                    }}
                  >
                    {skill.category}
                  </span>

                  {/* Skill name */}
                  <h3 className="font-mono text-body-md font-bold text-text-primary group-hover:text-brand-primary transition-colors">
                    {skill.name}
                  </h3>

                  {/* Confidence bar */}
                  <div className="mt-3">
                    <ConfidenceBar
                      score={skill.confidence}
                      evidenceCount={skill.repoCount}
                      height={8}
                    />
                  </div>

                  {/* Repo count */}
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <span className="font-mono text-overline text-text-tertiary">
                      {skill.repoCount} repo{skill.repoCount !== 1 ? "s" : ""}
                    </span>
                    <span
                      className="font-mono text-body-md font-black"
                      style={{ color: getConfidenceColor(skill.confidence >= 80 ? "high" : skill.confidence >= 50 ? "medium" : "low") }}
                    >
                      {skill.confidence}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-border-strong bg-bg-surface p-8">
              <EmptyState
                icon={<Cpu className="h-10 w-10 text-text-tertiary" />}
                title="No matching skills"
                description={
                  search || category !== "all"
                    ? "Try adjusting your search or filters."
                    : "Run an analysis to discover your skills."
                }
              />
            </div>
          )}
        </>
      )}

      {/* ============================================================ */}
      {/* NETWORK GRAPH VIEW */}
      {/* ============================================================ */}
      {viewMode === "network" && (
        <>
          {isLoading ? (
            <div className="h-96 border-2 border-border-strong bg-bg-surface animate-pulse" />
          ) : skills && skills.length > 0 ? (
            <NetworkGraph skills={skills} onSkillClick={(name) => navigate(`/dashboard/skills/${name.toLowerCase()}`)} />
          ) : (
            <div className="border-2 border-border-strong bg-bg-surface p-8">
              <EmptyState
                title="No skills to visualize"
                description="Run an analysis to see your skill network."
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================
// Network Graph (SVG force-directed approximation)
// ============================================================

function NetworkGraph({
  skills,
  onSkillClick,
}: {
  skills: Skill[];
  onSkillClick: (name: string) => void;
}) {
  // Simple circular layout with some jitter for organic feel
  const width = 800;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;

  const nodes = useMemo(() => {
    const sorted = [...skills].sort((a, b) => b.confidence - a.confidence);
    return sorted.map((skill, i) => {
      const angle = (i / sorted.length) * 2 * Math.PI - Math.PI / 2;
      const radius = 120 + (100 - skill.confidence) * 1.5;
      const jitterX = (Math.sin(i * 7.3) * 20);
      const jitterY = (Math.cos(i * 5.1) * 15);
      return {
        ...skill,
        x: centerX + Math.cos(angle) * radius + jitterX,
        y: centerY + Math.sin(angle) * radius + jitterY,
        radius: 20 + (skill.repoCount * 2),
        color: CATEGORY_COLORS[skill.category],
      };
    });
  }, [skills, centerX, centerY]);

  // Connect skills that share repos (simplified: connect nearby confidence levels)
  const edges = useMemo(() => {
    const result: { from: number; to: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (dist < 180 && nodes[i].category === nodes[j].category) {
          result.push({ from: i, to: j });
        }
      }
    }
    return result;
  }, [nodes]);

  return (
    <div className="border-2 border-border-strong bg-bg-surface overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ minHeight: 400 }}
      >
        {/* Edges */}
        {edges.map((edge, i) => (
          <line
            key={i}
            x1={nodes[edge.from].x}
            y1={nodes[edge.from].y}
            x2={nodes[edge.to].x}
            y2={nodes[edge.to].y}
            stroke="#2A2A32"
            strokeWidth={1.5}
          />
        ))}

        {/* Nodes */}
        {nodes.map((node) => (
          <g
            key={node.name}
            className="cursor-pointer"
            onClick={() => onSkillClick(node.name)}
          >
            {/* Outer ring */}
            <circle
              cx={node.x}
              cy={node.y}
              r={node.radius + 4}
              fill="none"
              stroke={node.color}
              strokeWidth={2}
              opacity={0.3}
            />
            {/* Node circle */}
            <circle
              cx={node.x}
              cy={node.y}
              r={node.radius}
              fill={`${node.color}15`}
              stroke={node.color}
              strokeWidth={2}
            />
            {/* Name */}
            <text
              x={node.x}
              y={node.y - 4}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize={10}
              fontFamily="JetBrains Mono, monospace"
              fontWeight={700}
            >
              {node.name}
            </text>
            {/* Confidence */}
            <text
              x={node.x}
              y={node.y + 10}
              textAnchor="middle"
              fill="#A0A0AA"
              fontSize={9}
              fontFamily="JetBrains Mono, monospace"
            >
              {node.confidence}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ============================================================
// Skeleton
// ============================================================

function GridSkeleton() {
  return (
    <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "border-2 border-border-strong bg-bg-surface p-5",
            i > 0 && "sm:-ml-0.5",
            "max-sm:border-t-0 max-sm:first:border-t-2",
          )}
        >
          <div className="mb-3 h-4 w-16 border border-border-subtle bg-bg-surface-alt" />
          <div className="mb-3 h-5 w-24 bg-bg-surface-alt" />
          <div className="h-2 w-full bg-bg-surface-alt" />
          <div className="mt-3 h-3 w-12 bg-bg-surface-alt" />
        </div>
      ))}
    </div>
  );
}
