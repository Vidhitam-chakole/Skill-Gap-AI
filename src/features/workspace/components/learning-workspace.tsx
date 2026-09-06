/**
 * Learning Workspace
 * Kanban-style boards for tracking learning progress with tabs and item management.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ArrowLeft, Plus, GripVertical, Circle, CheckCircle, Clock, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/utils/cn";
import { fetchWorkspaceBoards, createWorkspaceItem } from "@/shared/services/workspace-service";
import type { WorkspaceBoard, WorkspaceTab, WorkspaceItem, WorkspaceItemStatus } from "@/shared/types";

const statusConfig: Record<WorkspaceItemStatus, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  todo: { icon: Circle, color: "text-text-tertiary", label: "Todo" },
  in_progress: { icon: Clock, color: "text-confidence-medium", label: "In Progress" },
  done: { icon: CheckCircle, color: "text-confidence-high", label: "Done" },
  blocked: { icon: AlertTriangle, color: "text-danger", label: "Blocked" },
};

export default function LearningWorkspace() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<WorkspaceBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBoard, setActiveBoard] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showNewItem, setShowNewItem] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", description: "", status: "todo" as WorkspaceItemStatus });

  useEffect(() => {
    fetchWorkspaceBoards().then((b) => {
      setBoards(b);
      if (b.length > 0) {
        setActiveBoard(b[0].id);
        if (b[0].tabs.length > 0) setActiveTab(b[0].tabs[0].id);
      }
      setLoading(false);
    });
  }, []);

  const currentBoard = boards.find((b) => b.id === activeBoard);
  const currentTab = currentBoard?.tabs.find((t) => t.id === activeTab);

  const handleCreateItem = async () => {
    if (!currentBoard || !currentTab || !newItem.title.trim()) return;
    const created = await createWorkspaceItem(currentBoard.id, currentTab.id, {
      title: newItem.title,
      description: newItem.description,
      status: newItem.status,
      notes: "",
    });
    setBoards((prev) =>
      prev.map((b) =>
        b.id === currentBoard.id
          ? {
              ...b,
              tabs: b.tabs.map((t) =>
                t.id === currentTab.id ? { ...t, items: [...t.items, created] } : t
              ),
            }
          : b
      )
    );
    setNewItem({ title: "", description: "", status: "todo" });
    setShowNewItem(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse bg-bg-raised" />
        <div className="h-64 animate-pulse bg-bg-raised" />
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
          <span className="brutal-overline block mb-1">Workspace</span>
          <h1 className="font-display text-heading-xl font-black uppercase tracking-tight text-text-primary">
            Learning Workspace
          </h1>
          <p className="mt-1 font-mono text-body-sm text-text-secondary">
            Track your learning progress across skill gaps
          </p>
        </div>
      </div>

      {/* Board Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-border-strong pb-2">
        {boards.map((board) => (
          <button
            key={board.id}
            onClick={() => {
              setActiveBoard(board.id);
              if (board.tabs.length > 0) setActiveTab(board.tabs[0].id);
            }}
            className={cn(
              "border-2 px-4 py-2 font-mono text-caption font-bold uppercase transition-all",
              activeBoard === board.id
                ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                : "border-border-strong text-text-secondary hover:border-text-tertiary"
            )}
          >
            {board.name}
          </button>
        ))}
      </div>

      {currentBoard && (
        <>
          {/* Sub-tabs */}
          <div className="flex items-center gap-2">
            {currentBoard.tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "border-b-2 px-3 py-1.5 font-mono text-caption font-bold uppercase transition-all",
                  activeTab === tab.id
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-text-tertiary hover:text-text-secondary"
                )}
              >
                {tab.name} ({tab.items.length})
              </button>
            ))}
            <button
              onClick={() => setShowNewItem(true)}
              className="ml-auto flex items-center gap-1 border-2 border-border-strong px-3 py-1.5 font-mono text-caption font-bold uppercase text-text-secondary hover:border-brand-primary hover:text-brand-primary transition-all"
            >
              <Plus className="h-3 w-3" /> Add Item
            </button>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {currentTab?.items.map((item, i) => {
                const status = statusConfig[item.status];
                const StatusIcon = status.icon;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-2 border-border-strong bg-bg-surface p-4"
                  >
                    <div className="flex items-start gap-3">
                      <GripVertical className="mt-1 h-4 w-4 shrink-0 text-text-tertiary cursor-grab" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusIcon className={cn("h-4 w-4", status.color)} />
                          <h3 className="font-mono text-body-sm font-bold text-text-primary">{item.title}</h3>
                          <span className="brutal-tag border-text-tertiary text-text-tertiary text-overline">{status.label}</span>
                        </div>
                        {item.description && (
                          <p className="font-mono text-caption text-text-secondary ml-6">{item.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 ml-6">
                          {item.linkedRoadmapStep && (
                            <span className="font-mono text-overline text-brand-secondary">
                              → {item.linkedRoadmapStep}
                            </span>
                          )}
                          <span className="font-mono text-overline text-text-tertiary">
                            Updated {new Date(item.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {currentTab && currentTab.items.length === 0 && (
              <div className="border-2 border-dashed border-border-strong p-8 text-center">
                <BookOpen className="mx-auto mb-3 h-8 w-8 text-text-tertiary" />
                <p className="font-mono text-body-sm text-text-tertiary">No items yet. Add your first learning item.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* New Item Modal */}
      <AnimatePresence>
        {showNewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={() => setShowNewItem(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md border-2 border-border-strong bg-bg-surface p-6 shadow-dialog"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-display text-body-lg font-bold uppercase tracking-wide text-text-primary">New Item</span>
                <button onClick={() => setShowNewItem(false)} className="text-text-tertiary hover:text-text-primary">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="brutal-overline block mb-1">Title</label>
                  <input
                    value={newItem.title}
                    onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g., Learn Playwright E2E testing"
                    className="brutal-input w-full"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="brutal-overline block mb-1">Description</label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
                    placeholder="What do you want to learn?"
                    className="brutal-input w-full h-20 resize-none"
                  />
                </div>
                <div>
                  <label className="brutal-overline block mb-1">Status</label>
                  <div className="flex gap-2">
                    {(["todo", "in_progress", "done", "blocked"] as WorkspaceItemStatus[]).map((s) => {
                      const cfg = statusConfig[s];
                      const Icon = cfg.icon;
                      return (
                        <button
                          key={s}
                          onClick={() => setNewItem((p) => ({ ...p, status: s }))}
                          className={cn(
                            "flex items-center gap-1 border-2 px-3 py-1.5 font-mono text-caption font-bold uppercase transition-all",
                            newItem.status === s
                              ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                              : "border-border-strong text-text-secondary hover:border-text-tertiary"
                          )}
                        >
                          <Icon className={cn("h-3 w-3", cfg.color)} /> {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowNewItem(false)}
                    className="flex-1 border-2 border-border-strong px-4 py-2 font-mono text-caption font-bold uppercase text-text-secondary hover:border-text-tertiary transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateItem}
                    disabled={!newItem.title.trim()}
                    className="flex-1 border-2 border-brand-primary bg-brand-primary/10 px-4 py-2 font-mono text-caption font-bold uppercase text-brand-primary hover:bg-brand-primary/20 transition-all disabled:opacity-50"
                  >
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
