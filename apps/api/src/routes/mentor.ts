/**
 * Mentor Routes
 */

import { Router, Response } from "express";
import { getDb, saveDb } from "../db/database.js";
import { mentorConversations, mentorMessages, skills, repositories } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { eq } from "drizzle-orm";

const router = Router();
router.use(authenticate);

// Root GET — returns mentor conversations
router.get("/", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const convos = db.select().from(mentorConversations).where(eq(mentorConversations.userId, req.userId!)).all();
  res.json({ success: true, data: convos });
});

router.get("/grounding", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const allSkills = db.select().from(skills).where(eq(skills.userId, req.userId!)).all();
  const repos = db.select().from(repositories).where(eq(repositories.userId, req.userId!)).all();
  const avgQuality = repos.length ? Math.round(repos.reduce((s, r) => s + (r.qualityScore ?? 0), 0) / repos.length) : 0;
  const maturity = Math.min(100, Math.round(allSkills.reduce((s, sk) => s + sk.confidence, 0) / (allSkills.length || 1)));
  res.json({ success: true, data: { developerProfile: true, githubAnalysis: repos.length > 0, skills: allSkills.slice(0, 10).map((s) => s.name), engineeringMaturity: maturity, repoQuality: avgQuality, strengths: allSkills.filter((s) => s.confidence >= 70).map((s) => `${s.name} (${s.confidence}%)`), weaknesses: allSkills.filter((s) => s.confidence < 50).map((s) => `${s.name} (${s.confidence}%)`), careerGoals: [] } });
});

router.get("/conversations", (req: AuthRequest, res: Response) => {
  const db = getDb();
  res.json({ success: true, data: db.select().from(mentorConversations).where(eq(mentorConversations.userId, req.userId!)).all() });
});

router.get("/conversations/:id/messages", (req: AuthRequest, res: Response) => {
  const db = getDb();
  res.json({ success: true, data: db.select().from(mentorMessages).where(eq(mentorMessages.conversationId, req.params.id)).all() });
});

router.post("/conversations/:id/send", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { content } = req.body;
  const now = new Date().toISOString();
  const userMsg = { id: crypto.randomUUID(), conversationId: req.params.id, role: "user" as const, content, createdAt: now };
  const aiMsg = { id: crypto.randomUUID(), conversationId: req.params.id, role: "assistant" as const, content: "AI mentor will be powered by LLM in Phase 12. This is a stub response.", createdAt: now };
  db.insert(mentorMessages).values([userMsg, aiMsg]).run();
  saveDb();
  res.json({ success: true, data: userMsg });
});

export default router;
