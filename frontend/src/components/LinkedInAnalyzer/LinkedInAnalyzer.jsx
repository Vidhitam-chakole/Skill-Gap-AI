import { useState } from 'react';
import { linkedInApi, USE_MOCK } from '../../services/api';
import { mockLinkedInResults } from '../../data/mockData';
import { useAnalysis } from '../../context/AnalysisContext';
import { SectionHeader, Sticker } from '../Decorative/Decorative';
import './Analyzer.css';

export default function LinkedInAnalyzer() {
  const { linkedinResult, setLinkedinResult, setRoadmap } = useAnalysis();
  const [profileUrl, setProfileUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const results = linkedinResult;

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!profileUrl.trim()) return;

    setLoading(true);
    setError(null);
    setLinkedinResult(null);
    setRoadmap(null);

    try {
      const data = USE_MOCK
        ? { ...mockLinkedInResults, profileUrl, analysisId: 'li-mock-001' }
        : await linkedInApi.analyze(profileUrl);
      setLinkedinResult(data);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="linkedin" className="analyzer">
      <Sticker color="pink" rotation={3} className="analyzer__sticker">LinkedIn</Sticker>

      <SectionHeader
        tag="// linkedin_analyzer"
        title="LinkedIn Profile Analyzer"
        subtitle="Paste your LinkedIn profile URL and let AI identify skill gaps, strengths, and market demand."
        rotate={1}
      />

      <form className="analyzer__form brutal-card reveal" onSubmit={handleAnalyze}>
        <label className="analyzer__label" htmlFor="linkedin-url">
          Profile URL
        </label>
        <div className="analyzer__input-row">
          <input
            id="linkedin-url"
            type="url"
            className="analyzer__input"
            placeholder="https://linkedin.com/in/your-profile"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
            required
          />
          <button type="submit" className="brutal-btn brutal-btn--primary" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        {USE_MOCK && <p className="analyzer__mock-note">Using mock data — connect backend via VITE_USE_MOCK=false</p>}
      </form>

      {error && <div className="analyzer__error reveal">{error}</div>}

      {results && (
        <div className="analyzer__results">
          <div className="analyzer__score-card brutal-card reveal-left">
            <span className="analyzer__score-label">Overall Score</span>
            <span className="analyzer__score-value">{results.overallScore}</span>
            <div className="analyzer__profile-info">
              <strong>{results.name}</strong>
              <span>{results.headline}</span>
            </div>
          </div>

          <div className="analyzer__grid">
            <div className="analyzer__panel brutal-card reveal">
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

            <div className="analyzer__panel brutal-card reveal-right">
              <h3>Strengths</h3>
              <div className="analyzer__tags">
                {results.strengths.map((s, i) => (
                  <span key={i} className="analyzer__tag">{s}</span>
                ))}
              </div>

              <h3 className="analyzer__sub-heading">Market Demand</h3>
              <div className="analyzer__demand-list">
                {results.marketDemand.map((item, i) => (
                  <div key={i} className="analyzer__demand-item">
                    <span>{item.skill}</span>
                    <div className="analyzer__demand-bar">
                      <div className="analyzer__demand-fill" style={{ width: `${item.demand}%` }} />
                    </div>
                    <span className="analyzer__demand-pct">{item.demand}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
