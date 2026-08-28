import { createContext, useContext, useMemo, useState } from 'react';

const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  const [linkedinResult, setLinkedinResult] = useState(null);
  const [githubResult, setGithubResult] = useState(null);
  const [roadmap, setRoadmap] = useState(null);

  const value = useMemo(
    () => ({
      linkedinResult,
      githubResult,
      roadmap,
      setLinkedinResult,
      setGithubResult,
      setRoadmap,
    }),
    [linkedinResult, githubResult, roadmap]
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
