/**
 * Settings Page
 * User account, career profile, notifications, and theme settings.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, ArrowLeft, User, Briefcase, Bell, Palette, Save, Mail, Building, Target } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/shared/utils/cn";
import { useThemeStore } from "@/shared/store";
import { fetchSettings, updateSettings } from "@/shared/services/settings-service";
import type { UserSettings, ExperienceLevel } from "@/shared/types";

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-Level" },
  { value: "senior", label: "Senior" },
  { value: "staff", label: "Staff" },
  { value: "lead", label: "Lead" },
  { value: "principal", label: "Principal" },
];

const CAREER_GOALS = [
  "Staff Engineer", "Principal Engineer", "Engineering Manager", "Open Source Leader",
  "Technical Writer", "Conference Speaker", "CTO", "Founder",
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { toggleTheme, resolvedTheme } = useThemeStore();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings().then((s) => { setSettings(s); setLoading(false); });
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    await updateSettings(settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (path: string, value: unknown) => {
    if (!settings) return;
    const keys = path.split(".");
    const updated = { ...settings };
    let obj: Record<string, unknown> = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      obj[keys[i]] = { ...(obj[keys[i]] as Record<string, unknown>) };
      obj = obj[keys[i]] as Record<string, unknown>;
    }
    obj[keys[keys.length - 1]] = value;
    setSettings(updated);
  };

  const toggleGoal = (goal: string) => {
    if (!settings) return;
    const goals = settings.careerProfile.careerGoals;
    const updated = goals.includes(goal) ? goals.filter((g) => g !== goal) : [...goals, goal];
    update("careerProfile.careerGoals", updated);
  };

  if (loading || !settings) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse bg-bg-raised" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse bg-bg-raised" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => navigate("/dashboard")} className="mb-2 flex items-center gap-1 font-mono text-caption text-text-tertiary hover:text-brand-primary transition-colors">
            <ArrowLeft className="h-3 w-3" /> BACK
          </button>
          <span className="brutal-overline block mb-1">Settings</span>
          <h1 className="font-display text-heading-xl font-black uppercase tracking-tight text-text-primary">Settings</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "flex items-center gap-2 border-2 px-4 py-2 font-mono text-caption font-bold uppercase transition-all",
            saved
              ? "border-confidence-high bg-confidence-high/10 text-confidence-high"
              : "border-brand-primary bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20"
          )}
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : saved ? "Saved!" : "Save"}
        </button>
      </div>

      {/* Account */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border-2 border-border-strong bg-bg-surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-brand-primary" />
          <span className="font-display text-body-lg font-bold uppercase tracking-wide text-text-primary">Account</span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="brutal-overline block mb-1">Name</label>
            <input value={settings.account.name} onChange={(e) => update("account.name", e.target.value)} className="brutal-input w-full" />
          </div>
          <div>
            <label className="brutal-overline block mb-1">Email</label>
            <input value={settings.account.email} onChange={(e) => update("account.email", e.target.value)} className="brutal-input w-full" />
          </div>
        </div>
      </motion.div>

      {/* Career Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="border-2 border-border-strong bg-bg-surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-5 w-5 text-brand-secondary" />
          <span className="font-display text-body-lg font-bold uppercase tracking-wide text-text-primary">Career Profile</span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="brutal-overline block mb-1">Company</label>
            <input value={settings.careerProfile.company} onChange={(e) => update("careerProfile.company", e.target.value)} className="brutal-input w-full" />
          </div>
          <div>
            <label className="brutal-overline block mb-1">Current Role</label>
            <input value={settings.careerProfile.currentRole} onChange={(e) => update("careerProfile.currentRole", e.target.value)} className="brutal-input w-full" />
          </div>
          <div>
            <label className="brutal-overline block mb-1">Target Role</label>
            <input value={settings.careerProfile.targetRole} onChange={(e) => update("careerProfile.targetRole", e.target.value)} className="brutal-input w-full" />
          </div>
          <div>
            <label className="brutal-overline block mb-1">Years of Experience</label>
            <input type="number" value={settings.careerProfile.yearsOfExperience} onChange={(e) => update("careerProfile.yearsOfExperience", parseInt(e.target.value) || 0)} className="brutal-input w-full" />
          </div>
          <div>
            <label className="brutal-overline block mb-1">Experience Level</label>
            <select value={settings.careerProfile.experienceLevel} onChange={(e) => update("careerProfile.experienceLevel", e.target.value)} className="brutal-input w-full">
              {EXPERIENCE_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="brutal-overline block mb-1">Career Path</label>
            <input value={settings.careerProfile.careerPath} onChange={(e) => update("careerProfile.careerPath", e.target.value)} className="brutal-input w-full" />
          </div>
        </div>

        <div className="mt-4">
          <label className="brutal-overline block mb-2">Career Goals</label>
          <div className="flex flex-wrap gap-2">
            {CAREER_GOALS.map((goal) => (
              <button
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={cn(
                  "border-2 px-3 py-1.5 font-mono text-caption font-bold uppercase transition-all",
                  settings.careerProfile.careerGoals.includes(goal)
                    ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                    : "border-border-strong text-text-secondary hover:border-text-tertiary"
                )}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="border-2 border-border-strong bg-bg-surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-brand-tertiary" />
          <span className="font-display text-body-lg font-bold uppercase tracking-wide text-text-primary">Notifications</span>
        </div>
        <div className="space-y-3">
          {([
            { key: "emailDigest", label: "Email Digest", desc: "Weekly summary of your engineering activity" },
            { key: "skillUpdates", label: "Skill Updates", desc: "Notify when skill confidence scores change" },
            { key: "recommendations", label: "Recommendations", desc: "Notify when new recommendations are available" },
          ] as const).map((pref) => (
            <label key={pref.key} className="flex items-center justify-between border border-border-subtle bg-bg-surface-alt p-3 cursor-pointer">
              <div>
                <span className="font-mono text-body-sm font-bold text-text-primary">{pref.label}</span>
                <p className="font-mono text-caption text-text-tertiary">{pref.desc}</p>
              </div>
              <button
                onClick={() => update(`notificationPrefs.${pref.key}`, !settings.notificationPrefs[pref.key])}
                className={cn(
                  "h-6 w-11 border-2 transition-all relative",
                  settings.notificationPrefs[pref.key]
                    ? "border-brand-primary bg-brand-primary/20"
                    : "border-border-strong bg-bg-raised"
                )}
              >
                <div className={cn(
                  "absolute top-0.5 h-4 w-4 transition-all",
                  settings.notificationPrefs[pref.key]
                    ? "left-5 bg-brand-primary"
                    : "left-0.5 bg-text-tertiary"
                )} />
              </button>
            </label>
          ))}
        </div>
      </motion.div>

      {/* Theme */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="border-2 border-border-strong bg-bg-surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-5 w-5 text-brand-quaternary" />
          <span className="font-display text-body-lg font-bold uppercase tracking-wide text-text-primary">Theme</span>
        </div>
        <div className="flex gap-3">
          {(["dark", "light"] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => { if ((theme === "dark") !== (resolvedTheme === "dark")) toggleTheme(); }}
              className={cn(
                "border-2 px-6 py-3 font-mono text-caption font-bold uppercase transition-all",
                (theme === "dark") === (resolvedTheme === "dark")
                  ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                  : "border-border-strong text-text-secondary hover:border-text-tertiary"
              )}
            >
              {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
