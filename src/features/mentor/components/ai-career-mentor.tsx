/**
 * AI Career Mentor — BRUTALIST × NEO-MAXIMALIST
 * Reference: Design Spec Part C, Screen 19
 *
 * Features:
 * - Conversation sidebar with list of past conversations
 * - Chat interface with user/assistant message bubbles
 * - Simulated streaming responses (word-by-word)
 * - Grounding Panel showing developer profile context
 * - New conversation creation
 * - Typing indicator during streaming
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  User,
  Plus,
  MessageSquare,
  Send,
  ChevronRight,
  Shield,
  Sparkles,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Loader2,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";
import {
  fetchConversations,
  fetchMessages,
  fetchGroundingContext,
  streamMentorResponse,
} from "@/shared/services";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { cn } from "@/shared/utils/cn";
import type {
  MentorConversation,
  MentorMessage,
  GroundingContext,
} from "@/shared/types";

// ============================================================
// Main Component
// ============================================================

export default function AiCareerMentor() {
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [showGrounding, setShowGrounding] = useState(true);
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cancelStreamRef = useRef<(() => void) | null>(null);

  // Fetch conversations
  const {
    data: conversations,
    isLoading: convsLoading,
    error: convsError,
  } = useQuery({
    queryKey: ["mentor-conversations"],
    queryFn: fetchConversations,
  });

  // Fetch grounding context
  const { data: grounding } = useQuery({
    queryKey: ["mentor-grounding"],
    queryFn: fetchGroundingContext,
  });

  // Fetch messages when conversation changes
  const { data: fetchedMessages, isLoading: msgsLoading } = useQuery({
    queryKey: ["mentor-messages", activeConvId],
    queryFn: () => fetchMessages(activeConvId!),
    enabled: !!activeConvId,
  });

  // Sync fetched messages to local state
  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Select first conversation by default
  useEffect(() => {
    if (conversations && conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  // ============================================================
  // Send message
  // ============================================================

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text || streaming) return;

    const userMsg: MentorMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setStreaming(true);

    // Start streaming assistant response
    let fullResponse = "";
    const assistantMsg: MentorMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      groundingContext: grounding,
    };

    setMessages((prev) => [...prev, assistantMsg]);

    cancelStreamRef.current = streamMentorResponse(
      text,
      (chunk) => {
        fullResponse += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: fullResponse }
              : m,
          ),
        );
      },
      () => {
        setStreaming(false);
        cancelStreamRef.current = null;
      },
    );
  }, [inputValue, streaming, grounding]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ============================================================
  // Error state
  // ============================================================

  if (convsError) {
    return (
      <ErrorState
        title="Failed to load mentor"
        message="Something went wrong."
      />
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 border-2 border-border-strong bg-bg-surface">
      {/* ============================================================ */}
      {/* CONVERSATION SIDEBAR */}
      {/* ============================================================ */}
      <div className="flex w-72 shrink-0 flex-col border-r-2 border-border-strong">
        {/* Sidebar header */}
        <div className="flex items-center justify-between border-b-2 border-border-strong px-4 py-3">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-brand-primary" />
            <span className="font-mono text-body-sm font-bold uppercase tracking-wide text-text-primary">
              Mentor
            </span>
          </div>
          <button
            onClick={() => {
              setActiveConvId(null);
              setMessages([]);
            }}
            className="flex h-7 w-7 items-center justify-center border-2 border-border-strong bg-bg-surface-alt text-text-secondary transition-all hover:border-brand-primary hover:text-brand-primary"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="mb-2 h-14 bg-bg-surface-alt animate-pulse" />
              ))}
            </div>
          ) : conversations && conversations.length > 0 ? (
            <div className="flex flex-col gap-0">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveConvId(conv.id);
                    setStreaming(false);
                    cancelStreamRef.current?.();
                  }}
                  className={cn(
                    "flex items-center gap-3 border-b border-border-subtle px-4 py-3 text-left transition-all hover:bg-bg-surface-alt",
                    activeConvId === conv.id &&
                      "bg-brand-primary/6 border-l-2 border-l-brand-primary",
                  )}
                >
                  <MessageSquare className="h-4 w-4 shrink-0 text-text-tertiary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-caption font-bold text-text-primary">
                      {conv.title}
                    </p>
                    <p className="font-mono text-overline text-text-tertiary">
                      {conv.messageCount} messages
                    </p>
                  </div>
                  <ChevronRight className="h-3 w-3 shrink-0 text-text-tertiary" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4">
              <EmptyState
                title="No conversations yet"
                description="Start a new conversation with your AI mentor."
                className="border-0 py-4"
              />
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* CHAT AREA */}
      {/* ============================================================ */}
      <div className="flex flex-1 flex-col">
        {/* Chat header */}
        <div className="flex items-center justify-between border-b-2 border-border-strong px-5 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-primary" />
            <span className="font-mono text-body-sm font-bold text-text-primary">
              {activeConvId
                ? conversations?.find((c) => c.id === activeConvId)?.title ??
                  "New Conversation"
                : "New Conversation"}
            </span>
          </div>
          <button
            onClick={() => setShowGrounding((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 border-2 px-3 py-1.5 font-mono text-caption font-bold uppercase tracking-wider transition-all",
              showGrounding
                ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                : "border-border-strong text-text-tertiary hover:border-brand-primary",
            )}
          >
            {showGrounding ? (
              <PanelRightClose className="h-3.5 w-3.5" />
            ) : (
              <PanelRightOpen className="h-3.5 w-3.5" />
            )}
            Context
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {msgsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-4 flex h-16 w-16 items-center justify-center border-2 border-brand-primary bg-brand-primary/10">
                <Bot className="h-8 w-8 text-brand-primary" />
              </div>
              <h3 className="font-mono text-body-md font-bold uppercase tracking-wide text-text-primary">
                AI Career Mentor
              </h3>
              <p className="mt-2 max-w-md text-center font-mono text-body-sm text-text-secondary leading-relaxed">
                Ask me anything about your career path, skills, or how to
                improve your engineering profile. I'll ground every response in
                your actual code analysis.
              </p>
              {/* Quick starters */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[
                  "What should I focus on next?",
                  "How do I reach Staff Engineer?",
                  "What are my biggest skill gaps?",
                  "How does my testing compare?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInputValue(q);
                      setTimeout(handleSend, 50);
                    }}
                    className="border-2 border-border-strong bg-bg-surface px-4 py-2 font-mono text-caption text-text-secondary transition-all hover:border-brand-primary hover:text-brand-primary hover:shadow-brutal-accent"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {streaming && (
                <div className="flex items-center gap-2 text-text-tertiary">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="font-mono text-caption">Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t-2 border-border-strong px-5 py-4">
          <div className="flex items-end gap-3">
            <div className="relative flex-1">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your AI mentor..."
                rows={1}
                className="w-full resize-none border-2 border-border-strong bg-bg-surface-alt px-4 py-3 font-mono text-body-sm text-text-primary placeholder:text-text-tertiary placeholder:italic focus:border-brand-primary focus:shadow-brutal-accent focus:outline-none"
                style={{ minHeight: 44, maxHeight: 120 }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || streaming}
              className={cn(
                "flex h-[44px] w-[44px] shrink-0 items-center justify-center border-2 transition-all",
                inputValue.trim() && !streaming
                  ? "border-brand-primary bg-brand-primary text-text-inverse hover:bg-brand-primary-hover shadow-brutal-accent"
                  : "border-border-strong bg-bg-surface-alt text-text-tertiary",
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* GROUNDING PANEL */}
      {/* ============================================================ */}
      {showGrounding && grounding && (
        <div className="w-72 shrink-0 overflow-y-auto border-l-2 border-border-strong">
          <GroundingPanel grounding={grounding} />
        </div>
      )}
    </div>
  );
}

// ============================================================
// Message Bubble
// ============================================================

function MessageBubble({ message }: { message: MentorMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center border-2",
          isUser
            ? "border-brand-secondary bg-brand-secondary/10 text-brand-secondary"
            : "border-brand-primary bg-brand-primary/10 text-brand-primary",
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "max-w-[70%] border-2 px-4 py-3",
          isUser
            ? "border-brand-secondary bg-brand-secondary/6"
            : "border-border-strong bg-bg-surface-alt",
        )}
      >
        <div className="font-mono text-body-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
          {message.content || (
            <span className="text-text-tertiary italic">...</span>
          )}
        </div>

        {/* Grounding indicator on assistant messages */}
        {!isUser && message.groundingContext && (
          <div className="mt-3 flex items-center gap-1.5 border-t border-border-subtle pt-2">
            <Shield className="h-3 w-3 text-success" />
            <span className="font-mono text-overline font-bold text-success">
              Grounded in your data
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Grounding Panel
// ============================================================

function GroundingPanel({ grounding }: { grounding: GroundingContext }) {
  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="border-b-2 border-border-strong px-4 py-3">
        <span className="brutal-overline text-text-tertiary">Context</span>
        <p className="mt-1 font-mono text-caption text-text-secondary">
          What the AI mentor knows about you
        </p>
      </div>

      {/* Profile Status */}
      <div className="flex flex-col gap-0 border-b-2 border-border-strong">
        <GroundingItem
          icon={CheckCircle}
          label="Developer Profile"
          value={grounding.developerProfile ? "Loaded" : "Missing"}
          ok={grounding.developerProfile}
        />
        <GroundingItem
          icon={CheckCircle}
          label="GitHub Analysis"
          value={grounding.githubAnalysis ? "12 repos analyzed" : "Not connected"}
          ok={grounding.githubAnalysis}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-0 border-b-2 border-border-strong">
        <div className="border-r border-border-subtle px-4 py-3 text-center">
          <span className="font-mono text-heading-md font-black text-brand-primary">
            {grounding.engineeringMaturity}
          </span>
          <p className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary">
            Maturity
          </p>
        </div>
        <div className="px-4 py-3 text-center">
          <span className="font-mono text-heading-md font-black text-brand-secondary">
            {grounding.repoQuality}
          </span>
          <p className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary">
            Quality
          </p>
        </div>
      </div>

      {/* Skills */}
      <div className="border-b-2 border-border-strong px-4 py-3">
        <span className="brutal-overline text-text-tertiary">Top Skills</span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {grounding.skills.map((skill) => (
            <span
              key={skill}
              className="border border-border-strong bg-bg-surface-alt px-2 py-0.5 font-mono text-overline text-text-secondary"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Strengths */}
      <div className="border-b-2 border-border-strong px-4 py-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Target className="h-3 w-3 text-success" />
          <span className="brutal-overline text-success">Strengths</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {grounding.strengths.map((s, i) => (
            <p key={i} className="font-mono text-caption text-text-secondary leading-relaxed">
              • {s}
            </p>
          ))}
        </div>
      </div>

      {/* Weaknesses */}
      <div className="border-b-2 border-border-strong px-4 py-3">
        <div className="flex items-center gap-1.5 mb-2">
          <AlertTriangle className="h-3 w-3 text-warning" />
          <span className="brutal-overline text-warning">Gaps</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {grounding.weaknesses.map((w, i) => (
            <p key={i} className="font-mono text-caption text-text-secondary leading-relaxed">
              • {w}
            </p>
          ))}
        </div>
      </div>

      {/* Career Goals */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-1.5 mb-2">
          <BarChart3 className="h-3 w-3 text-brand-primary" />
          <span className="brutal-overline text-text-tertiary">Career Goals</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {grounding.careerGoals.map((goal) => (
            <span
              key={goal}
              className="border-2 border-brand-primary bg-brand-primary/10 px-2 py-0.5 font-mono text-overline font-bold text-brand-primary"
            >
              {goal}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function GroundingItem({
  icon: Icon,
  label,
  value,
  ok,
}: {
  icon: typeof CheckCircle;
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border-subtle last:border-b-0">
      <Icon
        className={cn("h-4 w-4 shrink-0", ok ? "text-success" : "text-text-tertiary")}
      />
      <div className="flex-1 min-w-0">
        <span className="font-mono text-caption font-bold text-text-primary">
          {label}
        </span>
      </div>
      <span className="font-mono text-overline text-text-tertiary">
        {value}
      </span>
    </div>
  );
}
