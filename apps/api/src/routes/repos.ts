/**
 * Repository Routes
 */

import { Router, Response } from "express";
import { getDb } from "../db/database.js";
import { repositories, technologies, qualityScores, architecturePatterns } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { eq, and } from "drizzle-orm";

const router = Router();
router.use(authenticate);

router.get("/", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { search, language, sort, dir } = req.query as Record<string, string>;
  let results = db.select().from(repositories).where(eq(repositories.userId, req.userId!)).all();

  if (search) { const q = search.toLowerCase(); results = results.filter((r) => r.name.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q)); }
  if (language && language !== "all") results = results.filter((r) => r.primaryLanguage === language);
  results.sort((a, b) => {
    let cmp = 0;
    switch (sort) {
      case "name": cmp = a.name.localeCompare(b.name); break;
      case "quality": cmp = (a.qualityScore ?? 0) - (b.qualityScore ?? 0); break;
      case "stars": cmp = (a.stars ?? 0) - (b.stars ?? 0); break;
      case "updated": cmp = (a.lastUpdated ?? "").localeCompare(b.lastUpdated ?? ""); break;
      default: cmp = (b.qualityScore ?? 0) - (a.qualityScore ?? 0);
    }
    return dir === "asc" ? cmp : -cmp;
  });
  res.json({ success: true, data: results });
});

router.get("/languages", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const allRepos = db.select().from(repositories).where(eq(repositories.userId, req.userId!)).all();
  const langs = [...new Set(allRepos.map((r) => r.primaryLanguage).filter(Boolean))].sort();
  res.json({ success: true, data: langs });
});

router.get("/:name", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const repo = db.select().from(repositories).where(and(eq(repositories.userId, req.userId!), eq(repositories.name, req.params.name))).get();
  if (!repo) { res.status(404).json({ success: false, error: "Repository not found" }); return; }

  const techs = db.select().from(technologies).where(eq(technologies.repoId, repo.id)).all();
  const quality = db.select().from(qualityScores).where(eq(qualityScores.repoId, repo.id)).get();
  const patterns = db.select().from(architecturePatterns).where(eq(architecturePatterns.userId, req.userId!)).all();

  res.json({
    success: true, data: {
      ...repo, techChips: techs.map((t) => t.name),
      dependencies: techs.map((t) => ({ name: t.name, version: t.version ?? "", category: t.category })),
      qualitySubScores: quality ? { documentation: quality.documentation, testing: quality.testing, cicd: quality.cicd, structure: quality.structure } : { documentation: 0, testing: 0, cicd: 0, structure: 0 },
      architecturePatterns: patterns.map((p) => ({ name: p.name, confidence: p.confidence, detectedFiles: [], folderModuleRelationships: [], whyDetected: p.whyDetected ?? "" })),
    },
  });
});

export default router;
