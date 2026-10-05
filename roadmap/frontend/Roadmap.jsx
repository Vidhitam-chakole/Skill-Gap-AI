import { useState, useEffect } from 'react';
import { roadmapApi, USE_MOCK } from '../../services/api';
import { mockRoadmap } from '../../data/mockData';
import { useAnalysis } from '../../context/AnalysisContext';
import { SectionHeader, Sticker } from '../Decorative/Decorative';
import '../LinkedInAnalyzer/Analyzer.css';
import './Roadmap.css';

export default function Roadmap() {
  const { linkedinResult, githubResult, roadmap, setRoadmap } = useAnalysis();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const ready = Boolean(linkedinResult || githubResult);

  // Automatically trigger roadmap generation when both analyses are ready and roadmap is not yet built
  useEffect(() => {
    if (linkedinResult && githubResult && !roadmap && !loading) {
      handleBuild();
    }
  }, [linkedinResult?.analysisId, githubResult?.analysisId]);

  const handleBuild = async () => {
    if (!ready) return;
    setLoading(true);
    setError(null);

    try {
      let data;
      if (USE_MOCK) {
        const scores = [linkedinResult?.overallScore, githubResult?.overallScore].filter(Boolean);
        const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 80;
        data = {
          ...mockRoadmap,
          combinedScore: avg,
        };
      } else {
        data = await roadmapApi.build(linkedinResult?.analysisId, githubResult?.analysisId);
      }
      setRoadmap(data);
    } catch (err) {
      setError(err.message || 'Could not build a personalized roadmap. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAskAIAboutRoadmap = () => {
    const chatSection = document.getElementById('chat');
    chatSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="roadmap" className="roadmap">
      <Sticker color="yellow" rotation={-3} className="roadmap__sticker">Personalized Roadmap</Sticker>

      <SectionHeader
        tag="// career_growth_roadmap"
        title="Personalized Roadmap"
        subtitle="Merge findings from your LinkedIn profile review and GitHub repositories into a prioritized 4-week execution roadmap."
        rotate={-1}
      />

      <div className="roadmap__panel brutal-card reveal">
        <p className="roadmap__hint">
          {ready
            ? 'Profile analyses detected! Click below to synthesize your personalized career progression plan.'
            : 'Review your LinkedIn and/or GitHub profile above first, then generate your custom 4-week roadmap here.'}
        </p>

        <div className="roadmap__status-pills">
          <span className={`roadmap__pill ${linkedinResult ? 'roadmap__pill--active' : 'roadmap__pill--pending'}`}>
            {linkedinResult ? `✓ LinkedIn: ${linkedinResult.name}` : '○ LinkedIn: Pending'}
          </span>
          <span className={`roadmap__pill ${githubResult ? 'roadmap__pill--active' : 'roadmap__pill--pending'}`}>
            {githubResult ? `✓ GitHub: @${githubResult.username}` : '○ GitHub: Pending'}
          </span>
        </div>

        <button
          type="button"
          className="brutal-btn brutal-btn--primary"
          onClick={handleBuild}
          disabled={!ready || loading}
        >
          {loading ? 'Synthesizing Roadmap...' : roadmap ? '⚡ Regenerate Roadmap' : '⚡ Build My Roadmap'}
        </button>

        {error && <div className="roadmap__error">{error}</div>}
      </div>

      {roadmap && (
        <div className="roadmap__results">
          <div className="roadmap__score brutal-card reveal-left">
            <span className="roadmap__score-label">Combined Career Score</span>
            <span className="roadmap__score-value">{roadmap.combinedScore} / 100</span>
            <p className="roadmap__summary-text">{roadmap.summary}</p>
          </div>

          <div className="roadmap__priorities brutal-card reveal">
            <h3>Unified Skill Priorities</h3>
            <p className="roadmap__priorities-sub">
              Deduplicated and cross-referenced from your LinkedIn and GitHub reviews:
            </p>
            <ul>
              {roadmap.priorities.map((item, idx) => (
                <li key={idx}>
                  <div className="roadmap__priority-head">
                    <strong>{item.skill}</strong>
                    <span className={`analyzer__severity severity-${item.severity}`}>{item.severity}</span>
                    <span className="roadmap__source">Source: {item.source}</span>
                  </div>
                  <p>{item.recommendation}</p>
                </li>
              ))}
            </ul>
          </div>

          <h3 className="roadmap__weeks-header reveal">4-Week Structured Sprints</h3>
          <div className="roadmap__weeks">
            {roadmap.weeks.map((week) => (
              <article key={week.week} className="roadmap__week brutal-card reveal">
                <span className="roadmap__week-label">Sprint Week 0{week.week}</span>
                <h3>{week.focus}</h3>
                <ul>
                  {week.tasks.map((task, i) => (
                    <li key={i}>{task}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          {roadmap.nextActions && roadmap.nextActions.length > 0 && (
            <div className="roadmap__actions-panel brutal-card reveal">
              <h3>Immediate Next Actions</h3>
              <ul className="roadmap__actions-list">
                {roadmap.nextActions.map((action, i) => (
                  <li key={i} className="roadmap__actions-item">
                    <span className="roadmap__actions-num">0{i + 1}</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="brutal-btn brutal-btn--dark"
                  onClick={handleAskAIAboutRoadmap}
                >
                  💬 Ask Local AI Agent to Guide Me
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
