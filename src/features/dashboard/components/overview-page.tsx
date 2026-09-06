/**
 * Dashboard Overview — BRUTALIST × NEO-MAXIMALIST
 * Reference: Design Spec Part C, Screen 9
 *
 * 4 Recharts visualizations:
 * 1. Engineering Radar — spider chart for skill breadth across categories
 * 2. Quality Distribution — bar chart of repo quality score ranges
 * 3. Skill Confidence Timeline — area chart tracking confidence over time
 * 4. Language Breakdown — pie chart of language usage percentages
 *
 * Plus: KPI cards, top skills, recent repos, recommendations CTA
 */

import { useQuery } from "@tanstack/react-query";
import {
  GitBranch,
  Cpu,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { fetchDashboardOverview } from "@/shared/services";
import { useAuthStore } from "@/shared/store";
import { MiniQualityRing } from "@/shared/components/quality-ring";
import { SkillChip } from "@/shared/components/skill-chip";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { Button } from "@/components/ui/button";
import { formatNumber, formatRelativeDate } from "@/shared/utils/format";
import { cn } from "@/shared/utils/cn";

// ============================================================
// Chart color tokens (brutalist palette)
// ============================================================

const CHART_COLORS = {
  primary: "#B8FF00",
  secondary: "#00D4FF",
  tertiary: "#FF3366",
  quaternary: "#FF8800",
  quinary: "#B98BFF",
  gridLine: "#2A2A32",
  axisText: "#606068",
  bg: "#111114",
};

// Custom tooltip style for brutalist look
function BrutalTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border-2 border-border-strong bg-bg-surface p-3 shadow-brutal">
      <p className="mb-1 font-mono text-caption font-bold uppercase tracking-wider text-text-primary">
        {label}
      </p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="font-mono text-caption" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function OverviewPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const {
    data: overview,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: fetchDashboardOverview,
  });

  if (error) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        message="Something went wrong while fetching your dashboard data."
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading || !overview) return <OverviewSkeleton />;

  // Prepare radar data from skill categories
  const radarData = overview.skillCategories.map((sc) => ({
    subject: sc.category.charAt(0).toUpperCase() + sc.category.slice(1),
    value: sc.avgConfidence,
    fullMark: 100,
  }));

  const kpis = [
    { label: "Repos Analyzed", value: overview.reposAnalyzed, icon: GitBranch, accent: "text-brand-primary" },
    { label: "Technologies", value: overview.technologiesDetected, icon: Cpu, accent: "text-brand-secondary" },
    { label: "Confidence", value: `${overallConfidence(overview)}%`, icon: BarChart3, accent: "text-success" },
    { label: "Quality Avg", value: `${overview.repoQualityAvg}`, icon: ShieldCheck, accent: "text-warning" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Developer Identity Card */}
      <div className="flex items-center gap-5 border-2 border-border-strong bg-bg-surface p-6 shadow-card">
        <div className="h-16 w-16 shrink-0 overflow-hidden border-2 border-border-strong bg-bg-surface-alt">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-mono text-heading-lg font-black text-text-secondary">
              {user?.name?.[0] ?? "?"}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="font-display text-heading-lg font-black uppercase tracking-tight text-text-primary">
            {user?.name ?? "Developer"}
          </h2>
          <p className="font-mono text-body-sm text-text-secondary">
            @{user?.username ?? "username"}
          </p>
          {user?.bio && (
            <p className="mt-1 font-mono text-body-sm text-text-tertiary">{user.bio}</p>
          )}
        </div>
        {user?.topLanguages && user.topLanguages.length > 0 && (
          <div className="hidden gap-2 md:flex">
            {user.topLanguages.slice(0, 3).map((lang) => (
              <span
                key={lang}
                className="border-2 border-brand-primary bg-brand-primary/10 px-3 py-1 font-mono text-overline font-bold uppercase tracking-wider text-brand-primary"
              >
                {lang}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* KPI Cards — Brutalist Grid */}
      <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={cn(
              "flex items-center gap-4 border-2 border-border-strong bg-bg-surface p-5 transition-all hover:shadow-card-hover hover:-translate-y-0.5",
              i === 0 && "md:rounded-none",
              i === 1 && "sm:border-l-0 md:border-l-0",
              i === 2 && "sm:border-t-0 md:border-l-0",
              i === 3 && "sm:border-t-0 sm:border-l-0 md:border-l-0",
            )}
          >
            <div className={cn("p-2.5 border-2 border-border-subtle bg-bg-surface-alt", kpi.accent)}>
              <kpi.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary">
                {kpi.label}
              </p>
              <p className="font-display text-heading-lg font-black text-text-primary">
                {typeof kpi.value === "number" ? formatNumber(kpi.value) : kpi.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/* CHART ROW 1: Radar + Quality Distribution */}
      {/* ============================================================ */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Engineering Radar */}
        <div className="border-2 border-border-strong bg-bg-surface">
          <div className="flex items-center gap-3 border-b-2 border-border-strong px-5 py-4">
            <span className="brutal-tag border-brand-primary text-brand-primary">Radar</span>
            <h3 className="font-mono text-heading-md font-black uppercase tracking-wide text-text-primary">
              Skill Breadth
            </h3>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke={CHART_COLORS.gridLine} />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: CHART_COLORS.axisText, fontSize: 11, fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: CHART_COLORS.axisText, fontSize: 9, fontFamily: "JetBrains Mono, monospace" }}
                  axisLine={false}
                />
                <Radar
                  name="Confidence"
                  dataKey="value"
                  stroke={CHART_COLORS.primary}
                  fill={CHART_COLORS.primary}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quality Distribution */}
        <div className="border-2 border-border-strong bg-bg-surface">
          <div className="flex items-center gap-3 border-b-2 border-border-strong px-5 py-4">
            <span className="brutal-tag border-brand-secondary text-brand-secondary">Dist</span>
            <h3 className="font-mono text-heading-md font-black uppercase tracking-wide text-text-primary">
              Quality Distribution
            </h3>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={overview.qualityDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} />
                <XAxis
                  dataKey="range"
                  tick={{ fill: CHART_COLORS.axisText, fontSize: 10, fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}
                  axisLine={{ stroke: CHART_COLORS.gridLine }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: CHART_COLORS.axisText, fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<BrutalTooltip />} />
                <Bar
                  dataKey="count"
                  name="Repos"
                  fill={CHART_COLORS.secondary}
                  radius={[0, 0, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CHART ROW 2: Timeline + Language Pie */}
      {/* ============================================================ */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Confidence Timeline */}
        <div className="border-2 border-border-strong bg-bg-surface">
          <div className="flex items-center gap-3 border-b-2 border-border-strong px-5 py-4">
            <span className="brutal-tag border-brand-tertiary text-brand-tertiary">Trend</span>
            <h3 className="font-mono text-heading-md font-black uppercase tracking-wide text-text-primary">
              Confidence Over Time
            </h3>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={overview.confidenceTimeline}>
                <defs>
                  <linearGradient id="gradOverall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradLang" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.secondary} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={CHART_COLORS.secondary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: CHART_COLORS.axisText, fontSize: 10, fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}
                  axisLine={{ stroke: CHART_COLORS.gridLine }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: CHART_COLORS.axisText, fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<BrutalTooltip />} />
                <Area
                  type="monotone"
                  dataKey="overall"
                  name="Overall"
                  stroke={CHART_COLORS.primary}
                  fill="url(#gradOverall)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="languages"
                  name="Languages"
                  stroke={CHART_COLORS.secondary}
                  fill="url(#gradLang)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="frameworks"
                  name="Frameworks"
                  stroke={CHART_COLORS.tertiary}
                  fill="transparent"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                />
                <Area
                  type="monotone"
                  dataKey="devops"
                  name="DevOps"
                  stroke={CHART_COLORS.quaternary}
                  fill="transparent"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Language Breakdown Pie */}
        <div className="border-2 border-border-strong bg-bg-surface">
          <div className="flex items-center gap-3 border-b-2 border-border-strong px-5 py-4">
            <span className="brutal-tag border-brand-quaternary text-brand-quaternary">Mix</span>
            <h3 className="font-mono text-heading-md font-black uppercase tracking-wide text-text-primary">
              Language Breakdown
            </h3>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={overview.languageBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  strokeWidth={0}
                >
                  {overview.languageBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<BrutalTooltip />} />
                <Legend
                  iconType="square"
                  iconSize={10}
                  wrapperStyle={{
                    fontSize: 11,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                  formatter={(value) => (
                    <span style={{ color: "#A0A0AA" }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TOP SKILLS */}
      {/* ============================================================ */}
      {overview.topSkills.length > 0 && (
        <div className="border-2 border-border-strong bg-bg-surface shadow-card">
          <div className="flex items-center justify-between border-b-2 border-border-strong px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="brutal-tag border-brand-primary text-brand-primary">TOP</span>
              <h3 className="font-mono text-heading-md font-black uppercase tracking-wide text-text-primary">
                Top Skills
              </h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/skills")} className="font-mono text-caption font-bold uppercase">
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-3 p-5">
            {overview.topSkills.map((skill) => (
              <SkillChip
                key={skill.name}
                name={skill.name}
                confidence={skill.confidence}
                onClick={() => navigate(`/dashboard/skills/${skill.name}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* RECENT REPOSITORIES */}
      {/* ============================================================ */}
      <div className="border-2 border-border-strong bg-bg-surface shadow-card">
        <div className="flex items-center justify-between border-b-2 border-border-strong px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="brutal-tag border-brand-secondary text-brand-secondary">REC</span>
            <h3 className="font-mono text-heading-md font-black uppercase tracking-wide text-text-primary">
              Recent Repos
            </h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/repositories")} className="font-mono text-caption font-bold uppercase">
            View All <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
        <div className="p-5">
          {overview.recentRepos.length === 0 ? (
            <EmptyState
              title="No repositories yet"
              description="Connect your GitHub to see your repositories here."
              className="border-0 py-8"
            />
          ) : (
            <div className="flex flex-col gap-0">
              {overview.recentRepos.map((repo, i) => (
                <div
                  key={repo.name}
                  className={cn(
                    "flex items-center gap-4 border-2 border-border-strong bg-bg-surface p-4 transition-all hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer",
                    i > 0 && "-mt-2",
                  )}
                  onClick={() => navigate(`/dashboard/repositories/${repo.name}`)}
                  role="button"
                  tabIndex={0}
                >
                  <MiniQualityRing score={repo.qualityScore} />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-body-md font-bold text-text-primary truncate">
                      {repo.name}
                    </p>
                    <p className="font-mono text-body-sm text-text-secondary truncate">
                      {repo.description}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-overline font-bold text-text-tertiary">
                    {formatRelativeDate(repo.lastUpdated)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* RECOMMENDATIONS CTA */}
      {/* ============================================================ */}
      {overview.recommendations.length > 0 && (
        <div className="border-2 border-brand-primary bg-brand-primary/6 p-6 shadow-brutal-accent">
          <div className="flex items-center gap-4">
            <div className="border-2 border-brand-primary bg-brand-primary/16 p-3">
              <TrendingUp className="h-5 w-5 text-brand-primary" />
            </div>
            <div className="flex-1">
              <p className="font-mono text-body-md font-bold text-text-primary uppercase">
                {overview.recommendations.length} skill gap
                {overview.recommendations.length !== 1 ? "s" : ""} identified
              </p>
              <p className="font-mono text-body-sm text-text-secondary">
                Get personalized recommendations to level up.
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate("/dashboard/recommendations")} className="font-bold uppercase tracking-wider">
              View <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

function overallConfidence(overview: any): number {
  return overview.overallConfidence;
}

// ============================================================
// Skeleton Loader
// ============================================================

function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="h-28 border-2 border-border-strong bg-bg-surface-alt" />
      <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 border-2 border-border-strong bg-bg-surface-alt" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-80 border-2 border-border-strong bg-bg-surface-alt" />
        <div className="h-80 border-2 border-border-strong bg-bg-surface-alt" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-72 border-2 border-border-strong bg-bg-surface-alt" />
        <div className="h-72 border-2 border-border-strong bg-bg-surface-alt" />
      </div>
      <div className="h-48 border-2 border-border-strong bg-bg-surface-alt" />
      <div className="h-56 border-2 border-border-strong bg-bg-surface-alt" />
    </div>
  );
}
