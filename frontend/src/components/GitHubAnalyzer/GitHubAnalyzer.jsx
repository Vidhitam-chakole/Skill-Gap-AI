import { useState } from 'react';
import { gitHubApi } from '../../services/api';
import { useAnalysis } from '../../context/AnalysisContext';
import { SectionHeader, Sticker } from '../Decorative/Decorative';
import GitHubAutocomplete from './GitHubAutocomplete';
import '../LinkedInAnalyzer/Analyzer.css';

export default function GitHubAnalyzer() {
  const { githubResult, setGithubResult, setRoadmap, startVerification } = useAnalysis();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const results = githubResult;

  const handleAnalyze = async (e, customUsername) => {
    if (e && e.preventDefault) e.preventDefault();
    const targetUser = (customUsername || username).trim();
    if (!targetUser) return;

    setLoading(true);
    setError(null);

    try {
      const data = await gitHubApi.analyze(targetUser);
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
      <Sticker color="cyan" rotation={-4} className="analyzer__sticker">GitHub Profile Review Tool</Sticker>

      <SectionHeader
        title="GitHub Profile Analyzer &amp; Developer Review Tool"
        subtitle="Analyze GitHub profile for developers directly via GitHub API. Inspect repository code quality, commit velocity, test automation, and engineering gaps for internships and software roles."
        rotate={-2}
      />

      <form className="analyzer__form brutal-card reveal" onSubmit={(e) => handleAnalyze(e)} style={{ position: 'relative', zIndex: 30 }}>
        <label className="analyzer__label" htmlFor="github-username">
          GitHub Profile Link or Username
        </label>
        <div className="analyzer__input-row" style={{ alignItems: 'flex-start' }}>
          <GitHubAutocomplete
            id="github-username"
            value={username}
            onChange={setUsername}
            onSelectUser={(selectedUser, triggerAnalyze) => {
              setUsername(selectedUser.username);
              if (triggerAnalyze) {
                handleAnalyze(null, selectedUser.username);
              }
            }}
            onSubmit={(e) => handleAnalyze(e)}
            disabled={loading}
            placeholder="e.g. torvalds, vid, or https://github.com/torvalds"
          />
          <button
            type="submit"
            className="brutal-btn brutal-btn--primary"
            disabled={loading}
            aria-label="Analyze GitHub profile for developers"
          >
            {loading ? 'Analyzing GitHub Repos...' : 'Analyze GitHub Profile for Developers'}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3>Primary Languages</h3>
              </div>
              <p className="analyzer__panel-subtitle">Code distribution across public repositories:</p>
              <div className="analyzer__bars">
                {results.topLanguages.map((lang, i) => (
                  <div key={i} className="analyzer__bar-item">
                    <div className="analyzer__bar-header">
                      <span>{lang.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span>{lang.percentage}%</span>
                        <button
                          type="button"
                          onClick={() => startVerification && startVerification(lang.name)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            color: '#00f0ff',
                            textDecoration: 'underline',
                            fontWeight: 700,
                          }}
                          title={`Verify ${lang.name} knowledge`}
                        >
                          Verify &rarr;
                        </button>
                      </div>
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

              <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#fffdf5', border: '2px solid var(--black, #0a0a0a)', borderRadius: '4px' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: '1.4' }}>
                  Primary language: <strong style={{ color: 'var(--black, #0a0a0a)' }}>{results.topLanguages[0]?.name}</strong> ({results.topLanguages[0]?.percentage}%). Verify your language proficiency.
                </p>
                <button
                  type="button"
                  onClick={() => startVerification && startVerification(results.topLanguages[0]?.name || 'HTML')}
                  className="brutal-btn brutal-btn--accent"
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'center',
                    marginTop: '0.75rem',
                    padding: '0.6rem 1rem',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Start Test for {results.topLanguages[0]?.name || 'Primary Language'} &rarr;
                </button>
              </div>
            </div>

            <div className="analyzer__panel brutal-card reveal-right">
              <h3>Featured Repositories</h3>
              <p className="analyzer__panel-subtitle">Top repositories by stars and activity:</p>
              <ul className="analyzer__repo-list">
                {results.pinnedRepos.map((repo, i) => (
                  <li key={i} className="analyzer__repo-item">
                    <span className="analyzer__repo-name">{repo.name}</span>
                    <div className="analyzer__repo-meta">
                      <span>Stars: {repo.stars}</span>
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
