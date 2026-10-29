import { useCallback, lazy, Suspense } from 'react';
import { useRouter } from '../router/Router';
import Hero from '../components/Hero/Hero';
import Marquee from '../components/Marquee/Marquee';
import BentoGrid from '../components/BentoGrid/BentoGrid';
import { FloatingShapes } from '../components/Decorative/Decorative';

const FAQ = lazy(() => import('../components/FAQ/FAQ'));

const MARQUEE_ITEMS = [
  'LinkedIn Profile Analyzer',
  'GitHub Profile Analyzer',
  'AI Skill Gap Analyzer',
  'AI Career Analyzer',
  'Free LinkedIn Profile Analysis',
  'GitHub Profile Review Tool',
  'Developer Profile Analysis for Internships',
  'Identify Skill Gaps for Software Jobs',
];

export default function Home() {
  const { navigate, openMascotChat } = useRouter();

  const handleNavigate = useCallback(
    (destination) => {
      if (destination === 'chat') {
        openMascotChat();
      } else if (destination === 'linkedin') {
        navigate('/linkedin');
      } else if (destination === 'github') {
        navigate('/github');
      } else if (destination === 'roadmap' || destination === 'reports') {
        navigate('/roadmap');
      } else if (destination === 'verifier') {
        navigate('/verifier');
      } else if (destination === 'faq') {
        const el = document.getElementById('faq');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
      }
    },
    [navigate, openMascotChat]
  );

  return (
    <main className="home">
      <Hero onNavigate={handleNavigate} />

      <Marquee items={MARQUEE_ITEMS} speed={25} />

      <div className="home__section home__section--bento">
        <FloatingShapes />
        <BentoGrid onNavigate={handleNavigate} />
      </div>

      <Marquee items={[...MARQUEE_ITEMS].reverse()} speed={30} direction="right" />

      {/* Frequently Asked Questions */}
      <Suspense fallback={<div id="faq" className="section-loading-fallback" />}>
        <FAQ />
      </Suspense>

      {/* Footer */}
      <footer className="home__footer" role="contentinfo">
        <div className="home__footer-inner">
          <img src="/logo.svg" alt="SkillPulse AI Logo" className="home__footer-logo" width="72" height="72" loading="lazy" />
          <p>SkillPulse AI — Close your skill gap. Level up your career.</p>

          <nav className="home__footer-nav" aria-label="Footer Quick Navigation">
            <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
            <span aria-hidden="true">·</span>
            <a href="/linkedin" onClick={(e) => { e.preventDefault(); navigate('/linkedin'); }}>LinkedIn Profile Analyzer</a>
            <span aria-hidden="true">·</span>
            <a href="/github" onClick={(e) => { e.preventDefault(); navigate('/github'); }}>GitHub Profile Analyzer</a>
            <span aria-hidden="true">·</span>
            <a href="/roadmap" onClick={(e) => { e.preventDefault(); navigate('/roadmap'); }}>AI Career Roadmap</a>
            <span aria-hidden="true">·</span>
            <a href="/verifier" onClick={(e) => { e.preventDefault(); navigate('/verifier'); }}>AI Skill Verifier</a>
            <span aria-hidden="true">·</span>
            <a href="#mascot" onClick={(e) => { e.preventDefault(); openMascotChat(); }}>PulseBot AI Mascot</a>
            <span aria-hidden="true">·</span>
            <a href="#faq" onClick={(e) => { e.preventDefault(); handleNavigate('faq'); }}>FAQs</a>
          </nav>

          <span className="home__footer-copy">
            Full-Stack Career Intelligence · LinkedIn PDF Parsing, GitHub Code Review, Dynamic Sprints &amp; Skill Verification
          </span>
        </div>
      </footer>
    </main>
  );
}
