import { useState, useCallback } from 'react';
import IntroAnimation from './components/IntroAnimation/IntroAnimation';
import IntroPage from './pages/IntroPage';
import WelcomePage from './pages/WelcomePage';
import DashboardPage from './pages/DashboardPage';
import { AnalysisProvider } from './context/AnalysisContext';
import { OnboardingProvider, useOnboarding } from './context/OnboardingContext';
import { useSplashSeen, useParallax } from './hooks/useAnimations';
import './App.css';

function AppShell() {
  const { hasSeen: splashSeen, markSeen: markSplashSeen } = useSplashSeen();
  const [showSplash, setShowSplash] = useState(!splashSeen);
  const { phase, resetOnboarding } = useOnboarding();

  useParallax(0.04);

  const handleSplashComplete = useCallback(() => {
    markSplashSeen();
    setShowSplash(false);
  }, [markSplashSeen]);

  return (
    <>
      {showSplash && <IntroAnimation onComplete={handleSplashComplete} />}

      <div className={`app ${showSplash ? 'app--hidden' : ''}`}>
        {phase === 'intro' && <IntroPage />}
        {phase === 'welcome' && <WelcomePage />}
        {phase === 'dashboard' && <DashboardPage onResetOnboarding={resetOnboarding} />}
      </div>
    </>
  );
}

export default function App() {
  return (
    <AnalysisProvider>
      <OnboardingProvider>
        <AppShell />
      </OnboardingProvider>
    </AnalysisProvider>
  );
}
