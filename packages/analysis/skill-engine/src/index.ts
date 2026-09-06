/**
 * @skillplus/skill-engine
 *
 * Standalone skill detection and depth scoring engine.
 * Consumes normalized evidence from any source (GitHub, LinkedIn, career profile).
 *
 * Responsibilities:
 * 1. Skill detection from evidence
 * 2. Skill depth scoring (Level 0-5)
 * 3. Confidence calculation with multi-source boosting
 * 4. Skill gap detection against target roles
 * 5. Unification of conflicting evidence
 */

// ── Types ──────────────────────────────────────────────────────────

export interface Evidence {
  id: string;
  source: "github" | "linkedin" | "career_profile" | "project" | "certification" | "assessment";
  type: "dependency" | "source_code" | "config" | "readme" | "profile_skill" | "project_mention" | "certification";
  skill: string;
  confidence: number;
  strength: number;
  repository?: string;
  file?: string;
  snippet?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface DetectedSkill {
  id: string;
  name: string;
  category: string;
  confidence: number;
  depthLevel: number; // 0-5
  depthScore: number; // 0-100
  evidenceCount: number;
  sourceCount: number;
  sources: string[];
  evidence: Evidence[];
  reasoning: string;
}

export interface SkillGap {
  skill: string;
  category: string;
  currentLevel: number;
  targetLevel: number;
  gap: number; // targetLevel - currentLevel
  severity: "critical" | "high" | "medium" | "low";
  reason: string;
  recommendedActions: string[];
}

export interface RoleRequirements {
  role: string;
  requiredSkills: { name: string; minLevel: number; category: string }[];
  preferredSkills: { name: string; minLevel: number; category: string }[];
}

// ── Evidence Source Weights ─────────────────────────────────────────

const SOURCE_WEIGHTS: Record<Evidence["source"], number> = {
  github: 1.0,         // Highest — actual code evidence
  certification: 0.85,  // Verified credentials
  project: 0.75,        // Project evidence
  linkedin: 0.5,        // Profile claim (needs corroboration)
  career_profile: 0.4,  // Self-declared
  assessment: 0.7,      // Test/assessment results
};

const TYPE_WEIGHTS: Record<Evidence["type"], number> = {
  source_code: 1.0,     // Strongest — actual usage in code
  dependency: 0.8,      // Strong — actively used package
  config: 0.6,          // Moderate — configured but may not use directly
  certification: 0.85,  // Verified
  project_mention: 0.5, // Mentioned in project
  readme: 0.3,          // Weakest — just mentioned
  profile_skill: 0.25,  // Self-declared on profile
};

// ── Confidence Boosting ────────────────────────────────────────────

const MULTI_SOURCE_BOOST = 15;     // Bonus for 2+ independent sources
const THREE_SOURCE_BOOST = 25;     // Bonus for 3+ independent sources
const CONTRADICTION_PENALTY = -10;  // Penalty when evidence contradicts

// ── Depth Thresholds ───────────────────────────────────────────────

const DEPTH_THRESHOLDS = [
  { level: 0, minScore: 0, label: "Mentioned" },
  { level: 1, minScore: 15, label: "Basic Usage" },
  { level: 2, minScore: 35, label: "Practical Usage" },
  { level: 3, minScore: 55, label: "Intermediate" },
  { level: 4, minScore: 75, label: "Advanced" },
  { level: 5, minScore: 90, label: "Expert Evidence" },
];

// ── Skill Taxonomy ─────────────────────────────────────────────────

const SKILL_CATEGORIES: Record<string, string> = {
  react: "framework", vue: "framework", angular: "framework", svelte: "framework",
  nextjs: "framework", nuxt: "framework", nodejs: "framework", express: "framework",
  fastapi: "framework", django: "framework", flask: "framework", rails: "framework",
  spring: "framework", gin: "framework", actix: "framework",
  typescript: "language", javascript: "language", python: "language", go: "language",
  rust: "language", java: "language", ruby: "language", php: "language",
  postgresql: "database", mongodb: "database", redis: "database", sqlite: "database",
  mysql: "database", prisma: "database", drizzle: "database",
  docker: "devops", kubernetes: "devops", terraform: "devops", ci_cd: "devops",
  aws: "cloud", gcp: "cloud", azure: "cloud", vercel: "cloud",
  jest: "testing", vitest: "testing", playwright: "testing", cypress: "testing",
  pytest: "testing", rspec: "testing",
};

// ── Core Functions ─────────────────────────────────────────────────

/**
 * Detect skills from a collection of evidence objects.
 * Groups evidence by skill name, computes unified confidence and depth.
 */
export function detectSkillsFromEvidence(evidenceList: Evidence[]): DetectedSkill[] {
  // Group evidence by skill name (case-insensitive)
  const skillMap = new Map<string, Evidence[]>();

  for (const evidence of evidenceList) {
    const key = evidence.skill.toLowerCase().trim();
    if (!skillMap.has(key)) skillMap.set(key, []);
    skillMap.get(key)!.push(evidence);
  }

  const skills: DetectedSkill[] = [];

  for (const [skillKey, evidences] of skillMap) {
    const name = evidences[0]!.skill;
    const category = SKILL_CATEGORIES[skillKey] || categorizeSkill(skillKey, evidences);

    // Compute weighted confidence
    let weightedSum = 0;
    let weightTotal = 0;
    const sources = new Set<string>();

    for (const ev of evidences) {
      const sourceWeight = SOURCE_WEIGHTS[ev.source] ?? 0.5;
      const typeWeight = TYPE_WEIGHTS[ev.type] ?? 0.5;
      const combinedWeight = sourceWeight * typeWeight;
      weightedSum += ev.confidence * combinedWeight;
      weightTotal += combinedWeight;
      sources.add(ev.source);
    }

    let baseConfidence = weightTotal > 0 ? Math.round(weightedSum / weightTotal) : 0;

    // Multi-source boosting
    if (sources.size >= 3) baseConfidence = Math.min(100, baseConfidence + THREE_SOURCE_BOOST);
    else if (sources.size >= 2) baseConfidence = Math.min(100, baseConfidence + MULTI_SOURCE_BOOST);

    // Compute depth
    const { level: depthLevel, score: depthScore } = computeDepth(evidences, sources.size);

    // Compute final confidence (blend base confidence with depth)
    const confidence = Math.min(100, Math.round(baseConfidence * 0.7 + depthScore * 0.3));

    skills.push({
      id: `skill-${skillKey.replace(/[^a-z0-9]/g, "-")}`,
      name,
      category,
      confidence,
      depthLevel,
      depthScore,
      evidenceCount: evidences.length,
      sourceCount: sources.size,
      sources: Array.from(sources),
      evidence: evidences,
      reasoning: buildReasoning(name, evidences, sources.size, depthLevel),
    });
  }

  return skills.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Compute skill depth from evidence characteristics.
 */
function computeDepth(evidences: Evidence[], sourceCount: number): { level: number; score: number } {
  let score = 0;

  // Evidence count (0-30)
  if (evidences.length >= 10) score += 30;
  else if (evidences.length >= 5) score += 22;
  else if (evidences.length >= 3) score += 15;
  else if (evidences.length >= 1) score += 8;

  // Source diversity (0-20)
  if (sourceCount >= 3) score += 20;
  else if (sourceCount >= 2) score += 15;
  else score += 5;

  // Evidence quality (0-30)
  const hasSourceCode = evidences.some((e) => e.type === "source_code");
  const hasDependency = evidences.some((e) => e.type === "dependency");
  const hasConfig = evidences.some((e) => e.type === "config");
  if (hasSourceCode) score += 15;
  if (hasDependency) score += 10;
  if (hasConfig) score += 5;

  // Average confidence of evidence (0-20)
  const avgConf = evidences.reduce((s, e) => s + e.confidence, 0) / evidences.length;
  score += Math.round(avgConf * 0.2);

  score = Math.min(100, score);

  // Map to level
  let level = 0;
  for (const threshold of DEPTH_THRESHOLDS) {
    if (score >= threshold.minScore) level = threshold.level;
  }

  return { level, score };
}

/**
 * Detect skill gaps against target role requirements.
 */
export function detectSkillGaps(
  detectedSkills: DetectedSkill[],
  roleRequirements: RoleRequirements,
): SkillGap[] {
  const skillMap = new Map(detectedSkills.map((s) => [s.name.toLowerCase(), s]));
  const gaps: SkillGap[] = [];

  // Check required skills
  for (const req of roleRequirements.requiredSkills) {
    const detected = skillMap.get(req.name.toLowerCase());
    const currentLevel = detected?.depthLevel ?? 0;
    const gap = req.minLevel - currentLevel;

    if (gap > 0) {
      const severity = gap >= 3 ? "critical" : gap >= 2 ? "high" : gap >= 1 ? "medium" : "low";
      gaps.push({
        skill: req.name,
        category: req.category,
        currentLevel,
        targetLevel: req.minLevel,
        gap,
        severity,
        reason: detected
          ? `Current depth level ${currentLevel} (${detected.confidence}% confidence) is below required level ${req.minLevel}`
          : `No evidence found for ${req.name}`,
        recommendedActions: generateRecommendations(req.name, currentLevel, req.minLevel),
      });
    }
  }

  // Check preferred skills (lower priority)
  for (const pref of roleRequirements.preferredSkills) {
    const detected = skillMap.get(pref.name.toLowerCase());
    const currentLevel = detected?.depthLevel ?? 0;
    const gap = pref.minLevel - currentLevel;

    if (gap > 1) { // Only flag significant gaps in preferred skills
      gaps.push({
        skill: pref.name,
        category: pref.category,
        currentLevel,
        targetLevel: pref.minLevel,
        gap,
        severity: "low",
        reason: detected
          ? `Preferred skill ${pref.name} at level ${currentLevel}, could benefit from reaching level ${pref.minLevel}`
          : `No evidence for preferred skill ${pref.name}`,
        recommendedActions: generateRecommendations(pref.name, currentLevel, pref.minLevel),
      });
    }
  }

  return gaps.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4);
  });
}

