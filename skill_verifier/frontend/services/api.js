/**
 * Skill Verifier Frontend API Client
 * Diagnostic coding tests, interactive quizzes, automated grading & anti-AI authenticity scoring.
 */

const API_BASE = typeof window !== 'undefined' && window.__API_BASE__
  ? window.__API_BASE__
  : (import.meta?.env?.VITE_API_BASE_URL || '/api');

export const skillVerifierApi = {
  /**
   * Get supported languages for interactive skill verification.
   * @returns {Promise<string[]>}
   */
  getLanguages: async () => {
    const response = await fetch(`${API_BASE}/skill-verifier/languages`);
    if (!response.ok) {
      return ['Python', 'JavaScript', 'TypeScript', 'C', 'C++', 'Java', 'Go', 'Rust', 'HTML/CSS'];
    }
    const data = await response.json();
    return data.languages || data;
  },

  /**
   * Generate a 10-question diagnostic quiz tailored to language & claimed skills.
   * @param {string} language - Target language.
   * @param {string} [analysisId] - Optional GitHub analysis reference.
   * @returns {Promise<object>} Quiz session payload.
   */
  generateQuiz: async (language, analysisId) => {
    const response = await fetch(`${API_BASE}/skill-verifier/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        analysisId: analysisId || undefined,
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Could not generate quiz. Please try again.');
    }
    return response.json();
  },

  /**
   * Submit completed quiz answers for forensic authenticity evaluation.
   * @param {string} quizId
   * @param {Array<{ questionId: string, selectedIndex: number }>} answers
   * @returns {Promise<object>} Score, radar breakdown & recommendations.
   */
  submitQuiz: async (quizId, answers) => {
    const response = await fetch(`${API_BASE}/skill-verifier/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quizId,
        answers,
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to submit quiz.');
    }
    return response.json();
  },

  /**
   * Retrieve cached quiz evaluation result.
   * @param {string} quizId
   * @returns {Promise<object>}
   */
  getResult: async (quizId) => {
    const response = await fetch(`${API_BASE}/skill-verifier/result/${quizId}`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch assessment result.');
    }
    return response.json();
  },
};

export default skillVerifierApi;

