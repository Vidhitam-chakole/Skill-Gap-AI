/**
 * Report Routes
 */

import { Router, Response } from "express";
import { getDb } from "../db/database.js";
import { skills, repositories, recommendations } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { eq } from "drizzle-orm";

const router = Router();
router.use(authenticate);

function buildReport(db: ReturnType<typeof getDb>, userId: string) {
  const allSkills = db.select().from(skills).where(eq(skills.userId, userId)).all();
  const repos = db.select().from(repositories).where(eq(repositories.userId, userId)).all();
  const recs = db.select().from(recommendations).where(eq(recommendations.userId, userId)).all();
  const avgQuality = repos.length ? Math.round(repos.reduce((s, r) => s + (r.qualityScore ?? 0), 0) / repos.length) : 0;
  const maturity = Math.min(100, Math.round((allSkills.reduce((s, sk) => s + sk.confidence, 0) / (allSkills.length || 1)) * 0.4 + avgQuality * 0.3 + (repos.length * 3) * 0.3));
  return {
    generatedAt: new Date().toISOString(),
    developerName: "Developer",
    overallMaturity: maturity,
    topStrengths: allSkills.filter((s) => s.confidence >= 80).slice(0, 4).map((s) => `${s.name} expertise (${s.confidence}%)`),
    topGaps: allSkills.filter((s) => s.confidence < 50).slice(0, 4).map((s) => `Limited ${s.name} (${s.confidence}%)`),
    skillsSummary: allSkills.slice(0, 8).map((s) => ({ name: s.name, confidence: s.confidence, category: s.category })),
    repoQualitySummary: repos.slice(0, 8).map((r) => ({ name: r.name, score: r.qualityScore ?? 0 })),
    recommendations: recs.slice(0, 4).map((r) => ({ title: r.title, priority: r.severity, effort: "1-2 weeks" })),
  };
}

// Root GET — returns latest report
router.get("/", (req: AuthRequest, res: Response) => {
  const db = getDb();
  res.json({ success: true, data: buildReport(db, req.userId!) });
});

// Alias /latest → /
router.get("/latest", (req: AuthRequest, res: Response) => {
  const db = getDb();
  res.json({ success: true, data: buildReport(db, req.userId!) });
});

router.post("/generate", (_req: AuthRequest, res: Response) => {
  res.json({ success: true, data: { downloadUrl: "#generated" } });
});

export default router;
