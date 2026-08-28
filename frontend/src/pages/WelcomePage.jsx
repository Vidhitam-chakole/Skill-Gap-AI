import { useState, useEffect } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { useAnalysis } from '../context/AnalysisContext';
import { FloatingShapes } from '../components/Decorative/Decorative';
import './WelcomePage.css';

export default function WelcomePage() {
  const { linkedinUrl, githubUrl, setLinkedinUrl, setGithubUrl, completeOnboarding } = useOnboarding();
  const { analyzeGithub, analysisLoading, analysisError } = useAnalysis();
  const [localLinkedin, setLocalLinkedin] = useState(linkedinUrl);
  const [localGithub, setLocalGithub] = useState(githubUrl);
  const [exiting, setExiting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const el = document.querySelector('.welcome-page__content');
    if (!el) return;
    el.querySelectorAll('.welcome-page__reveal').forEach((node, i) => {
      node.style.animationDelay = `${i * 0.12}s`;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!localLinkedin.trim() && !localGithub.trim()) return;

    // Save profile URLs to onboarding context
    setLinkedinUrl(localLinkedin.trim());
    setGithubUrl(localGithub.trim());

    // If GitHub username is provided, trigger analysis before completing onboarding
    if (localGithub.trim()) {
      setAnalyzing(true);
      try {
        await analyzeGithub(localGithub.trim());
      } catch {
        // Error is stored in AnalysisContext — dashboard will show it
      }
      setAnalyzing(false);
    }

    // Transition to dashboard
    setExiting(true);
    setTimeout(() => {
      completeOnboarding(localLinkedin.trim(), localGithub.trim());
    }, 400);
  };

  const isWorking = analyzing || analysisLoading;

  return (
    <div className={`welcome-page ${exiting ? 'welcome-page--exit' : ''}`}>
      <div className="welcome-page__bg">
        <FloatingShapes />
      </div>

      <div className="welcome-page__content">
        <div className="welcome-page__header welcome-page__reveal">
          <img src="/logo.svg" alt="Skill+" className="welcome-page__logo" />
          <h1 className="welcome-page__title">Welcome to Skill+</h1>
          <p className="welcome-page__subtitle">
            Build your career profile by connecting your LinkedIn and GitHub.
          </p>
        </div>

        <form className="welcome-page__form" onSubmit={handleSubmit}>
          {/* LinkedIn Section */}
          <div className="welcome-page__field welcome-page__reveal">
            <div className="welcome-page__field-header">
              <span className="welcome-page__field-icon welcome-page__field-icon--linkedin">in</span>
              <div>
                <label className="welcome-page__label" htmlFor="onboard-linkedin">
                  LinkedIn
                </label>
                <p className="welcome-page__field-hint">
                  Your professional profile for career analysis
                </p>
              </div>
            </div>
            <input
              id="onboard-linkedin"
              type="url"
              className="welcome-page__input"
              placeholder="https://linkedin.com/in/your-profile"
              value={localLinkedin}
              onChange={(e) => setLocalLinkedin(e.target.value)}
              disabled={isWorking}
            />
          </div>

          {/* GitHub Section */}
          <div className="welcome-page__field welcome-page__reveal">
            <div className="welcome-page__field-header">
              <span className="welcome-page__field-icon welcome-page__field-icon--github">gh</span>
              <div>
                <label className="welcome-page__label" htmlFor="onboard-github">
                  GitHub
                </label>
                <p className="welcome-page__field-hint">
                  Your developer profile for skill analysis
                </p>
              </div>
            </div>
            <input
              id="onboard-github"
              type="text"
              className="welcome-page__input"
              placeholder="your-github-username"
              value={localGithub}
              onChange={(e) => setLocalGithub(e.target.value)}
              disabled={isWorking}
            />
          </div>

          <p className="welcome-page__note welcome-page__reveal">
            You can provide one or both profiles. Connect both for the most comprehensive analysis.
          </p>

          {analysisError && (
            <div className="welcome-page__error welcome-page__reveal">
              {analysisError}
            </div>
          )}

          <button
            type="submit"
            className="welcome-page__submit brutal-btn brutal-btn--primary welcome-page__reveal"
            disabled={(!localLinkedin.trim() && !localGithub.trim()) || isWorking}
          >
            {isWorking ? 'Analyzing GitHub…' : 'Continue → Analyze'}
          </button>
        </form>
      </div>
    </div>
  );
}
