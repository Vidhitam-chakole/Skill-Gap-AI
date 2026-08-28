import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { gitHubApi, USE_MOCK } from '../services/api';
import { mockGitHubResults } from '../data/mockData';

const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  const [linkedinResult, setLinkedinResult] = useState(null);
  const [githubResult, setGithubResult] = useState(null);
  const [roadmap, setRoadmap] = useState(null);

  /* ─── Analysis state ─── */
  const [githubUsername, setGithubUsername] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  /**
   * Trigger GitHub analysis for a given username.
   * In mock mode, uses mock data. In API mode, calls the backend.
   * Stores the result in githubResult for all dashboard sections to consume.
   */
  const analyzeGithub = useCallback(async (username) => {
    if (!username?.trim()) return;
    const clean = username.trim().replace(/^@/, '').replace(/github\.com\//, '').replace(/\/$/, '').split('/')[0];

    setGithubUsername(clean);
    setAnalysisLoading(true);
    setAnalysisError(null);
    setGithubResult(null);
    setRoadmap(null);

    try {
      let data;
      if (USE_MOCK) {
        // Simulate network delay in mock mode
        await new Promise((r) => setTimeout(r, 800));
        data = { ...mockGitHubResults, username: clean, analysisId: 'gh-mock-' + Date.now() };
      } else {
        data = await gitHubApi.analyze(clean);
      }
      setGithubResult(data);
      return data;
    } catch (err) {
      const message = err.message || 'Analysis failed. Please try again.';
      setAnalysisError(message);
      throw err;
    } finally {
      setAnalysisLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      linkedinResult,
      githubResult,
      roadmap,
      setLinkedinResult,
      setGithubResult,
      setRoadmap,
      githubUsername,
      setGithubUsername,
      analysisLoading,
      analysisError,
      analyzeGithub,
    }),
    [
      linkedinResult, githubResult, roadmap,
      githubUsername, analysisLoading, analysisError,
      analyzeGithub,
    ]
  );

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used inside AnalysisProvider');
  }
  return context;
}
