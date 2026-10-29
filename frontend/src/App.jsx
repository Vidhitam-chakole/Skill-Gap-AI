import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home';
import { AnalysisProvider } from './context/AnalysisContext';
import { useScrollReveal, useParallax, useIntroSeen, useScrollSpy } from './hooks/useAnimations';
import './App.css';

const IntroAnimation = lazy(() => import('./components/IntroAnimation/IntroAnimation'));

const SECTIONS = ['home', 'linkedin', 'github', 'verifier', 'roadmap', 'chat', 'faq'];

function AppShell() {
  const { hasSeen, markSeen } = useIntroSeen();
  const [showIntro, setShowIntro] = useState(!hasSeen);
  const [activeSection, setActiveSection] = useState('home');
  const scrollRef = useScrollReveal();

  useParallax(0.04);
  useScrollSpy(SECTIONS, setActiveSection);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    window.scrollTo(0, 0);
  }, []);

  const handleIntroComplete = useCallback(() => {
    markSeen();
    setShowIntro(false);
  }, [markSeen]);

  const handleNavigate = useCallback((sectionId) => {
    setActiveSection(sectionId);
    if (sectionId !== 'home') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (sectionId === 'verifier') {
        document.getElementById('linkedin')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <>
      {showIntro && (
        <Suspense fallback={null}>
          <IntroAnimation onComplete={handleIntroComplete} />
        </Suspense>
      )}

      <div className={`app ${showIntro ? 'app--hidden' : ''}`} ref={scrollRef}>
        <Navbar activeSection={activeSection} onNavigate={handleNavigate} />
        <div className="app__main">
          <Home onNavigate={handleNavigate} />
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AnalysisProvider>
      <AppShell />
    </AnalysisProvider>
  );
}
