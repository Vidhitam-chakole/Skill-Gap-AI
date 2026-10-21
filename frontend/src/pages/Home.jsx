import { useCallback, useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import Hero from '../components/Hero/Hero';
import Marquee from '../components/Marquee/Marquee';
import BentoGrid from '../components/BentoGrid/BentoGrid';
import LinkedInAnalyzer from '../components/LinkedInAnalyzer/LinkedInAnalyzer';
import GitHubAnalyzer from '../components/GitHubAnalyzer/GitHubAnalyzer';
import SkillVerifier from '../components/SkillVerifier/SkillVerifier';
import Roadmap from '../components/Roadmap/Roadmap';
import ChatBot from '../components/ChatBot/ChatBot';
import { FloatingShapes } from '../components/Decorative/Decorative';

const MARQUEE_ITEMS = [
  'Skill Gap Analysis',
  'LinkedIn PDF & Profile Review',
  'GitHub Code Intelligence',
  'Code & Skill Verifier',
  'Dynamic Adaptive Roadmap',
  'Market Demand Intel',
  'Local AI Career Agent',
];

export default function Home({ onNavigate }) {
  const { linkedinResult, githubResult, verifierTargetLang, isVerifierUnlocked } = useAnalysis();

  const scrollTo = useCallback((id) => {
    onNavigate(id);
  }, [onNavigate]);

  // SkillVerifier unlocks automatically when GitHub OR LinkedIn analysis is done,
  // or if user clicked start verification for any language
  const isVerifierReady = Boolean(linkedinResult || githubResult || isVerifierUnlocked);

  return (
    <main className="home">
      <Hero onNavigate={scrollTo} />

      <Marquee items={MARQUEE_ITEMS} speed={25} />

      <div className="home__section home__section--bento">
        <FloatingShapes />
        <BentoGrid onNavigate={scrollTo} />
      </div>

      <Marquee items={[...MARQUEE_ITEMS].reverse()} speed={30} direction="right" />

      <LinkedInAnalyzer />
      <GitHubAnalyzer />

      {/* AI Code & Skill Verifier: Ready whenever GitHub or LinkedIn is analyzed */}
      {isVerifierReady && <SkillVerifier initialLanguage={verifierTargetLang} />}

      <Roadmap />
      <ChatBot />

      <footer className="home__footer">
        <div className="home__footer-inner">
          <img src="/logo.svg" alt="SkillPulse AI Logo" className="home__footer-logo" />
          <p>SkillPulse AI — Close your skill gap. Level up your career.</p>
          <span className="home__footer-copy">Full-Stack Modular Architecture · LinkedIn, GitHub, Roadmap &amp; Local AI Agent</span>
        </div>
      </footer>
    </main>
  );
}
