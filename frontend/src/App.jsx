import { useState, useCallback } from 'react';
import IntroAnimation from './components/IntroAnimation/IntroAnimation';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home';
import { AnalysisProvider } from './context/AnalysisContext';
import { useScrollReveal, useParallax, useIntroSeen, useScrollSpy } from './hooks/useAnimations';
import './App.css';

const SECTIONS = ['home', 'linkedin', 'github', 'roadmap', 'chat'];

function AppShell() {
  const { hasSeen, markSeen } = useIntroSeen();
  const [showIntro, setShowIntro] = useState(!hasSeen);
  const [activeSection, setActiveSection] = useState('home');
  const scrollRef = useScrollReveal();

  useParallax(0.04);
  useScrollSpy(SECTIONS, setActiveSection);

  const handleIntroComplete = useCallback(() => {
    markSeen();
    setShowIntro(false);
  }, [markSeen]);

  const handleNavigate = useCallback((sectionId) => {
    setActiveSection(sectionId);
    if (sectionId !== 'home') {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <>
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}

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
