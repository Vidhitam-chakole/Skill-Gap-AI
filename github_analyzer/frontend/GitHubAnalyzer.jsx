import { useState } from 'react';
import { gitHubApi } from '../../services/api';
import { useAnalysis } from '../../context/AnalysisContext';
import { SectionHeader, Sticker } from '../Decorative/Decorative';
import './Analyzer.css';

export default function GitHubAnalyzer() {
  const { githubResult, setGithubResult, setRoadmap } = useAnalysis();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const results = githubResult;

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await gitHubApi.analyze(username.trim());
      setGithubResult(data);
      setRoadmap(null); // Reset roadmap so user can regenerate fresh combined roadmap
    } catch (err) {
      setError(err.message || 'GitHub analysis failed. Please verify the username or profile link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="github" className="analyzer analyzer--github">
      <Sticker color="cyan" rotation={-4} className="analyzer__sticker">GitHub Review</Sticker>

      <SectionHeader
        tag="// github_profile_analyzer"
        title="GitHub Profile Review"
        subtitle="Analyze public repositories, languages, commit velocity, and developer skill gaps directly from GitHub API."
        rotate={-2}
      />

      <form className="analyzer__form brutal-card reveal" onSubmit={handleAnalyze}>
        <label className="analyzer__label" htmlFor="github-username">
          GitHub Profile Link or Username
        </label>
        <div className="analyzer__input-row">
          <input
            id="github-username"
            type="text"
            className="analyzer__input"
            placeholder="e.g. torvalds or https://github.com/torvalds"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <button type="submit" className="brutal-btn brutal-btn--primary" disabled={loading}>
            {loading ? 'Analyzing GitHub...' : 'Analyze GitHub'}
          </button>
        </div>
      </form>

      {error && <div className="analyzer__error reveal">{error}</div>}

      {results && (
        <div className="analyzer__results">
          <div className="analyzer__score-card analyzer__score-card--gh brutal-card reveal-left">
            <span className="analyzer__score-label">GitHub Review Score</span>
            <span className="analyzer__score-value">{results.overallScore}</span>
            <div className="analyzer__profile-info">
              <strong>{results.name} (@{results.username})</strong>
              <span>Public Developer Profile</span>
              <a
                href={`https://github.com/${results.username}`}
                target="_blank"
                rel="noreferrer"
                className="analyzer__profile-link"
              >
                https://github.com/{results.username}
              </a>
            </div>
          </div>

          <div className="analyzer__stats-row reveal">
            <div className="analyzer__stat-box">
              <span className="analyzer__stat-val">{results.stats.repos}</span>
              <span className="analyzer__stat-lbl">Public Repos</span>
            </div>
            <div className="analyzer__stat-box">
              <span className="analyzer__stat-val">{results.stats.stars}</span>
              <span className="analyzer__stat-lbl">Total Stars</span>
            </div>
            <div className="analyzer__stat-box">
              <span className="analyzer__stat-val">{results.stats.followers}</span>
              <span className="analyzer__stat-lbl">Followers</span>
            </div>
            <div className="analyzer__stat-box">
              <span className="analyzer__stat-val">{results.stats.contributions}</span>
              <span className="analyzer__stat-lbl">Activity Index</span>
            </div>
          </div>

          <div className="analyzer__grid">
            <div className="analyzer__panel brutal-card reveal">
              <h3>Developer Skill Gaps</h3>
              <p className="analyzer__panel-subtitle">Actionable code &amp; workflow improvements:</p>
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

            <div className="analyzer__panel brutal-card reveal-right">
              <h3>Primary Languages</h3>
              <p className="analyzer__panel-subtitle">Code distribution across public repositories:</p>
              <div className="analyzer__bars">
                {results.topLanguages.map((lang, i) => (
                  <div key={i} className="analyzer__bar-item">
                    <div className="analyzer__bar-header">
                      <span>{lang.name}</span>
                      <span>{lang.percentage}%</span>
                    </div>
                    <div className="analyzer__bar-track">
                      <div
                        className="analyzer__bar-fill analyzer__bar-fill--gh"
                        style={{ width: `${lang.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <h3 style={{ marginTop: '2rem' }}>Featured Repositories</h3>
              <p className="analyzer__panel-subtitle">Top repositories by stars and activity:</p>
              <ul className="analyzer__repo-list">
                {results.pinnedRepos.map((repo, i) => (
                  <li key={i} className="analyzer__repo-item">
                    <span className="analyzer__repo-name">{repo.name}</span>
                    <div className="analyzer__repo-meta">
                      <span>★ {repo.stars}</span>
                      <span>{repo.language}</span>
                    </div>
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
