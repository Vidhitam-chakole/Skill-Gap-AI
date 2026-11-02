/**
 * LinkedIn Analyzer Frontend API Client
 * Handles PDF uploads, profile parsing, and retrieval of cached LinkedIn analysis.
 */

const API_BASE = typeof window !== 'undefined' && window.__API_BASE__
  ? window.__API_BASE__
  : (import.meta?.env?.VITE_API_BASE_URL || '/api');

export const linkedInApi = {
  /**
   * Upload an official LinkedIn PDF dossier for automated parsing.
   * @param {File} pdfFile - The LinkedIn export PDF.
   * @param {string} [name] - Optional user context override.
   * @param {string} [profileUrl] - Optional profile URL reference.
   * @returns {Promise<object>} Analysis results payload.
   */
  analyzePdf: async (pdfFile, name, profileUrl) => {
    const formData = new FormData();
    formData.append('file', pdfFile);
    if (name) formData.append('name', name);
    if (profileUrl) formData.append('profileUrl', profileUrl);

    const response = await fetch(`${API_BASE}/linkedin/analyze-pdf`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'LinkedIn PDF analysis failed. Please verify the file.');
    }
    return response.json();
  },

  /**
   * Analyze a public LinkedIn profile by URL.
   * @param {string} profileUrl - The profile URL.
   * @returns {Promise<object>}
   */
  analyzeProfile: async (profileUrl) => {
    const response = await fetch(`${API_BASE}/linkedin/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileUrl }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'LinkedIn profile analysis failed.');
    }
    return response.json();
  },

  /**
   * Fetch an existing analysis by analysisId.
   * @param {string} analysisId
   * @returns {Promise<object>}
   */
  getResult: async (analysisId) => {
    const response = await fetch(`${API_BASE}/linkedin/results/${analysisId}`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to retrieve LinkedIn analysis result.');
    }
    return response.json();
  },
};

export default linkedInApi;

