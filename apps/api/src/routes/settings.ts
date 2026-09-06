/**
 * Settings Routes
 */

import { Router, Response } from "express";
import { getDb, saveDb } from "../db/database.js";
import { users, careerProfiles, userSettings } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { eq } from "drizzle-orm";

const router = Router();
router.use(authenticate);

function getSettings(userId: string) {
  const db = getDb();
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  const career = db.select().from(careerProfiles).where(eq(careerProfiles.userId, userId)).get();
  const settings = db.select().from(userSettings).where(eq(userSettings.userId, userId)).get();
  return {
    account: { name: user?.name ?? "", email: user?.email ?? "", avatar: user?.avatar ?? "" },
    careerProfile: { company: career?.company ?? "", yearsOfExperience: career?.yearsOfExperience ?? 0, currentRole: career?.currentRole ?? "", careerPath: career?.careerPath ?? "", targetRole: career?.targetRole ?? "", experienceLevel: career?.experienceLevel ?? "mid", careerGoals: JSON.parse(career?.careerGoals ?? "[]") },
    notificationPrefs: { emailDigest: settings?.emailDigest ?? true, skillUpdates: settings?.skillUpdates ?? true, recommendations: settings?.recommendationsNotif ?? true },
    theme: settings?.theme ?? "dark",
  };
}

router.get("/", (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: getSettings(req.userId!) });
});

router.put("/", (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { account, careerProfile, notificationPrefs, theme } = req.body;
  if (account) db.update(users).set({ name: account.name, email: account.email }).where(eq(users.id, req.userId!)).run();
  if (careerProfile) {
    const existing = db.select().from(careerProfiles).where(eq(careerProfiles.userId, req.userId!)).get();
    if (existing) db.update(careerProfiles).set({ ...careerProfile, careerGoals: JSON.stringify(careerProfile.careerGoals ?? []) }).where(eq(careerProfiles.userId, req.userId!)).run();
    else db.insert(careerProfiles).values({ id: crypto.randomUUID(), userId: req.userId!, ...careerProfile, careerGoals: JSON.stringify(careerProfile.careerGoals ?? []) }).run();
  }
  if (notificationPrefs) db.update(userSettings).set({ emailDigest: notificationPrefs.emailDigest, skillUpdates: notificationPrefs.skillUpdates, recommendationsNotif: notificationPrefs.recommendations }).where(eq(userSettings.userId, req.userId!)).run();
  if (theme) db.update(userSettings).set({ theme }).where(eq(userSettings.userId, req.userId!)).run();
  saveDb();
  res.json({ success: true, data: getSettings(req.userId!) });
});

export default router;
