import { useState, useEffect, useRef } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { useAnalysis } from '../context/AnalysisContext';
import { linkedInApi, USE_MOCK } from '../services/api';
import { mockLinkedInResults } from '../data/mockData';
import { FloatingShapes } from '../components/Decorative/Decorative';
import './WelcomePage.css';

const LINKEDIN_RESULT_KEY = 'skillgap-linkedin-result';

export default function WelcomePage() {
  const { githubUrl, setGithubUrl, completeOnboarding } = useOnboarding();
  const { setLinkedinResult, analyzeGithub, analysisLoading, analysisError } = useAnalysis();
  const [localGithub, setLocalGithub] = useState(githubUrl);
  const [linkedinFile, setLinkedinFile] = useState(null);
  const [linkedinFileName, setLinkedinFileName] = useState('');
  const [exiting, setExiting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [linkedinError, setLinkedinError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const el = document.querySelector('.welcome-page__content');
    if (!el) return;
    el.querySelectorAll('.welcome-page__reveal').forEach((node, i) => {
      node.style.animationDelay = `${i * 0.12}s`;
    });
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setLinkedinError('Please upload a PDF resume file.');
        return;
      }
      setLinkedinFile(file);
      setLinkedinFileName(file.name);
      setLinkedinError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!linkedinFile && !localGithub.trim()) return;

    setLinkedinError(null);
    setLinkedinResult(null);

    // Analyze LinkedIn resume (PDF upload)
    if (linkedinFile) {
      setAnalyzing(true);
      try {
        let data;
        if (USE_MOCK) {
          await new Promise((r) => setTimeout(r, 800));
          data = { ...mockLinkedInResults, profileUrl: `resume:${linkedinFile.name}` };
        } else {
          data = await linkedInApi.analyzeResume(linkedinFile);
        }
        setLinkedinResult(data);
        // Persist for returning users
        try {
          localStorage.setItem(LINKEDIN_RESULT_KEY, JSON.stringify(data));
        } catch { /* ignore quota errors */ }
      } catch (err) {
        setLinkedinError(err.message || 'LinkedIn analysis failed. You can skip this and continue.');
      }
      setAnalyzing(false);
    }

    // Save GitHub username
    setGithubUrl(localGithub.trim());

    // Analyze GitHub (if provided)
    if (localGithub.trim()) {
      setAnalyzing(true);
      try {
        await analyzeGithub(localGithub.trim());
      } catch {
        // Error is stored in AnalysisContext
      }
      setAnalyzing(false);
    }

    // Transition to dashboard
    setExiting(true);
    setTimeout(() => {
      completeOnboarding(linkedinFile ? `resume:${linkedinFile.name}` : '', localGithub.trim());
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
            Build your career profile by uploading your resume and connecting GitHub.
          </p>
        </div>

        <form className="welcome-page__form" onSubmit={handleSubmit}>
          {/* LinkedIn / Resume Section */}
          <div className="welcome-page__field welcome-page__reveal">
            <div className="welcome-page__field-header">
              <span className="welcome-page__field-icon welcome-page__field-icon--linkedin">in</span>
              <div>
                <label className="welcome-page__label" htmlFor="onboard-resume">
                  LinkedIn / Resume
                </label>
                <p className="welcome-page__field-hint">
                  Upload your PDF resume for skill and experience analysis
                </p>
              </div>
            </div>
            <div className="welcome-page__file-upload">
              <input
                ref={fileInputRef}
                id="onboard-resume"
                type="file"
                accept=".pdf"
                className="welcome-page__file-input"
                onChange={handleFileChange}
                disabled={isWorking}
              />
              <label
                htmlFor="onboard-resume"
                className={`welcome-page__file-label ${linkedinFile ? 'welcome-page__file-label--selected' : ''}`}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
              >
                {linkedinFileName ? (
                  <>
                    <span className="welcome-page__file-icon">📄</span>
                    <span className="welcome-page__file-name">{linkedinFileName}</span>
                    <span className="welcome-page__file-change">Change</span>
                  </>
                ) : (
                  <>
                    <span className="welcome-page__file-icon">📎</span>
                    <span>Click to upload PDF resume</span>
                  </>
                )}
              </label>
            </div>
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
            You can provide one or both. Connect both for the most comprehensive analysis.
          </p>

          {(linkedinError || analysisError) && (
            <div className="welcome-page__error welcome-page__reveal">
              {linkedinError || analysisError}
            </div>
          )}

          <button
            type="submit"
            className="welcome-page__submit brutal-btn brutal-btn--primary welcome-page__reveal"
            disabled={(!linkedinFile && !localGithub.trim()) || isWorking}
          >
            {isWorking ? 'Analyzing…' : 'Continue → Analyze'}
          </button>
        </form>
      </div>
    </div>
  );
}
