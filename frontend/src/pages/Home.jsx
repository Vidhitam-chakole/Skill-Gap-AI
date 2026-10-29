import { useCallback, lazy, Suspense } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import Hero from '../components/Hero/Hero';
import Marquee from '../components/Marquee/Marquee';
import BentoGrid from '../components/BentoGrid/BentoGrid';
import { FloatingShapes } from '../components/Decorative/Decorative';

const LinkedInAnalyzer = lazy(() => import('../components/LinkedInAnalyzer/LinkedInAnalyzer'));
const GitHubAnalyzer = lazy(() => import('../components/GitHubAnalyzer/GitHubAnalyzer'));
const SkillVerifier = lazy(() => import('../components/SkillVerifier/SkillVerifier'));
const Roadmap = lazy(() => import('../components/Roadmap/Roadmap'));
const ChatBot = lazy(() => import('../components/ChatBot/ChatBot'));
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

      <Suspense fallback={<div id="linkedin" className="section-loading-fallback" />}>
        <LinkedInAnalyzer />
      </Suspense>

      <Suspense fallback={<div id="github" className="section-loading-fallback" />}>
        <GitHubAnalyzer />
      </Suspense>

      {/* AI Code & Skill Verifier: Ready whenever GitHub or LinkedIn is analyzed */}
      {isVerifierReady && (
        <Suspense fallback={<div id="verifier" className="section-loading-fallback" />}>
          <SkillVerifier initialLanguage={verifierTargetLang} />
        </Suspense>
      )}

      <Suspense fallback={<div id="roadmap" className="section-loading-fallback" />}>
        <Roadmap />
      </Suspense>

      <Suspense fallback={<div id="chat" className="section-loading-fallback" />}>
        <ChatBot />
      </Suspense>

      <Suspense fallback={<div id="faq" className="section-loading-fallback" />}>
        <FAQ />
      </Suspense>

      <footer className="home__footer" role="contentinfo">
        <div className="home__footer-inner">
          <img src="/logo.svg" alt="SkillPulse AI Logo" className="home__footer-logo" width="72" height="72" loading="lazy" />
          <p>SkillPulse AI — Close your skill gap. Level up your career.</p>

          <nav className="home__footer-nav" aria-label="Footer Quick Navigation">
            <a href="#linkedin" onClick={(e) => { e.preventDefault(); scrollTo('linkedin'); }}>LinkedIn Profile Analyzer</a>
            <span aria-hidden="true">·</span>
            <a href="#github" onClick={(e) => { e.preventDefault(); scrollTo('github'); }}>GitHub Profile Analyzer</a>
            <span aria-hidden="true">·</span>
            <a href="#verifier" onClick={(e) => { e.preventDefault(); scrollTo('verifier'); }}>AI Skill Verifier</a>
            <span aria-hidden="true">·</span>
            <a href="#roadmap" onClick={(e) => { e.preventDefault(); scrollTo('roadmap'); }}>AI Career Roadmap</a>
            <span aria-hidden="true">·</span>
            <a href="#chat" onClick={(e) => { e.preventDefault(); scrollTo('chat'); }}>AI Career Coach</a>
            <span aria-hidden="true">·</span>
            <a href="#faq" onClick={(e) => { e.preventDefault(); scrollTo('faq'); }}>FAQs</a>
          </nav>

          <span className="home__footer-copy">
            Full-Stack Career Intelligence · LinkedIn PDF Parsing, GitHub Code Review, Dynamic Sprints &amp; Skill Verification
          </span>
        </div>
      </footer>
    </main>
  );
}
