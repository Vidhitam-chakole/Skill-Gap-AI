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
    if (e) e.preventDefault();
    if (!profileUrl.trim()) return;

    setLoading(true);
    setError(null);

    try {
      let data;
      if (USE_MOCK) {
        data = {
          ...mockLinkedInResults,
          profileUrl,
          name: profileUrl.includes('/') ? 'Alex Rivera' : profileUrl,
          analysisId: 'li-mock-001',
        };
      } else {
        data = await linkedInApi.analyze(profileUrl.trim());
      }
      setLinkedinResult(data);
      setRoadmap(null); // Reset roadmap so user can regenerate fresh combined roadmap
    } catch (err) {
      setError(err.message || 'LinkedIn analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseSample = (sample) => {
    setProfileUrl(sample);
  };

  return (
    <section id="linkedin" className="analyzer">
      <Sticker color="pink" rotation={3} className="analyzer__sticker">LinkedIn Review</Sticker>

      <SectionHeader
        tag="// linkedin_profile_analyzer"
        title="LinkedIn Profile Review"
        subtitle="Enter your LinkedIn profile name or URL to analyze your headline, strengths, market demand, and skill gaps."
        rotate={1}
      />

      <form className="analyzer__form brutal-card reveal" onSubmit={handleAnalyze}>
        <label className="analyzer__label" htmlFor="linkedin-url">
          LinkedIn Name or Profile Link
        </label>
        <div className="analyzer__input-row">
          <input
            id="linkedin-url"
            type="text"
            className="analyzer__input"
            placeholder="e.g. Alex Rivera or https://linkedin.com/in/alex-rivera"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
            required
          />
          <button type="submit" className="brutal-btn brutal-btn--primary" disabled={loading}>
            {loading ? 'Analyzing Profile...' : 'Analyze LinkedIn'}
          </button>
        </div>

        <div className="analyzer__quick-samples">
          <span className="analyzer__sample-label">Try sample:</span>
          <button
            type="button"
            className="analyzer__sample-chip"
            onClick={() => handleUseSample('Alex Rivera')}
          >
            Alex Rivera
          </button>
          <button
            type="button"
            className="analyzer__sample-chip"
            onClick={() => handleUseSample('https://linkedin.com/in/alex-rivera-developer')}
          >
            Full-Stack Developer
          </button>
          <button
            type="button"
            className="analyzer__sample-chip"
            onClick={() => handleUseSample('Elena Rostova - Data Scientist')}
          >
            Data Scientist
          </button>
        </div>

        {USE_MOCK && <p className="analyzer__mock-note">Using offline mock mode (switch in .env)</p>}
      </form>

      {error && <div className="analyzer__error reveal">{error}</div>}

      {results && (
        <div className="analyzer__results">
          <div className="analyzer__score-card brutal-card reveal-left">
            <span className="analyzer__score-label">LinkedIn Review Score</span>
            <span className="analyzer__score-value">{results.overallScore}</span>
            <div className="analyzer__profile-info">
              <strong>{results.name}</strong>
              <span>{results.headline}</span>
              <a
                href={results.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="analyzer__profile-link"
              >
                {results.profileUrl}
              </a>
            </div>
          </div>

          <div className="analyzer__grid">
            <div className="analyzer__panel brutal-card reveal">
              <h3>Identified Skill Gaps</h3>
              <p className="analyzer__panel-subtitle">Key areas to strengthen for market competitiveness:</p>
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
              <h3>Profile Strengths</h3>
              <p className="analyzer__panel-subtitle">Highlighted competencies from your profile:</p>
              <div className="analyzer__tags">
                {results.strengths.map((s, i) => (
                  <span key={i} className="analyzer__tag">{s}</span>
                ))}
              </div>

              <h3 style={{ marginTop: '2rem' }}>Market Demand Intelligence</h3>
              <p className="analyzer__panel-subtitle">Current industry hiring demand index:</p>
              <div className="analyzer__bars">
                {results.marketDemand.map((item, i) => (
                  <div key={i} className="analyzer__bar-item">
                    <div className="analyzer__bar-header">
                      <span>{item.skill}</span>
                      <span>{item.demand}%</span>
                    </div>
                    <div className="analyzer__bar-track">
                      <div className="analyzer__bar-fill" style={{ width: `${item.demand}%` }} />
                    </div>
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
