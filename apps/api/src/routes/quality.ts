/**
 * Quality Routes
 */

import { Router, Response } from "express";
import { getDb } from "../db/database.js";
import { qualityScores, repositories } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { eq } from "drizzle-orm";

const router = Router();
router.use(authenticate);

router.get("/", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const repos = db.select().from(repositories).where(eq(repositories.userId, req.userId!)).all();
  const qualityData = repos.map((r) => {
    const q = db.select().from(qualityScores).where(eq(qualityScores.repoId, r.id)).get();
    return { repoName: r.name, overallScore: q?.overallScore ?? r.qualityScore ?? 0, stars: r.stars ?? 0, lastUpdated: r.lastUpdated ?? "", subScores: { documentation: q?.documentation ?? 0, testing: q?.testing ?? 0, cicd: q?.cicd ?? 0, structure: q?.structure ?? 0 } };
  }).sort((a, b) => b.overallScore - a.overallScore);
  const avg = qualityData.length ? Math.round(qualityData.reduce((s, r) => s + r.overallScore, 0) / qualityData.length) : 0;
  const len = qualityData.length || 1;
  res.json({ success: true, data: { repos: qualityData, averageScore: avg, bestRepo: qualityData[0]?.repoName ?? "", worstRepo: qualityData[qualityData.length - 1]?.repoName ?? "", subScoreAverages: { documentation: Math.round(qualityData.reduce((s, r) => s + r.subScores.documentation, 0) / len), testing: Math.round(qualityData.reduce((s, r) => s + r.subScores.testing, 0) / len), cicd: Math.round(qualityData.reduce((s, r) => s + r.subScores.cicd, 0) / len), structure: Math.round(qualityData.reduce((s, r) => s + r.subScores.structure, 0) / len) } } });
});

export default router;
