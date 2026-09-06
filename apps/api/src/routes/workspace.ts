/**
 * Workspace Routes
 */

import { Router, Response } from "express";
import { getDb, saveDb } from "../db/database.js";
import { workspaceBoards, workspaceTabs, workspaceItems } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { eq } from "drizzle-orm";

const router = Router();
router.use(authenticate);

// Root GET — returns workspace boards
router.get("/", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const boards = db.select().from(workspaceBoards).where(eq(workspaceBoards.userId, req.userId!)).all();
  const result = boards.map((b) => {
    const tabs = db.select().from(workspaceTabs).where(eq(workspaceTabs.boardId, b.id)).all();
    return { ...b, tabs: tabs.map((t) => ({ ...t, items: db.select().from(workspaceItems).where(eq(workspaceItems.tabId, t.id)).all() })) };
  });
  res.json({ success: true, data: result });
});

router.get("/boards", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const boards = db.select().from(workspaceBoards).where(eq(workspaceBoards.userId, req.userId!)).all();
  const result = boards.map((b) => {
    const tabs = db.select().from(workspaceTabs).where(eq(workspaceTabs.boardId, b.id)).all();
    return { ...b, tabs: tabs.map((t) => ({ ...t, items: db.select().from(workspaceItems).where(eq(workspaceItems.tabId, t.id)).all() })) };
  });
  res.json({ success: true, data: result });
});

router.post("/boards/:id/items", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { tabId, title, description, status, notes } = req.body;
  const now = new Date().toISOString();
  const item = { id: crypto.randomUUID(), tabId, title, description: description ?? "", status: status ?? "todo", notes: notes ?? "", createdAt: now, updatedAt: now };
  db.insert(workspaceItems).values(item).run();
  saveDb();
  res.status(201).json({ success: true, data: item });
});

export default router;
