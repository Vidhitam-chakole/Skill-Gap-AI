import { createContext, useContext, useMemo, useState, useCallback } from 'react';

const STORAGE_KEY = 'skillgap-onboarding';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

/**
 * Onboarding phases:
 *  - 'intro'     → Skill+ introduction page (first visit)
 *  - 'welcome'   → Profile URL setup page
 *  - 'dashboard' → Main application
 */
const OnboardingContext = createContext(null);

export function OnboardingProvider({ children }) {
  const saved = loadState();

  // Phase: where the user currently is in onboarding
  const [phase, setPhase] = useState(() => {
    if (saved?.completed) return 'dashboard';
    if (saved?.linkedinUrl || saved?.githubUrl) return 'welcome';
    return 'intro';
  });

  // Profile URLs collected during onboarding
  const [linkedinUrl, setLinkedinUrl] = useState(() => saved?.linkedinUrl || '');
  const [githubUrl, setGithubUrl] = useState(() => saved?.githubUrl || '');

  // Whether onboarding has been fully completed
  const [completed, setCompleted] = useState(() => saved?.completed || false);

  const persist = useCallback((next) => {
    saveState(next);
  }, []);

  const goToWelcome = useCallback(() => {
    setPhase('welcome');
    const next = { completed: false, linkedinUrl, githubUrl };
    persist(next);
  }, [linkedinUrl, githubUrl, persist]);

  const completeOnboarding = useCallback((liUrl, ghUrl) => {
    setLinkedinUrl(liUrl);
    setGithubUrl(ghUrl);
    setCompleted(true);
    setPhase('dashboard');
    persist({ completed: true, linkedinUrl: liUrl, githubUrl: ghUrl });
  }, [persist]);

  const resetOnboarding = useCallback(() => {
    setPhase('intro');
    setLinkedinUrl('');
    setGithubUrl('');
    setCompleted(false);
    localStorage.removeItem(STORAGE_KEY);
    // Also clear the splash-seen flag so splash plays again
    localStorage.removeItem('skillgap-splash-seen');
  }, []);

  const value = useMemo(() => ({
    phase,
    linkedinUrl,
    githubUrl,
    completed,
    goToWelcome,
    completeOnboarding,
    resetOnboarding,
    setLinkedinUrl,
    setGithubUrl,
  }), [phase, linkedinUrl, githubUrl, completed, goToWelcome, completeOnboarding, resetOnboarding]);

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used inside OnboardingProvider');
  }
  return context;
}
