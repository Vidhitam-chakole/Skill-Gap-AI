const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

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

export const healthApi = {
  check: () => request('/health'),
};

export const linkedInApi = {
  analyze: (profileUrl) =>
    request('/linkedin/analyze', {
      method: 'POST',
      body: JSON.stringify({ profileUrl }),
    }),
  getResults: (analysisId) => request(`/linkedin/results/${analysisId}`),
};

export const gitHubApi = {
  analyze: (username) =>
    request('/github/analyze', {
      method: 'POST',
      body: JSON.stringify({ username }),
    }),
  getResults: (analysisId) => request(`/github/results/${analysisId}`),
};

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

export const roadmapApi = {
  build: (linkedinAnalysisId, githubAnalysisId) =>
    request('/roadmap/build', {
      method: 'POST',
      body: JSON.stringify({ linkedinAnalysisId, githubAnalysisId }),
    }),
};
