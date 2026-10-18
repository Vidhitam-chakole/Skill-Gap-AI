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
  'Anti-AI Code Verifier (10Q)',
  'Dynamic Adaptive Roadmap',
  'Market Demand Intel',
  'Local AI Career Agent',
];

export default function Home({ onNavigate }) {
  const { linkedinResult, githubResult } = useAnalysis();
  const [unlockedWithGithubOnly, setUnlockedWithGithubOnly] = useState(false);

  const scrollTo = useCallback((id) => {
    onNavigate(id);
  }, [onNavigate]);

  // SkillVerifier unlocks automatically when both LinkedIn and GitHub analyses are done,
  // or if user explicitly unlocks it after GitHub analysis
  const isVerifierReady = Boolean((linkedinResult && githubResult) || (githubResult && unlockedWithGithubOnly));

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

      {/* If GitHub is analyzed but LinkedIn is still pending, offer instant unlock */}
      {githubResult && !linkedinResult && !isVerifierReady && (
        <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
          <div className="brutal-card" style={{ padding: '1.75rem', background: '#fffdf5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', border: '3px solid var(--black, #0a0a0a)' }}>
            <div>
              <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem', textTransform: 'uppercase' }}>
                ⚡ GitHub Codebase Analyzed (@{githubResult.username})
              </h3>
              <p style={{ margin: 0, color: '#334155', fontSize: '0.95rem' }}>
                Complete LinkedIn review above to combine your career data, or start the AI Code Verifier test now with your GitHub stack.
              </p>
            </div>
            <button
              type="button"
              className="brutal-btn brutal-btn--accent"
              onClick={() => setUnlockedWithGithubOnly(true)}
            >
              Unlock Code Verifier Now &rarr;
            </button>
          </div>
        </div>
      )}

      {/* AI Code & Skill Verifier: Appears after LinkedIn and GitHub analyzers are done */}
      {isVerifierReady && <SkillVerifier />}

      <Roadmap />
      <ChatBot />

      <footer className="home__footer">
        <div className="home__footer-inner">
          <img src="/logo.svg" alt="SkillGap AI" className="home__footer-logo" />
          <p>SkillGap AI — Close your skill gap. Level up your career.</p>
          <span className="home__footer-copy">Full-Stack Modular Architecture · LinkedIn, GitHub, Roadmap &amp; Local AI Agent</span>
        </div>
      </footer>
    </main>
  );
}
