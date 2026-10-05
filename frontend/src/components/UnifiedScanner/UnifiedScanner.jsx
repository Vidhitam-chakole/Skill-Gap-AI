import { useState } from 'react';
import { gitHubApi, linkedInApi, roadmapApi, USE_MOCK } from '../../services/api';
import { mockGitHubResults, mockLinkedInResults, mockRoadmap } from '../../data/mockData';
import { useAnalysis } from '../../context/AnalysisContext';
import './UnifiedScanner.css';

export default function UnifiedScanner() {
  const { setLinkedinResult, setGithubResult, setRoadmap } = useAnalysis();
  const [linkedinInput, setLinkedinInput] = useState('');
  const [githubInput, setGithubInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);

  const handleQuickDemo = (li, gh) => {
    setLinkedinInput(li);
    setGithubInput(gh);
  };

  const handleDualScan = async (e) => {
    e.preventDefault();
    if (!linkedinInput.trim() && !githubInput.trim()) {
      setError('Please provide at least a LinkedIn name/link or GitHub profile link.');
      return;
    }

    setLoading(true);
    setError(null);

    let liData = null;
    let ghData = null;

    try {
      // 1. Analyze LinkedIn if provided
      if (linkedinInput.trim()) {
        setStatusMessage('Scanning LinkedIn profile review & market gaps...');
        if (USE_MOCK) {
          await new Promise((r) => setTimeout(r, 400));
          liData = {
            ...mockLinkedInResults,
            profileUrl: linkedinInput,
            name: linkedinInput.includes('/') ? 'Alex Rivera' : linkedinInput,
            analysisId: 'li-mock-001',
          };
        } else {
          liData = await linkedInApi.analyze(linkedinInput.trim());
        }
        setLinkedinResult(liData);
      }

      // 2. Analyze GitHub if provided
      if (githubInput.trim()) {
        setStatusMessage('Querying GitHub API, calculating language distributions & repo metrics...');
        if (USE_MOCK) {
          await new Promise((r) => setTimeout(r, 400));
          const cleanUser = githubInput.replace(/https?:\/\/github\.com\//, '').replace(/\/$/, '');
          ghData = {
            ...mockGitHubResults,
            username: cleanUser || 'torvalds',
            analysisId: 'gh-mock-001',
          };
        } else {
          ghData = await gitHubApi.analyze(githubInput.trim());
        }
        setGithubResult(ghData);
      }

      // 3. Automatically synthesize personalized 4-week roadmap
      if (liData || ghData) {
        setStatusMessage('Synthesizing personalized 4-week roadmap & priming Local AI Agent...');
        if (USE_MOCK) {
          await new Promise((r) => setTimeout(r, 300));
          const scores = [liData?.overallScore, ghData?.overallScore].filter(Boolean);
          const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 82;
          setRoadmap({ ...mockRoadmap, combinedScore: avg });
        } else {
          const rmData = await roadmapApi.build(liData?.analysisId, ghData?.analysisId);
          setRoadmap(rmData);
        }
      }

      setStatusMessage('Analysis complete! Scrolling to your results...');
      setTimeout(() => {
        const target = document.getElementById('linkedin') || document.getElementById('github') || document.getElementById('roadmap');
        target?.scrollIntoView({ behavior: 'smooth' });
        setStatusMessage('');
      }, 700);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please check inputs and ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="unified-scanner reveal">
      <div className="unified-scanner__card brutal-card">
        <div className="unified-scanner__header">
          <span className="unified-scanner__tag">// ONE_CLICK_PROFILE_SCANNER</span>
          <h2 className="unified-scanner__title">Full-Stack Career Gap Intelligence</h2>
          <p className="unified-scanner__subtitle">
            Input your LinkedIn name/URL and GitHub profile link to get an instant profile review,
            personalized 4-week roadmap, and AI mentor guidance.
          </p>
        </div>

        <form className="unified-scanner__form" onSubmit={handleDualScan}>
          <div className="unified-scanner__inputs">
            <div className="unified-scanner__field">
              <label className="unified-scanner__label" htmlFor="unified-li">
                <span className="unified-scanner__badge unified-scanner__badge--in">IN</span>
                LinkedIn Name or Profile Link
              </label>
              <input
                id="unified-li"
                type="text"
                className="unified-scanner__input"
                placeholder="e.g. Alex Rivera or https://linkedin.com/in/alex-rivera"
                value={linkedinInput}
                onChange={(e) => setLinkedinInput(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="unified-scanner__field">
              <label className="unified-scanner__label" htmlFor="unified-gh">
                <span className="unified-scanner__badge unified-scanner__badge--gh">GH</span>
                GitHub Profile Link or Username
              </label>
              <input
                id="unified-gh"
                type="text"
                className="unified-scanner__input"
                placeholder="e.g. https://github.com/torvalds or torvalds"
                value={githubInput}
                onChange={(e) => setGithubInput(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="unified-scanner__actions">
            <div className="unified-scanner__samples">
              <span className="unified-scanner__sample-text">Quick Samples:</span>
              <button
                type="button"
                className="unified-scanner__sample-btn"
                onClick={() => handleQuickDemo('Alex Rivera', 'torvalds')}
              >
                Alex Rivera + @torvalds
              </button>
              <button
                type="button"
                className="unified-scanner__sample-btn"
                onClick={() => handleQuickDemo('Dan Abramov', 'https://github.com/gaearon')}
              >
                Dan Abramov + React
              </button>
            </div>

            <button
              type="submit"
              className="brutal-btn brutal-btn--primary unified-scanner__submit-btn"
              disabled={loading}
            >
              {loading ? 'Analyzing Profiles...' : '⚡ Scan Both & Generate Roadmap'}
            </button>
          </div>

          {loading && (
            <div className="unified-scanner__loading">
              <div className="unified-scanner__step">
                <div className="unified-scanner__spinner" />
                <span>{statusMessage}</span>
              </div>
            </div>
          )}

          {error && <div className="unified-scanner__error">{error}</div>}
        </form>
      </div>
    </section>
  );
}
