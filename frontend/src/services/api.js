/**
 * Skill+ API Service
 *
 * In dev mode, Vite proxies /api → http://localhost:8000 (see vite.config.js).
 * All requests use relative paths so the proxy handles routing.
 *
 * Set VITE_API_BASE_URL only if the backend runs on a different origin.
 * Set VITE_USE_MOCK=true to use client-side mock data (default).
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

function formatError(payload, status) {
  if (typeof payload?.message === 'string' && payload.message) return payload.message;
  if (typeof payload?.detail === 'string' && payload.detail) return payload.detail;
  return `Request failed: ${status}`;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(formatError(error, response.status));
  }

  return response.json();
}

/* ─── Health ─── */

export const healthApi = {
  check: () => request('/health'),
};

/* ─── LinkedIn ─── */

export const linkedInApi = {
  analyze: (profileUrl) =>
    request('/linkedin/analyze', {
      method: 'POST',
      body: JSON.stringify({ profileUrl }),
    }),
  getResults: (analysisId) => request(`/linkedin/results/${analysisId}`),
};

/* ─── GitHub ─── */

export const gitHubApi = {
  analyze: (username) =>
    request('/github/analyze', {
      method: 'POST',
      body: JSON.stringify({ username }),
    }),
  getResults: (analysisId) => request(`/github/results/${analysisId}`),
};

/* ─── Chat ─── */

export const chatApi = {
  sendMessage: (message, conversationId = null, extra = {}) =>
    request('/chat/message', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversationId,
        linkedinAnalysisId: extra.linkedinAnalysisId || null,
        githubAnalysisId: extra.githubAnalysisId || null,
      }),
    }),
  getHistory: (conversationId) => request(`/chat/history/${conversationId}`),
};

/* ─── Roadmap ─── */

export const roadmapApi = {
  build: (linkedinAnalysisId, githubAnalysisId) =>
    request('/roadmap/build', {
      method: 'POST',
      body: JSON.stringify({ linkedinAnalysisId, githubAnalysisId }),
    }),
};
