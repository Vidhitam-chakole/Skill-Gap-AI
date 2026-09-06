/**
 * Export Routes
 */

import { Router, Request, Response } from "express";
import { getDb, saveDb } from "../db/database.js";
import { shareLinks } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// Root GET — returns export options
router.get("/", (_req: AuthRequest, res: Response) => {
  res.json({ success: true, data: { formats: ["pdf", "markdown", "json"], shareEnabled: true } });
});

router.post("/generate", (req: AuthRequest, res: Response) => {
  const { format } = req.body;
  const sizes: Record<string, string> = { pdf: "2.4 MB", markdown: "128 KB", json: "84 KB" };
  res.json({ success: true, data: { downloadUrl: `#export-${format}`, fileSize: sizes[format] ?? "100 KB" } });
});

router.post("/share", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const token = "share-" + crypto.randomUUID().slice(0, 8);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.insert(shareLinks).values({ id: crypto.randomUUID(), userId: req.userId!, token, expiresAt, recruiterView: false }).run();
  saveDb();
  res.json({ success: true, data: { token, url: `http://localhost:5173/share/${token}`, expiresAt, recruiterView: false } });
});

router.get("/download/:token", (_req: Request, res: Response) => {
  res.json({ success: true, data: { content: "Export content placeholder" } });
});

export default router;
