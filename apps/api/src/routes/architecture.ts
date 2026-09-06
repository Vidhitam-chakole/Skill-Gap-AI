/**
 * Architecture Routes
 */

import { Router, Response } from "express";
import { getDb } from "../db/database.js";
import { architecturePatterns, architectureFiles, architectureRelationships, repositories } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { eq } from "drizzle-orm";

const router = Router();
router.use(authenticate);

// Root GET — returns architecture overview (patterns + graph combined)
router.get("/", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const patterns = db.select().from(architecturePatterns).where(eq(architecturePatterns.userId, req.userId!)).all();
  const files = db.select().from(architectureFiles).all();
  const result = patterns.map((p) => {
    const pFiles = files.filter((f) => f.patternId === p.id);
    return { name: p.name, confidence: p.confidence, whyDetected: p.whyDetected ?? "", detectedFiles: pFiles.map((f) => f.filePath) };
  });
  res.json({ success: true, data: result });
});

router.get("/patterns", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const patterns = db.select().from(architecturePatterns).where(eq(architecturePatterns.userId, req.userId!)).all();
  const result = patterns.map((p) => {
    const files = db.select().from(architectureFiles).where(eq(architectureFiles.patternId, p.id)).all();
    const rels = db.select().from(architectureRelationships).where(eq(architectureRelationships.patternId, p.id)).all();
    return { name: p.name, confidence: p.confidence, whyDetected: p.whyDetected ?? "", detectedFiles: files.map((f) => f.filePath), folderModuleRelationships: rels.map((r) => r.relationship) };
  });
  res.json({ success: true, data: result });
});

router.get("/graph", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const patterns = db.select().from(architecturePatterns).where(eq(architecturePatterns.userId, req.userId!)).all();
  const repos = db.select().from(repositories).where(eq(repositories.userId, req.userId!)).all();
  const nodes = [...repos.map((r) => ({ id: r.name, label: r.name, type: "repo" as const })), ...patterns.map((p) => ({ id: p.name, label: p.name, type: "pattern" as const, confidence: p.confidence }))];
  const links = repos.flatMap((r) => patterns.filter((p) => p.confidence > 50).map((p) => ({ source: r.name, target: p.name, strength: p.confidence })));
  res.json({ success: true, data: { nodes, links } });
});

export default router;
