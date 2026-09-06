/**
 * Skills Routes
 */

import { Router, Response } from "express";
import { getDb } from "../db/database.js";
import { skills, skillEvidence, skillRepos } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { eq, and } from "drizzle-orm";

const router = Router();
router.use(authenticate);

router.get("/", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { search, category, sort, dir } = req.query as Record<string, string>;
  let results = db.select().from(skills).where(eq(skills.userId, req.userId!)).all();
  if (search) { const q = search.toLowerCase(); results = results.filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)); }
  if (category && category !== "all") results = results.filter((s) => s.category === category);
  results.sort((a, b) => {
    let cmp = 0;
    switch (sort) {
      case "name": cmp = a.name.localeCompare(b.name); break;
      case "confidence": cmp = a.confidence - b.confidence; break;
      case "repos": cmp = (a.repoCount ?? 0) - (b.repoCount ?? 0); break;
      case "category": cmp = a.category.localeCompare(b.category); break;
      default: cmp = b.confidence - a.confidence;
    }
    return dir === "asc" ? cmp : -cmp;
  });
  res.json({ success: true, data: results });
});

router.get("/categories", (_req: AuthRequest, res: Response) => {
  const db = getDb();
  const cats = [...new Set(db.select().from(skills).all().map((s) => s.category))].sort();
  res.json({ success: true, data: cats });
});

router.get("/:name", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const skill = db.select().from(skills).where(and(eq(skills.userId, req.userId!), eq(skills.name, req.params.name))).get();
  if (!skill) { res.status(404).json({ success: false, error: "Skill not found" }); return; }
  const evidence = db.select().from(skillEvidence).where(eq(skillEvidence.skillId, skill.id)).all();
  const repos = db.select().from(skillRepos).where(eq(skillRepos.skillId, skill.id)).all();
  const groups: Record<string, { method: string; evidence: typeof evidence; linkedRepos: string[] }> = {};
  for (const e of evidence) {
    if (!groups[e.detectionMethod]) groups[e.detectionMethod] = { method: e.detectionMethod, evidence: [], linkedRepos: [] };
    groups[e.detectionMethod].evidence.push(e);
    if (e.repositoryName && !groups[e.detectionMethod].linkedRepos.includes(e.repositoryName)) groups[e.detectionMethod].linkedRepos.push(e.repositoryName);
  }
  res.json({ success: true, data: { ...skill, repos: repos.map((r) => ({ repoName: r.repoName, confidence: r.confidence })), evidenceGroups: Object.values(groups).map((g) => ({ method: g.method, evidence: g.evidence.map((e) => ({ sourceFile: e.sourceFile, line: e.line, snippet: e.snippet, detectionMethod: e.detectionMethod })), linkedRepos: g.linkedRepos })) } });
});

export default router;
