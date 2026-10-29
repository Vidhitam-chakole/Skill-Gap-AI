import { lazy, Suspense } from 'react';
import { useRouter } from '../router/Router';
import { useAnalysis } from '../context/AnalysisContext';
import './Pages.css';

const Roadmap = lazy(() => import('../components/Roadmap/Roadmap'));

export default function RoadmapPage() {
  const { navigate, openMascotChat } = useRouter();
  const { linkedinResult, githubResult } = useAnalysis();
  const hasAnalysis = Boolean(linkedinResult || githubResult);

  return (
    <div className="page-wrapper">
      {/* Page Hero Header */}
      <header className="page-hero">
        <h1 className="page-hero__title">
          AI Career <span className="page-hero__title-accent">Roadmap</span>
        </h1>
        <p className="page-hero__desc">
          Synthesize findings from your LinkedIn profile and GitHub repositories into an adaptive, milestone-driven sprint roadmap designed to help you land software developer jobs and internships.
        </p>
      </header>

      {/* Main Content Area */}
      {hasAnalysis ? (
        <Suspense fallback={<div className="section-loading-fallback" />}>
          <Roadmap />
        </Suspense>
      ) : (
        <div className="page-onboarding-card">
          <div className="page-onboarding-card__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
          </div>
          <h2 className="page-onboarding-card__title">Personalized Roadmap Awaits</h2>
          <p className="page-onboarding-card__desc">
            To build a custom milestone roadmap tailored specifically to your real skill gaps, please analyze either your LinkedIn profile or your GitHub repositories first!
          </p>
          <div className="page-onboarding-card__actions">
            <button
              type="button"
              className="brutal-btn brutal-btn--primary"
              onClick={() => navigate('/linkedin')}
            >
              Upload LinkedIn PDF →
            </button>
            <button
              type="button"
              className="brutal-btn brutal-btn--secondary"
              onClick={() => navigate('/github')}
            >
              Analyze GitHub Profile →
            </button>
          </div>
        </div>
      )}

      {/* Cross-linking Next Steps Banners */}
      <section className="page-next-steps" aria-label="Recommended Next Career Steps">
        <h2 className="page-next-steps__title">
          <span>→</span> Maximize Your Roadmap Progress
        </h2>
        <div className="page-next-steps__grid">
          <div className="page-next-card" onClick={() => navigate('/verifier')}>
            <div>
              <span className="page-next-card__tag" style={{ background: 'var(--lime)' }}>Interactive Practice</span>
              <h3 className="page-next-card__title">Validate Skills in Code Verifier</h3>
              <p className="page-next-card__desc">
                Test your knowledge of concurrency, memory management, and asynchronous patterns with instant automated test grading.
              </p>
            </div>
            <div className="page-next-card__cta">
              Start Verification Challenges →
            </div>
          </div>

          <div className="page-next-card" onClick={() => openMascotChat('Explain my roadmap sprints and recommend the best project architecture for sprint 1')}>
            <div>
              <span className="page-next-card__tag" style={{ background: 'var(--cyan)' }}>AI Mentorship</span>
              <h3 className="page-next-card__title">Ask PulseBot for Sprint Feedback</h3>
              <p className="page-next-card__desc">
                Have questions about specific sprint tasks or need book and course recommendations? PulseBot is ready to guide you.
              </p>
            </div>
            <div className="page-next-card__cta">
              Chat with AI Mentor →
            </div>
          </div>

          <div className="page-next-card" onClick={() => navigate('/github')}>
            <div>
              <span className="page-next-card__tag" style={{ background: 'var(--orange)' }}>Repository Audit</span>
              <h3 className="page-next-card__title">Benchmark GitHub Quality</h3>
              <p className="page-next-card__desc">
                Track how completing roadmap sprints enhances your GitHub metrics, commit frequency, and language proficiency over time.
              </p>
            </div>
            <div className="page-next-card__cta">
              Inspect GitHub Profile →
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

