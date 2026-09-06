/**
 * Recommendations Routes
 */

import { Router, Response } from "express";
import { getDb } from "../db/database.js";
import { recommendations } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { eq, and } from "drizzle-orm";

const router = Router();
router.use(authenticate);

router.get("/", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const recs = db.select().from(recommendations).where(and(eq(recommendations.userId, req.userId!), eq(recommendations.dismissed, false))).all();
  res.json({ success: true, data: recs.map((r) => ({ title: r.title, rationale: r.rationale, severity: r.severity, linkedEvidence: [], relatedSkillGaps: JSON.parse(r.relatedSkillGaps ?? "[]"), suggestedNextStep: r.suggestedNextStep })) });
});

router.post("/:id/dismiss", (req: AuthRequest, res: Response) => {
  const db = getDb();
  db.update(recommendations).set({ dismissed: true }).where(eq(recommendations.id, req.params.id)).run();
  res.json({ success: true, data: null });
});

export default router;
