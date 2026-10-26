const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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
  analyzePdf: async (file, name = '', profileUrl = '') => {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    if (profileUrl) formData.append('profileUrl', profileUrl);

    const response = await fetch(`${API_BASE_URL}/linkedin/analyze-pdf`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(formatError(error, response.status));
    }

    return response.json();
  },
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
  searchUsers: async (query, signal) => {
    if (!query || !query.trim()) return [];
    const clean = query.trim().replace(/^@/, '');
    if (!clean) return [];

    // Attempt 1: Backend proxy (enriched with display names, token rate limit, server cache)
    try {
      const response = await fetch(`${API_BASE_URL}/github/search-users?q=${encodeURIComponent(clean)}`, {
        signal,
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.users || [];
      }
      if (response.status === 429) {
        throw new Error('GitHub API rate limit reached. Please wait a moment.');
      }
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      if (err.message && err.message.includes('rate limit')) throw err;
      // Fallback to direct GitHub API if backend is unreachable
    }

    // Attempt 2: Direct Official GitHub API fallback
    const directRes = await fetch(
      `https://api.github.com/search/users?q=${encodeURIComponent(clean)}+in:login&type=Users&per_page=6`,
      {
        signal,
        headers: { Accept: 'application/vnd.github.v3+json' },
      }
    );

    if (!directRes.ok) {
      if (directRes.status === 403) {
        throw new Error('GitHub API rate limit reached. Please wait a moment.');
      }
      throw new Error(`GitHub search returned ${directRes.status}`);
    }

    const directData = await directRes.json();
    return (directData.items || []).map((item) => ({
      username: item.login,
      name: null,
      avatar_url: item.avatar_url,
      bio: null,
      html_url: item.html_url,
    }));
  },
};


export const chatApi = {
  getConfig: () => request('/chat/config'),
  sendMessage: (message, conversationId = null, extra = {}) =>
    request('/chat/message', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversationId,
        linkedinAnalysisId: extra.linkedinAnalysisId || null,
        githubAnalysisId: extra.githubAnalysisId || null,
        apiKey: extra.apiKey || null,
        mode: extra.mode || null,
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
  getRoadmap: (roadmapId) => request(`/roadmap/${roadmapId}`),
};

export const skillVerifierApi = {
  getLanguages: () => request('/skill-verifier/languages'),
  generate: (language, githubAnalysisId = null) =>
    request('/skill-verifier/generate', {
      method: 'POST',
      body: JSON.stringify({ language, githubAnalysisId }),
    }),
  submit: ({ quizId, language, answers, timeSpentSeconds = 0 }) =>
    request('/skill-verifier/submit', {
      method: 'POST',
      body: JSON.stringify({ quizId, language, answers, timeSpentSeconds }),
    }),
  getResult: (quizId) => request(`/skill-verifier/result/${quizId}`),
};

