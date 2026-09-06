/**
 * Auth Routes
 */

import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getDb, saveDb } from "../db/database.js";
import { users, userSettings } from "../db/schema.js";
import { authenticate, generateToken, type AuthRequest } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { eq } from "drizzle-orm";

const router = Router();

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
const signupSchema = z.object({ name: z.string().min(2).max(100), email: z.string().email(), password: z.string().min(8) });

router.post("/signup", validate(signupSchema), async (req: Request, res: Response) => {
  const db = getDb();
  const { name, email, password } = req.body;
  const existing = db.select().from(users).where(eq(users.email, email)).get();
  if (existing) { res.status(409).json({ success: false, error: "Email already registered" }); return; }

  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 12);
  const username = email.split("@")[0]!.toLowerCase().replace(/[^a-z0-9]/g, "");
  const joinDate = new Date().toISOString();

  db.insert(users).values({ id, email, name, username, passwordHash, joinDate }).run();
  db.insert(userSettings).values({ id: crypto.randomUUID(), userId: id }).run();
  saveDb();

  const token = generateToken(id);
  res.status(201).json({ success: true, data: { user: { id, username, name, email, avatar: "", bio: "", topLanguages: [], joinDate }, token } });
});

router.post("/login", validate(loginSchema), async (req: Request, res: Response) => {
  const db = getDb();
  const { email, password } = req.body;
  const user = db.select().from(users).where(eq(users.email, email)).get();
  if (!user) { res.status(401).json({ success: false, error: "Invalid email or password" }); return; }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) { res.status(401).json({ success: false, error: "Invalid email or password" }); return; }

  const token = generateToken(user.id);
  res.json({ success: true, data: { user: { id: user.id, username: user.username, name: user.name, email: user.email, avatar: user.avatar ?? "", bio: user.bio ?? "", topLanguages: [], joinDate: user.joinDate }, token } });
});

router.post("/logout", (_req: Request, res: Response) => {
  res.json({ success: true, data: null });
});

router.get("/me", authenticate, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const user = db.select().from(users).where(eq(users.id, req.userId!)).get();
  if (!user) { res.status(404).json({ success: false, error: "User not found" }); return; }
  res.json({ success: true, data: { id: user.id, username: user.username, name: user.name, email: user.email, avatar: user.avatar ?? "", bio: user.bio ?? "", topLanguages: [], joinDate: user.joinDate } });
});

router.get("/github", authenticate, (_req: AuthRequest, res: Response) => {
  res.json({ success: true, data: { connected: false, username: null, avatarUrl: null, repositories: 0 } });
});

router.get("/github/callback", authenticate, (_req: AuthRequest, res: Response) => {
  res.json({ success: true, data: { valid: false, username: "", repoCount: 0, error: "GitHub OAuth not configured" } });
});

export default router;
