import { createContext, useContext, useMemo, useState } from 'react';

const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  const [linkedinResult, setLinkedinResult] = useState(null);
  const [githubResult, setGithubResult] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [verifierTargetLang, setVerifierTargetLang] = useState(null);
  const [isVerifierUnlocked, setIsVerifierUnlocked] = useState(false);

  const startVerification = (langName) => {
    setIsVerifierUnlocked(true);
    setVerifierTargetLang(langName);
    setTimeout(() => {
      const el = document.getElementById('verifier');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 80);
  };

  const value = useMemo(
    () => ({
      linkedinResult,
      githubResult,
      roadmap,
      verifierTargetLang,
      isVerifierUnlocked,
      setLinkedinResult,
      setGithubResult,
      setRoadmap,
      setVerifierTargetLang,
      setIsVerifierUnlocked,
      startVerification,
    }),
    [linkedinResult, githubResult, roadmap, verifierTargetLang, isVerifierUnlocked]
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