/**
 * Merge evidence from multiple sources (e.g., GitHub + LinkedIn).
 * When sources agree, confidence increases. When they conflict, flag it.
 */
export function mergeEvidence(existing: Evidence[], incoming: Evidence[]): Evidence[] {
  const merged = [...existing];

  for (const inc of incoming) {
    const key = `${inc.skill.toLowerCase()}-${inc.type}`;
    const existingIdx = merged.findIndex(
      (e) => `${e.skill.toLowerCase()}-${e.type}` === key
    );

    if (existingIdx >= 0) {
      // Evidence exists — boost confidence if sources agree
      const existingEv = merged[existingIdx]!;
      if (existingEv.source !== inc.source) {
        // Different sources agree — increase confidence
        existingEv.confidence = Math.min(100, existingEv.confidence + MULTI_SOURCE_BOOST);
        existingEv.strength = Math.min(100, existingEv.strength + 10);
      }
    } else {
      merged.push(inc);
    }
  }

  return merged;
}

// ── Predefined Role Requirements ───────────────────────────────────

export const ROLE_TEMPLATES: Record<string, RoleRequirements> = {
  "frontend-developer": {
    role: "Frontend Developer",
    requiredSkills: [
      { name: "React", minLevel: 3, category: "framework" },
      { name: "TypeScript", minLevel: 3, category: "language" },
      { name: "CSS/Tailwind", minLevel: 2, category: "library" },
      { name: "JavaScript", minLevel: 4, category: "language" },
      { name: "REST API Integration", minLevel: 2, category: "backend" },
    ],
    preferredSkills: [
      { name: "Next.js", minLevel: 2, category: "framework" },
      { name: "Testing", minLevel: 2, category: "testing" },
      { name: "State Management", minLevel: 2, category: "library" },
    ],
  },
  "backend-developer": {
    role: "Backend Developer",
    requiredSkills: [
      { name: "Node.js", minLevel: 3, category: "framework" },
      { name: "SQL", minLevel: 3, category: "database" },
      { name: "REST API Design", minLevel: 3, category: "backend" },
      { name: "TypeScript", minLevel: 2, category: "language" },
      { name: "Docker", minLevel: 2, category: "devops" },
    ],
    preferredSkills: [
      { name: "PostgreSQL", minLevel: 2, category: "database" },
      { name: "Redis", minLevel: 1, category: "database" },
      { name: "CI/CD", minLevel: 2, category: "devops" },
    ],
  },
  "fullstack-developer": {
    role: "Full-Stack Developer",
    requiredSkills: [
      { name: "React", minLevel: 3, category: "framework" },
      { name: "Node.js", minLevel: 3, category: "framework" },
      { name: "TypeScript", minLevel: 3, category: "language" },
      { name: "SQL", minLevel: 2, category: "database" },
      { name: "REST API Design", minLevel: 2, category: "backend" },
      { name: "Docker", minLevel: 2, category: "devops" },
    ],
    preferredSkills: [
      { name: "Next.js", minLevel: 2, category: "framework" },
      { name: "Testing", minLevel: 2, category: "testing" },
      { name: "CI/CD", minLevel: 2, category: "devops" },
    ],
  },
  "devops-engineer": {
    role: "DevOps Engineer",
    requiredSkills: [
      { name: "Docker", minLevel: 4, category: "devops" },
      { name: "CI/CD", minLevel: 4, category: "devops" },
      { name: "Kubernetes", minLevel: 3, category: "devops" },
      { name: "Terraform", minLevel: 3, category: "devops" },
      { name: "AWS", minLevel: 3, category: "cloud" },
    ],
    preferredSkills: [
      { name: "Python", minLevel: 2, category: "language" },
      { name: "Monitoring", minLevel: 2, category: "devops" },
    ],
  },
  "staff-engineer": {
    role: "Staff Engineer",
    requiredSkills: [
      { name: "System Design", minLevel: 4, category: "architecture" },
      { name: "TypeScript", minLevel: 4, category: "language" },
      { name: "React", minLevel: 3, category: "framework" },
      { name: "Node.js", minLevel: 3, category: "framework" },
      { name: "SQL", minLevel: 3, category: "database" },
      { name: "Docker", minLevel: 3, category: "devops" },
      { name: "CI/CD", minLevel: 3, category: "devops" },
      { name: "Testing", minLevel: 3, category: "testing" },
    ],
    preferredSkills: [
      { name: "Architecture Patterns", minLevel: 4, category: "architecture" },
      { name: "Mentoring", minLevel: 3, category: "process" },
      { name: "Technical Writing", minLevel: 2, category: "process" },
    ],
  },
};

