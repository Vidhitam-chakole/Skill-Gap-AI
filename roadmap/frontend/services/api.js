/**
 * AI Career Roadmap Frontend API Client
 * Synthesizes adaptive milestone plans from LinkedIn and GitHub analyses.
 */

const API_BASE = typeof window !== 'undefined' && window.__API_BASE__
  ? window.__API_BASE__
  : (import.meta?.env?.VITE_API_BASE_URL || '/api');

export const roadmapApi = {
  /**
   * Build a dynamic milestone sprint roadmap.
   * @param {string} [linkedinAnalysisId] - LinkedIn analysis reference ID.
   * @param {string} [githubAnalysisId] - GitHub analysis reference ID.
   * @returns {Promise<object>} Synthesized career roadmap with custom sprints & milestones.
   */
  build: async (linkedinAnalysisId, githubAnalysisId) => {
    const response = await fetch(`${API_BASE}/roadmap/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        linkedinAnalysisId: linkedinAnalysisId || undefined,
        githubAnalysisId: githubAnalysisId || undefined,
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Could not build career roadmap. Please try again.');
    }
    return response.json();
  },

  /**
   * Retrieve a previously generated roadmap by its roadmapId.
   * @param {string} roadmapId
   * @returns {Promise<object>}
   */
  getById: async (roadmapId) => {
    const response = await fetch(`${API_BASE}/roadmap/${roadmapId}`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to retrieve roadmap.');
    }
    return response.json();
  },
};

export default roadmapApi;

