import { useState } from 'react';
import { gitHubApi, USE_MOCK } from '../../services/api';
import { mockGitHubResults } from '../../data/mockData';
import { useAnalysis } from '../../context/AnalysisContext';
import { SectionHeader, Sticker } from '../Decorative/Decorative';
import '../LinkedInAnalyzer/Analyzer.css';

export default function GitHubAnalyzer() {
  const { githubResult, setGithubResult, setRoadmap } = useAnalysis();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const results = githubResult;

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    setGithubResult(null);
    setRoadmap(null);

    try {
      const data = USE_MOCK
        ? { ...mockGitHubResults, username, analysisId: 'gh-mock-001' }
        : await gitHubApi.analyze(username);
      setGithubResult(data);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="github" className="analyzer analyzer--github">
      <Sticker color="cyan" rotation={-4} className="analyzer__sticker">GitHub</Sticker>

      <SectionHeader
        tag="// github_analyzer"
        title="GitHub Profile Analyzer"
        subtitle="Enter your GitHub username to analyze repos, languages, contributions, and developer skill gaps."
        rotate={-2}
      />

      <form className="analyzer__form brutal-card reveal" onSubmit={handleAnalyze}>
        <label className="analyzer__label" htmlFor="github-username">
          GitHub Username
        </label>
        <div className="analyzer__input-row">
          <input
            id="github-username"
            type="text"
            className="analyzer__input"
            placeholder="your-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <button type="submit" className="brutal-btn brutal-btn--secondary" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        {USE_MOCK && <p className="analyzer__mock-note">Using mock data — connect backend via VITE_USE_MOCK=false</p>}
      </form>

      {error && <div className="analyzer__error reveal">{error}</div>}

      {results && (
        <div className="analyzer__results">
          <div className="analyzer__score-card brutal-card reveal-left analyzer__score-card--gh">
            <span className="analyzer__score-label">Dev Score</span>
            <span className="analyzer__score-value">{results.overallScore}</span>
            <div className="analyzer__profile-info">
              <strong>@{results.username}</strong>
              <span>{results.name}</span>
            </div>
          </div>

          <div className="analyzer__stats-row reveal">
            {Object.entries(results.stats).map(([key, val]) => (
              <div key={key} className="analyzer__stat brutal-card">
                <span className="analyzer__stat-value">{val.toLocaleString()}</span>
                <span className="analyzer__stat-label">{key}</span>
              </div>
            ))}
          </div>

          <div className="analyzer__grid">
            <div className="analyzer__panel brutal-card reveal">
              <h3>Top Languages</h3>
              <div className="analyzer__lang-list">
                {results.topLanguages.map((lang, i) => (
                  <div key={i} className="analyzer__lang-item">
                    <span>{lang.name}</span>
                    <div className="analyzer__demand-bar">
                      <div className="analyzer__demand-fill analyzer__demand-fill--gh" style={{ width: `${lang.percentage}%` }} />
                    </div>
                    <span>{lang.percentage}%</span>
                  </div>
                ))}
              </div>

              <h3 className="analyzer__sub-heading">Pinned Repos</h3>
              <ul className="analyzer__repo-list">
                {results.pinnedRepos.map((repo, i) => (
                  <li key={i} className="analyzer__repo-item">
                    <span className="analyzer__repo-name">{repo.name}</span>
                    <span className="analyzer__repo-meta">{repo.language} · {repo.stars} stars</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="analyzer__panel brutal-card reveal-right">
              <h3>Skill Gaps</h3>
              <ul className="analyzer__gap-list">
                {results.skillGaps.map((gap, i) => (
                  <li key={i} className="analyzer__gap-item">
                    <div className="analyzer__gap-header">
                      <span className="analyzer__gap-skill">{gap.skill}</span>
                      <span className={`analyzer__severity severity-${gap.severity}`}>{gap.severity}</span>
                    </div>
                    <p className="analyzer__gap-rec">{gap.recommendation}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
