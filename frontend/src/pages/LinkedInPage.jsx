import { lazy, Suspense } from 'react';
import { useRouter } from '../router/Router';
import './Pages.css';

const LinkedInAnalyzer = lazy(() => import('../components/LinkedInAnalyzer/LinkedInAnalyzer'));

export default function LinkedInPage() {
  const { navigate, openMascotChat } = useRouter();

  return (
    <div className="page-wrapper">
      {/* Page Hero Header */}
      <header className="page-hero">
        <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.45rem', justifyContent: 'center', marginBottom: '0.85rem' }}>
          <span className="hero__badge hero__badge--free">⚡ 100% Free</span>
          <span className="hero__badge hero__badge--nosignin">🔒 No Sign-In Required</span>
          <span className="hero__badge hero__badge--instant">🚀 Instant PDF Parsing</span>
        </div>
        <h1 className="page-hero__title">
          Free LinkedIn Profile <span className="page-hero__title-accent">Analyzer</span>
        </h1>
        <p className="page-hero__desc">
          Upload your official LinkedIn PDF dossier to parse career history, extract verified skills, benchmark against tech industry hiring standards, and detect critical software engineering gaps — 100% free with no account needed.
        </p>
      </header>

      {/* Main LinkedIn Analyzer Component */}
      <Suspense fallback={<div className="section-loading-fallback" />}>
        <LinkedInAnalyzer />
      </Suspense>

      {/* Cross-linking Next Steps Banners */}
      <section className="page-next-steps" aria-label="Recommended Next Career Steps">
        <h2 className="page-next-steps__title">
          <span>→</span> Next Steps in Your Career Analysis
        </h2>
        <div className="page-next-steps__grid">
          <div className="page-next-card" onClick={() => navigate('/github')}>
            <div>
              <span className="page-next-card__tag">Step 2: Code Verification</span>
              <h3 className="page-next-card__title">Analyze Your GitHub Repositories</h3>
              <p className="page-next-card__desc">
                Cross-reference your claimed LinkedIn skills with actual code commits, test suites, and language distributions across your public GitHub profile.
              </p>
            </div>
            <div className="page-next-card__cta">
              Analyze GitHub Profile →
            </div>
          </div>

          <div className="page-next-card" onClick={() => navigate('/roadmap')}>
            <div>
              <span className="page-next-card__tag" style={{ background: 'var(--yellow)' }}>Step 3: Action Plan</span>
              <h3 className="page-next-card__title">Generate Dynamic Career Roadmap</h3>
              <p className="page-next-card__desc">
                Transform identified LinkedIn gaps into milestone-driven engineering sprints with curated system design topics, project architectures, and learning goals.
              </p>
            </div>
            <div className="page-next-card__cta">
              View Adaptive Roadmap →
            </div>
          </div>

          <div className="page-next-card" onClick={() => openMascotChat('Review my LinkedIn profile strengths and suggest 3 high-impact resume improvements')}>
            <div>
              <span className="page-next-card__tag" style={{ background: 'var(--lime)' }}>Step 4: AI Coaching</span>
              <h3 className="page-next-card__title">Chat with PulseBot Mascot</h3>
              <p className="page-next-card__desc">
                Ask our roving AI Career Coach for personalized resume bullet rewrites, ATS keyword optimization, and tech interview strategy.
              </p>
            </div>
            <div className="page-next-card__cta">
              Ask AI Coach Now →
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home__footer" role="contentinfo" style={{ marginTop: '4rem' }}>
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
          </nav>
        </div>
      </footer>
    </div>
  );
}

