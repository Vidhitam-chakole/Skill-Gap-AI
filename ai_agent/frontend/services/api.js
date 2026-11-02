/**
 * AI Career Agent Frontend API Client
 * Local offline rule engine + contextual career assistant chat streaming.
 */

const API_BASE = typeof window !== 'undefined' && window.__API_BASE__
  ? window.__API_BASE__
  : (import.meta?.env?.VITE_API_BASE_URL || '/api');

export const chatApi = {
  /**
   * Send a prompt message with loaded LinkedIn and GitHub profile context.
   * @param {object} payload - { message, conversationId, linkedinAnalysisId, githubAnalysisId }
   * @returns {Promise<object>} Agent response text and suggested followup chips.
   */
  sendMessage: async ({ message, conversationId, linkedinAnalysisId, githubAnalysisId }) => {
    const response = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        conversationId: conversationId || undefined,
        linkedinAnalysisId: linkedinAnalysisId || undefined,
        githubAnalysisId: githubAnalysisId || undefined,
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'AI assistant failed to respond. Please try again.');
    }
    return response.json();
  },

  /**
   * Retrieve conversation history for a conversation session.
   * @param {string} conversationId
   * @returns {Promise<Array<{ role: string, content: string }>>}
   */
  getHistory: async (conversationId) => {
    const response = await fetch(`${API_BASE}/chat/history/${conversationId}`);
    if (!response.ok) return [];
    return response.json();
  },
};

export default chatApi;

