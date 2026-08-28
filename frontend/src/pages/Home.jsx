import { useCallback } from 'react';
import Hero from '../components/Hero/Hero';
import Marquee from '../components/Marquee/Marquee';
import BentoGrid from '../components/BentoGrid/BentoGrid';
import LinkedInAnalyzer from '../components/LinkedInAnalyzer/LinkedInAnalyzer';
import GitHubAnalyzer from '../components/GitHubAnalyzer/GitHubAnalyzer';
import Roadmap from '../components/Roadmap/Roadmap';
import ChatBot from '../components/ChatBot/ChatBot';
import { FloatingShapes } from '../components/Decorative/Decorative';

const MARQUEE_ITEMS = [
  'Skill Gap Analysis',
  'LinkedIn Scanner',
  'GitHub Deep Dive',
  'AI Career Roadmap',
  'Market Demand Intel',
  'Level Up Your Career',
];

export default function Home({ onNavigate }) {
  const scrollTo = useCallback((id) => {
    onNavigate(id);
  }, [onNavigate]);

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
      <Roadmap />
      <ChatBot />

      <footer className="home__footer">
        <div className="home__footer-inner">
          <img src="/logo.svg" alt="SkillGap AI" className="home__footer-logo" />
          <p>SkillGap AI — Close your skill gap. Level up your career.</p>
          <span className="home__footer-copy">Full-stack · LinkedIn, GitHub, Roadmap &amp; AI Chat</span>
        </div>
      </footer>
    </main>
  );
}
