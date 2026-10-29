import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home';
import LinkedInPage from './pages/LinkedInPage';
import GitHubPage from './pages/GitHubPage';
import RoadmapPage from './pages/RoadmapPage';
import VerifierPage from './pages/VerifierPage';
import MascotCoach from './components/Mascot/MascotCoach';
import { AnalysisProvider } from './context/AnalysisContext';
import { RouterProvider, useRouter } from './router/Router';
import { useScrollReveal, useParallax, useIntroSeen } from './hooks/useAnimations';
import './App.css';

const IntroAnimation = lazy(() => import('./components/IntroAnimation/IntroAnimation'));

function AppShell() {
  const { hasSeen, markSeen } = useIntroSeen();
  const [showIntro, setShowIntro] = useState(!hasSeen);
  const { route, navigate, openMascotChat } = useRouter();
  const scrollRef = useScrollReveal();

  useParallax(0.04);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Listen to navigation events from context (e.g. startVerification)
  useEffect(() => {
    const handleAppNav = (e) => {
      const destination = e.detail?.destination;
      if (destination === 'verifier') {
        navigate('/verifier');
      } else if (destination === 'linkedin') {
        navigate('/linkedin');
      } else if (destination === 'github') {
        navigate('/github');
      } else if (destination === 'roadmap') {
        navigate('/roadmap');
      }
    };

    window.addEventListener('app-navigate', handleAppNav);
    return () => window.removeEventListener('app-navigate', handleAppNav);
  }, [navigate]);

  const handleIntroComplete = useCallback(() => {
    markSeen();
    setShowIntro(false);
  }, [markSeen]);

  const handleNavigate = useCallback(
    (target) => {
      if (target === 'chat') {
        openMascotChat();
        return;
      }

      if (target === 'faq') {
        if (route === 'home') {
          const el = document.getElementById('faq');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else {
          navigate('/');
          setTimeout(() => {
            const el = document.getElementById('faq');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }
        return;
      }

      if (target === 'home') {
        navigate('/');
      } else if (target === 'linkedin') {
        navigate('/linkedin');
      } else if (target === 'github') {
        navigate('/github');
      } else if (target === 'roadmap') {
        navigate('/roadmap');
      } else if (target === 'verifier') {
        navigate('/verifier');
      } else {
        navigate(target);
      }
    },
    [route, navigate, openMascotChat]
  );

  return (
    <>
      {showIntro && (
        <Suspense fallback={null}>
          <IntroAnimation onComplete={handleIntroComplete} />
        </Suspense>
      )}

      <div className={`app ${showIntro ? 'app--hidden' : ''}`} ref={scrollRef}>
        <Navbar activeSection={route} onNavigate={handleNavigate} />

        <div className="app__main">
          {route === 'linkedin' && <LinkedInPage />}
          {route === 'github' && <GitHubPage />}
          {route === 'roadmap' && <RoadmapPage />}
          {route === 'verifier' && <VerifierPage />}
          {route === 'home' && <Home />}
        </div>

        {/* PulseBot AI Roving Mascot & Career Companion — Active on Every Page */}
        <MascotCoach />
      </div>
    </>
  );
}

export default function App() {
  return (
    <AnalysisProvider>
      <RouterProvider>
        <AppShell />
      </RouterProvider>
    </AnalysisProvider>
  );
}
