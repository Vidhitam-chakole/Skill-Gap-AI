/**
 * AI Career Mentor Service
 * Mock data for the AI Career Mentor chat interface.
 */

import type {
  MentorConversation,
  MentorMessage,
  GroundingContext,
} from "@/shared/types";
import { apiClient, endpoints } from "@/shared/api/client";
import { featureFlags } from "@/shared/config/env";

// ============================================================
// Mock Grounding Context
// ============================================================

const MOCK_GROUNDING: GroundingContext = {
  developerProfile: true,
  githubAnalysis: true,
  skills: ["TypeScript", "React", "Node.js", "Rust", "Docker"],
  engineeringMaturity: 72,
  repoQuality: 75,
  strengths: [
    "Strong TypeScript expertise across 10 repositories",
    "Full-stack capability (React frontend + Node.js backend)",
    "Active open-source contributor with 1.8K+ total stars",
  ],
  weaknesses: [
    "Testing coverage below 30% on critical backend services",
    "No CI/CD pipeline detected — manual deployments",
    "Limited DevOps/container orchestration experience",
  ],
  careerGoals: ["Senior Engineer", "Staff Engineer"],
};

// ============================================================
// Mock Conversations
// ============================================================

const MOCK_CONVERSATIONS: MentorConversation[] = [
  {
    id: "conv-1",
    title: "Career path to Staff Engineer",
    createdAt: "2026-08-28T10:00:00Z",
    updatedAt: "2026-08-29T14:30:00Z",
    messageCount: 6,
  },
  {
    id: "conv-2",
    title: "Improving testing practices",
    createdAt: "2026-08-25T08:15:00Z",
    updatedAt: "2026-08-25T09:00:00Z",
    messageCount: 4,
  },
  {
    id: "conv-3",
    title: "Rust learning strategy",
    createdAt: "2026-08-20T16:00:00Z",
    updatedAt: "2026-08-20T16:45:00Z",
    messageCount: 3,
  },
];

// ============================================================
// Mock Messages for conversation 1
// ============================================================

