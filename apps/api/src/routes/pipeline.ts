/**
 * Pipeline Routes
 */

import { Router, Response } from "express";
import { getDb, saveDb } from "../db/database.js";
import { analysisRuns } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { eq, desc } from "drizzle-orm";

const router = Router();
router.use(authenticate);

// Root GET — returns latest analysis status
router.get("/", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const run = db.select().from(analysisRuns).where(eq(analysisRuns.userId, req.userId!)).orderBy(desc(analysisRuns.startedAt)).limit(1).get();
  res.json({ success: true, data: run ? { id: run.id, status: run.status, currentStage: run.currentStage, startedAt: run.startedAt, completedAt: run.completedAt, error: run.error } : null });
});

router.post("/start", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.insert(analysisRuns).values({ id, userId: req.userId!, status: "queued", startedAt: now }).run();
  saveDb();
  res.json({ success: true, data: { id, status: "queued", currentStage: "queued", startedAt: now, stages: [] } });
});

router.get("/status", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const run = db.select().from(analysisRuns).where(eq(analysisRuns.userId, req.userId!)).orderBy(desc(analysisRuns.startedAt)).limit(1).get();
  res.json({ success: true, data: run ? { id: run.id, status: run.status, currentStage: run.currentStage, startedAt: run.startedAt, error: run.error } : null });
});

router.post("/cancel", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const run = db.select().from(analysisRuns).where(eq(analysisRuns.userId, req.userId!)).orderBy(desc(analysisRuns.startedAt)).limit(1).get();
  if (run) db.update(analysisRuns).set({ status: "cancelled" }).where(eq(analysisRuns.id, run.id)).run();
  saveDb();
  res.json({ success: true, data: null });
});

router.post("/retry", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.insert(analysisRuns).values({ id, userId: req.userId!, status: "queued", startedAt: now }).run();
  saveDb();
  res.json({ success: true, data: { id, status: "queued", currentStage: "queued", startedAt: now, stages: [] } });
});

export default router;
