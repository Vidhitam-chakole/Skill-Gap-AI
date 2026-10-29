import { lazy, Suspense } from 'react';
import { useRouter } from '../router/Router';
import { useAnalysis } from '../context/AnalysisContext';
import './Pages.css';

const SkillVerifier = lazy(() => import('../components/SkillVerifier/SkillVerifier'));

export default function VerifierPage() {
  const { navigate, openMascotChat } = useRouter();
  const { verifierTargetLang } = useAnalysis();

  return (
    <div className="page-wrapper">
      {/* Page Hero Header */}
      <header className="page-hero">
        <h1 className="page-hero__title">
          AI Code &amp; <span className="page-hero__title-accent">Skill Verifier</span>
        </h1>
        <p className="page-hero__desc">
          Validate your programming proficiency through interactive, timed technical coding challenges. Automated test execution, algorithmic accuracy scoring, and language mastery certification.
        </p>
      </header>

      {/* Main Skill Verifier Component */}
      <Suspense fallback={<div className="section-loading-fallback" />}>
        <SkillVerifier initialLanguage={verifierTargetLang} />
      </Suspense>

      {/* Cross-linking Next Steps Banners */}
      <section className="page-next-steps" aria-label="Recommended Next Career Steps">
        <h2 className="page-next-steps__title">
          <span>→</span> Next Steps in Your Career Analysis
        </h2>
        <div className="page-next-steps__grid">
          <div className="page-next-card" onClick={() => navigate('/roadmap')}>
            <div>
              <span className="page-next-card__tag" style={{ background: 'var(--yellow)' }}>Career Strategy</span>
              <h3 className="page-next-card__title">Translate Scores into Sprint Sprints</h3>
              <p className="page-next-card__desc">
                Review your dynamic roadmap to see which verified skills open new project milestones and interview opportunities.
              </p>
            </div>
            <div className="page-next-card__cta">
              Explore Sprint Roadmap →
            </div>
          </div>

          <div className="page-next-card" onClick={() => navigate('/github')}>
            <div>
              <span className="page-next-card__tag" style={{ background: 'var(--cyan)' }}>Repository Audit</span>
              <h3 className="page-next-card__title">Analyze GitHub Repositories</h3>
              <p className="page-next-card__desc">
                Verify that your public GitHub repositories reflect the languages and frameworks you've demonstrated in testing.
              </p>
            </div>
            <div className="page-next-card__cta">
              Review GitHub Profile →
            </div>
          </div>

          <div className="page-next-card" onClick={() => openMascotChat('Give me 3 practice tips for technical coding assessments and data structure interviews')}>
            <div>
              <span className="page-next-card__tag" style={{ background: 'var(--lime)' }}>AI Tutoring</span>
              <h3 className="page-next-card__title">Practice with PulseBot Mascot</h3>
              <p className="page-next-card__desc">
                Stuck on a tricky edge case or time complexity optimization? Ask PulseBot for hints and conceptual breakdowns.
              </p>
            </div>
            <div className="page-next-card__cta">
              Ask PulseBot for Hints →
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

