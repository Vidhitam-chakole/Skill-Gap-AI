/**
 * GitHub Analyzer Frontend API Client
 * Handles username analysis, live REST querying, and autocomplete hints.
 */

const API_BASE = typeof window !== 'undefined' && window.__API_BASE__
  ? window.__API_BASE__
  : (import.meta?.env?.VITE_API_BASE_URL || '/api');

export const gitHubApi = {
  /**
   * Analyze a public GitHub profile by username or URL.
   * @param {string} username - GitHub handle or link.
   * @returns {Promise<object>} Analysis payload with byte-weighted languages & gap signals.
   */
  analyze: async (username) => {
    const response = await fetch(`${API_BASE}/github/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'GitHub profile analysis failed. Verify the username.');
    }
    return response.json();
  },

  /**
   * Fetch an existing analysis by analysisId.
   * @param {string} analysisId
   * @returns {Promise<object>}
   */
  getResult: async (analysisId) => {
    const response = await fetch(`${API_BASE}/github/results/${analysisId}`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to retrieve GitHub analysis result.');
    }
    return response.json();
  },

  /**
   * Get search / autocomplete hints for GitHub usernames.
   * @param {string} query
   * @returns {Promise<object>}
   */
  getProfileHints: async (query) => {
    const response = await fetch(`${API_BASE}/github/hints?q=${encodeURIComponent(query)}`);
    if (!response.ok) return { hints: [] };
    return response.json();
  },
};

export default gitHubApi;

