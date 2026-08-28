import { useState } from 'react';
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

  const handleBuild = async () => {
    if (!ready) return;
    setLoading(true);
    setError(null);
    try {
      const data = USE_MOCK
        ? {
            ...mockRoadmap,
            combinedScore: Math.round(
              ((linkedinResult?.overallScore || 0) + (githubResult?.overallScore || 0)) /
                (Number(Boolean(linkedinResult)) + Number(Boolean(githubResult)))
            ),
          }
        : await roadmapApi.build(linkedinResult?.analysisId, githubResult?.analysisId);
      setRoadmap(data);
    } catch (err) {
      setError(err.message || 'Could not build a roadmap.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="roadmap" className="roadmap">
      <Sticker color="yellow" rotation={-3} className="roadmap__sticker">4-week plan</Sticker>

      <SectionHeader
        tag="// career_roadmap"
        title="Personalized Roadmap"
        subtitle="Merge LinkedIn and GitHub gaps into a four-week plan you can actually ship."
        rotate={-1}
      />

      <div className="roadmap__panel brutal-card reveal">
        <p className="roadmap__hint">
          {ready
            ? 'Analyses ready. Generate a plan from your latest LinkedIn and/or GitHub results.'
            : 'Run a LinkedIn or GitHub analysis first, then build your roadmap here.'}
        </p>
        <button
          type="button"
          className="brutal-btn brutal-btn--primary"
          onClick={handleBuild}
          disabled={!ready || loading}
        >
          {loading ? 'Building...' : 'Build my roadmap'}
        </button>
        {error && <div className="roadmap__error">{error}</div>}
      </div>

      {roadmap && (
        <div className="roadmap__results">
          <div className="roadmap__score brutal-card reveal-left">
            <span className="roadmap__score-label">Combined score</span>
            <span className="roadmap__score-value">{roadmap.combinedScore}</span>
            <p>{roadmap.summary}</p>
          </div>

          <div className="roadmap__priorities brutal-card reveal">
            <h3>Priorities</h3>
            <ul>
              {roadmap.priorities.map((item) => (
                <li key={item.skill}>
                  <div className="roadmap__priority-head">
                    <strong>{item.skill}</strong>
                    <span className={`analyzer__severity severity-${item.severity}`}>{item.severity}</span>
                    <span className="roadmap__source">{item.source}</span>
                  </div>
                  <p>{item.recommendation}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="roadmap__weeks">
            {roadmap.weeks.map((week) => (
              <article key={week.week} className="roadmap__week brutal-card reveal">
                <span className="roadmap__week-label">Week {week.week}</span>
                <h3>{week.focus}</h3>
                <ul>
                  {week.tasks.map((task) => (
                    <li key={task}>{task}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