const MOCK_MESSAGES: Record<string, MentorMessage[]> = {
  "conv-1": [
    {
      id: "msg-1",
      role: "user",
      content:
        "Based on my analysis, what should I focus on to reach Staff Engineer?",
      createdAt: "2026-08-28T10:00:00Z",
    },
    {
      id: "msg-2",
      role: "assistant",
      content: `Great question. Based on your engineering profile, here are the key areas to focus on:

**Your Strengths (build on these):**
- Strong TypeScript expertise across 10 repositories with 95% confidence
- Full-stack capability — you can own features end-to-end
- Active open-source presence with meaningful contribution patterns

**Critical Gaps to Close:**
1. **Testing & Quality** — Your backend services have <30% test coverage. Staff engineers are expected to champion quality practices. Start by writing unit tests for your auth and repository services.

2. **CI/CD & DevOps** — No automated pipeline detected. This is a major gap for a Staff-level role. Set up GitHub Actions with lint → test → build → deploy.

3. **Architecture Documentation** — Your code shows good patterns (Feature-Sliced Design, middleware layers) but there's no documentation explaining these decisions. Staff engineers write RFCs and ADRs.

**Recommended Next Steps:**
- Week 1-2: Master testing with Vitest (you already use it, just expand coverage)
- Week 3: Set up GitHub Actions CI/CD pipeline
- Week 4-5: Write architecture decision records for your key projects

Your trajectory is strong — you have the technical depth. The gaps are in the "force multiplier" skills that define Staff-level impact.`,
      createdAt: "2026-08-28T10:01:00Z",
      groundingContext: MOCK_GROUNDING,
    },
    {
      id: "msg-3",
      role: "user",
      content:
        "How does my Rust experience factor into a Staff Engineer trajectory?",
      createdAt: "2026-08-28T14:00:00Z",
    },
    {
      id: "msg-4",
      role: "assistant",
      content: `Your Rust experience is a differentiator — here's why:

**The Signal:**
You have a high-performance HTTP server built with Tokio/Axum showing 62% confidence across 3 repositories. This demonstrates:

- Systems-level thinking (memory management, concurrency)
- Willingness to learn non-mainstream languages
- Performance optimization awareness

**For Staff Engineer:**
Rust expertise signals that you understand **trade-offs at the language level** — not just "which framework should I use" but "what does the compiler tell me about my architecture." Staff engineers need this depth.

**How to leverage it:**
1. Write a blog post about your Axum server architecture — this builds external signal
2. Contribute the performance-critical components of Skill+ in Rust — shows you choose the right tool
3. Use Rust knowledge to inform TypeScript architecture decisions (e.g., you'll naturally think about memory patterns, error handling, type safety)

**Caveat:** Rust alone won't get you to Staff. Pair it with the testing/CI/CD gaps and you'll have a compelling story: "I build performant systems AND ship them reliably."`,
      createdAt: "2026-08-28T14:01:00Z",
      groundingContext: MOCK_GROUNDING,
    },
  ],
  "conv-2": [
    {
      id: "msg-5",
      role: "user",
      content:
        "What's the fastest way to improve my testing coverage?",
      createdAt: "2026-08-25T08:15:00Z",
    },
    {
      id: "msg-6",
      role: "assistant",
      content: `Based on your codebase analysis, here's a pragmatic approach:

**Current State:**
- 3 test files across 7 service modules in skill-plus-api
- Vitest configured but underused
- No E2E tests despite Playwright being installed

**Fastest Path to 60% Coverage:**

1. **Start with service layer** (Week 1) — Your auth and repository services are the most critical. Write unit tests for each public function. Target: 15 tests per service.

2. **Add integration tests** (Week 2) — Test API routes with supertest. You already have Express set up, so just add request/response assertions.

3. **Write one E2E test** (Week 3) — Cover the signup → login → dashboard flow in Playwright. This single test will catch the most critical regressions.

**Key insight:** Don't aim for 100% coverage. Aim for "I can refactor with confidence." Focus tests on:
- Authentication logic (security-critical)
- Data transformation (bug-prone)
- API contracts (integration-critical)

Your testing gap is your #1 career blocker right now — it's the easiest win for Staff-level signal.`,
      createdAt: "2026-08-25T08:16:00Z",
      groundingContext: MOCK_GROUNDING,
    },
  ],
};

// ============================================================
// Mock Streaming Response
// ============================================================

export function streamMentorResponse(
  _message: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
): () => void {
  const fullResponse = `Based on your engineering profile, here's my analysis:

Your TypeScript confidence is at 95% across 10 repositories — that's exceptional depth. Combined with React (92%) and Node.js (85%), you have a strong full-stack foundation.

**Key recommendation:** Your testing gap (45% confidence in testing tools) is the most impactful area to address. With your existing Vitest setup, expanding to 60%+ coverage on your backend services would demonstrate engineering maturity.

Would you like me to create a specific learning plan for this?`;

  let index = 0;
  const interval = setInterval(() => {
    if (index < fullResponse.length) {
      const chunkSize = Math.floor(Math.random() * 4) + 1;
      onChunk(fullResponse.slice(index, index + chunkSize));
      index += chunkSize;
    } else {
      clearInterval(interval);
      onDone();
    }
  }, 20);

  return () => clearInterval(interval);
}

// ============================================================
// Public API
// ============================================================

/**
 * Fetch all conversations.
 */
export async function fetchConversations(): Promise<MentorConversation[]> {
  if (featureFlags.aiMentor) {
    return apiClient.get<MentorConversation[]>(endpoints.mentor.conversations);
  }
  await delay(200);
  return MOCK_CONVERSATIONS;
}

/**
 * Fetch messages for a conversation.
 */
export async function fetchMessages(
  conversationId: string,
): Promise<MentorMessage[]> {
  if (featureFlags.aiMentor) {
    return apiClient.get<MentorMessage[]>(endpoints.mentor.messages(conversationId));
  }
  await delay(300);
  return MOCK_MESSAGES[conversationId] ?? [];
}

/**
 * Fetch grounding context.
 */
export async function fetchGroundingContext(): Promise<GroundingContext> {
  if (featureFlags.aiMentor) {
    return apiClient.get<GroundingContext>(endpoints.mentor.grounding);
  }
  await delay(200);
  return MOCK_GROUNDING;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