// ── Helpers ────────────────────────────────────────────────────────

function categorizeSkill(name: string, evidences: Evidence[]): string {
  const lower = name.toLowerCase();
  if (/react|vue|angular|svelte|next|nuxt/.test(lower)) return "framework";
  if (/typescript|javascript|python|go|rust|java|ruby|php/.test(lower)) return "language";
  if (/sql|postgres|mongo|redis|sqlite|prisma|drizzle/.test(lower)) return "database";
  if (/docker|k8s|terraform|ci|cd/.test(lower)) return "devops";
  if (/jest|vitest|playwright|cypress|pytest/.test(lower)) return "testing";
  if (/aws|gcp|azure|vercel/.test(lower)) return "cloud";
  return "library";
}

function buildReasoning(name: string, evidences: Evidence[], sourceCount: number, depthLevel: number): string {
  const depthLabel = DEPTH_THRESHOLDS[depthLevel]?.label ?? "Unknown";
  const types = [...new Set(evidences.map((e) => e.type))];
  const repos = [...new Set(evidences.filter((e) => e.repository).map((e) => e.repository))];

  let reasoning = `${name} detected with ${depthLabel} (level ${depthLevel}) from ${evidences.length} evidence points across ${sourceCount} source(s).`;

  if (types.includes("source_code")) reasoning += " Strong source-code usage evidence.";
  if (types.includes("dependency")) reasoning += " Found in project dependencies.";
  if (types.includes("readme") || types.includes("profile_skill")) reasoning += " Lower-confidence profile/README mentions.";

  if (repos.length > 0) reasoning += ` Evidence from ${repos.length} repository(ies).`;

  return reasoning;
}

function generateRecommendations(skill: string, currentLevel: number, targetLevel: number): string[] {
  const recs: string[] = [];
  const gap = targetLevel - currentLevel;

  if (currentLevel === 0) {
    recs.push(`Start learning ${skill} fundamentals through official documentation`);
    recs.push(`Complete a structured ${skill} tutorial or course`);
    recs.push(`Build a small project using ${skill}`);
  } else if (gap >= 3) {
    recs.push(`Take an advanced ${skill} course to build deeper understanding`);
    recs.push(`Contribute to open-source projects using ${skill}`);
    recs.push(`Build production-grade applications with ${skill}`);
  } else if (gap >= 2) {
    recs.push(`Practice ${skill} in more complex scenarios`);
    recs.push(`Study ${skill} best practices and design patterns`);
    recs.push(`Add ${skill} to an existing project`);
  } else {
    recs.push(`Refine ${skill} through advanced techniques and optimization`);
    recs.push(`Mentor others in ${skill} to solidify expertise`);
  }

  return recs;
}
