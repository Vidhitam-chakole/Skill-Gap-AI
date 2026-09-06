/**
 * Roadmap Routes
 */

import { Router, Response } from "express";
import { getDb } from "../db/database.js";
import { roadmapSteps } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { eq, and } from "drizzle-orm";

const router = Router();
router.use(authenticate);

router.get("/", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const steps = db.select().from(roadmapSteps).where(eq(roadmapSteps.userId, req.userId!)).all().sort((a, b) => a.orderIndex - b.orderIndex);
  res.json({ success: true, data: { steps: steps.map((s) => ({ order: s.orderIndex, title: s.title, description: s.description, linkedSkillGaps: JSON.parse(s.linkedSkillGaps ?? "[]"), estimatedDuration: s.estimatedDuration, status: s.status })), totalEstimatedDuration: "8-12 weeks" } });
});

router.put("/steps/:orderId", (req: AuthRequest, res: Response) => {
  const db = getDb();
  db.update(roadmapSteps).set({ status: req.body.status }).where(and(eq(roadmapSteps.userId, req.userId!), eq(roadmapSteps.orderIndex, parseInt(req.params.orderId)))).run();
  res.json({ success: true, data: null });
});

export default router;
