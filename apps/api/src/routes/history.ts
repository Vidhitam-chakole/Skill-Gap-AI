/**
 * History Routes
 */

import { Router, Response } from "express";
import { getDb } from "../db/database.js";
import { analysisRuns } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { eq, desc } from "drizzle-orm";

const router = Router();
router.use(authenticate);

// Root GET — returns analysis runs
router.get("/", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const runs = db.select().from(analysisRuns).where(eq(analysisRuns.userId, req.userId!)).orderBy(desc(analysisRuns.startedAt)).all();
  res.json({ success: true, data: runs.map((r) => ({ id: r.id, date: r.startedAt, confidence: r.confidence ?? 0, repoCount: r.repoCount ?? 0, qualityAvg: r.qualityAvg ?? 0, status: r.status })) });
});

// Alias /runs → /
router.get("/runs", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const runs = db.select().from(analysisRuns).where(eq(analysisRuns.userId, req.userId!)).orderBy(desc(analysisRuns.startedAt)).all();
  res.json({ success: true, data: runs.map((r) => ({ id: r.id, date: r.startedAt, confidence: r.confidence ?? 0, repoCount: r.repoCount ?? 0, qualityAvg: r.qualityAvg ?? 0, status: r.status })) });
});

export default router;
