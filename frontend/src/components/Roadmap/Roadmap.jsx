import { useState, useEffect } from 'react';
import { roadmapApi } from '../../services/api';
import { useAnalysis } from '../../context/AnalysisContext';
import { SectionHeader, Sticker } from '../Decorative/Decorative';
import '../LinkedInAnalyzer/Analyzer.css';
import './Roadmap.css';

export default function Roadmap() {
  const { linkedinResult, githubResult, roadmap, setRoadmap } = useAnalysis();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});
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
      const data = await roadmapApi.build(linkedinResult?.analysisId, githubResult?.analysisId);
      setRoadmap(data);
    } catch (err) {
      setError(err.message || 'Could not build a personalized roadmap. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = (taskKey) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskKey]: !prev[taskKey],
    }));
  };

  const handleAskAIAboutRoadmap = () => {
    const chatSection = document.getElementById('chat');
    chatSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="roadmap" className="roadmap">
      <Sticker color="yellow" rotation={-3} className="roadmap__sticker">AI Career Roadmap</Sticker>

      <SectionHeader
        title="AI Career Analyzer &amp; Adaptive Roadmap"
        subtitle="AI tool to improve LinkedIn profile standing and close engineering gaps. Adaptive milestone sprints synthesized from your real GitHub repositories and LinkedIn profile to identify skill gaps for software developer jobs."
        rotate={-1}
      />

      <div className="roadmap__panel brutal-card reveal">
        <p className="roadmap__hint">
          {ready
            ? 'Profile review data detected! Click below to synthesize your personalized dynamic career progression roadmap.'
            : 'Review your LinkedIn and/or GitHub profile above first, then generate your custom dynamic roadmap here.'}
        </p>

        <div className="roadmap__status-pills">
          <span className={`roadmap__pill ${linkedinResult ? 'roadmap__pill--active' : 'roadmap__pill--pending'}`}>
            {linkedinResult ? `✓ LinkedIn: ${linkedinResult.name}` : '○ LinkedIn: Pending'}
          </span>
          <span className={`roadmap__pill ${githubResult ? 'roadmap__pill--active' : 'roadmap__pill--pending'}`}>
            {githubResult ? `✓ GitHub: @${githubResult.username}` : '○ GitHub: Pending'}
          </span>
          {githubResult?.topLanguages && githubResult.topLanguages.length > 0 && (
            <span className="roadmap__pill roadmap__pill--active">
              Stack: {githubResult.topLanguages.slice(0, 2).map((l) => `${l.name} (${l.percentage}%)`).join(', ')}
            </span>
          )}
        </div>

        <button
          type="button"
          className="brutal-btn brutal-btn--primary"
          onClick={handleBuild}
          disabled={!ready || loading}
        >
          {loading ? 'Synthesizing Dynamic Roadmap...' : roadmap ? 'Regenerate Roadmap' : 'Build My Roadmap'}
        </button>

        {error && <div className="roadmap__error">{error}</div>}
      </div>

      {roadmap && (
        <div className="roadmap__results">
          <div className="roadmap__score brutal-card reveal-left">
            <span className="roadmap__score-label">Combined Career Readiness Score</span>
            <span className="roadmap__score-value">{roadmap.combinedScore} / 100</span>
            <p className="roadmap__summary-text">{roadmap.summary}</p>

            <div className="roadmap__metrics-strip">
              <div className="roadmap__metric-badge">
                <span className="roadmap__metric-label">Primary Stack</span>
                <span className="roadmap__metric-val">{roadmap.primaryLanguage || roadmap.strongLanguages?.[0] || 'Modern Stack'}</span>
              </div>
              <div className="roadmap__metric-badge">
                <span className="roadmap__metric-label">Sprint Milestones</span>
                <span className="roadmap__metric-val">{roadmap.totalMilestones || roadmap.weeks?.length} Sprints</span>
              </div>
              <div className="roadmap__metric-badge">
                <span className="roadmap__metric-label">Estimated Timeline</span>
                <span className="roadmap__metric-val">{roadmap.estimatedTotalDuration || 'Flexible Track'}</span>
              </div>
            </div>
          </div>

          <div className="roadmap__milestones-header-wrap reveal">
            <h3 className="roadmap__weeks-header">Dynamic Execution Milestones & Sprints</h3>
            <p className="roadmap__milestones-sub">
              Engineered around your active {roadmap.primaryLanguage || 'GitHub'} codebase with tangible deliverables:
            </p>
          </div>

          <div className="roadmap__weeks">
            {roadmap.weeks.map((week) => (
              <article key={week.week} className="roadmap__week brutal-card reveal">
                <div className="roadmap__week-header-row">
                  <span className="roadmap__week-label">{week.phase || `Sprint 0${week.week}`}</span>
                  {week.duration && (
                    <span className="roadmap__duration-pill">⏱️ {week.duration}</span>
                  )}
                </div>

                <h3>{week.title || week.focus}</h3>

                {week.languageContext && (
                  <span className="roadmap__lang-pill">
                    {week.languageContext}
                  </span>
                )}

                {week.deliverable && (
                  <div className="roadmap__deliverable">
                    <span className="roadmap__deliverable-label">📦 Key Deliverable:</span>
                    <p className="roadmap__deliverable-text">{week.deliverable}</p>
                  </div>
                )}

                <ul className="roadmap__task-list">
                  {week.tasks.map((task, i) => {
                    const taskKey = `${week.week}-${i}`;
                    const isDone = Boolean(completedTasks[taskKey]);
                    return (
                      <li
                        key={i}
                        className={`roadmap__task-item ${isDone ? 'roadmap__task-item--done' : ''}`}
                        onClick={() => handleToggleTask(taskKey)}
                      >
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => handleToggleTask(taskKey)}
                          className="roadmap__task-checkbox"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className={`roadmap__task-text ${isDone ? 'roadmap__task-text--done' : ''}`}>
                          {task}
                        </span>
                      </li>
                    );
                  })}
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
