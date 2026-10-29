import { lazy, Suspense } from 'react';
import { useRouter } from '../router/Router';
import './Pages.css';

const GitHubAnalyzer = lazy(() => import('../components/GitHubAnalyzer/GitHubAnalyzer'));

export default function GitHubPage() {
  const { navigate, openMascotChat } = useRouter();

  return (
    <div className="page-wrapper">
      {/* Page Hero Header */}
      <header className="page-hero">
        <h1 className="page-hero__title">
          GitHub Profile <span className="page-hero__title-accent">Analyzer</span>
        </h1>
        <p className="page-hero__desc">
          Measure byte-weighted language proficiency, evaluate repository code quality, commit consistency, and test automation signals to identify gaps for software developer jobs and internships.
        </p>
      </header>

      {/* Main GitHub Analyzer Component */}
      <Suspense fallback={<div className="section-loading-fallback" />}>
        <GitHubAnalyzer />
      </Suspense>

      {/* Cross-linking Next Steps Banners */}
      <section className="page-next-steps" aria-label="Recommended Next Career Steps">
        <h2 className="page-next-steps__title">
          <span>→</span> Next Steps in Your Career Analysis
        </h2>
        <div className="page-next-steps__grid">
          <div className="page-next-card" onClick={() => navigate('/verifier')}>
            <div>
              <span className="page-next-card__tag" style={{ background: 'var(--lime)' }}>Step 2: Technical Test</span>
              <h3 className="page-next-card__title">Interactive AI Skill Verifier</h3>
              <p className="page-next-card__desc">
                Put your detected GitHub languages to the test. Take automated, timed coding challenges tailored to Python, JavaScript, TypeScript, Go, or Java.
              </p>
            </div>
            <div className="page-next-card__cta">
              Verify Code Skills Now →
            </div>
          </div>

          <div className="page-next-card" onClick={() => navigate('/roadmap')}>
            <div>
              <span className="page-next-card__tag" style={{ background: 'var(--yellow)' }}>Step 3: Roadmap</span>
              <h3 className="page-next-card__title">Synthesize Your Career Roadmap</h3>
              <p className="page-next-card__desc">
                Generate dynamic 4-week project sprints to build production-grade repositories that impress technical hiring managers and senior architects.
              </p>
            </div>
            <div className="page-next-card__cta">
              Generate Sprint Roadmap →
            </div>
          </div>

          <div className="page-next-card" onClick={() => navigate('/linkedin')}>
            <div>
              <span className="page-next-card__tag" style={{ background: 'var(--pink)' }}>Step 4: Resume Match</span>
              <h3 className="page-next-card__title">Cross-Reference LinkedIn Profile</h3>
              <p className="page-next-card__desc">
                Upload your LinkedIn PDF dossier to compare your claimed experience with your real GitHub commits and identify discrepancies.
              </p>
            </div>
            <div className="page-next-card__cta">
              Upload LinkedIn PDF →
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

