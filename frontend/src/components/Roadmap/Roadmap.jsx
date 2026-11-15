import { useState, useEffect } from 'react';
import { roadmapApi } from '../../services/api';
import { useAnalysis } from '../../context/AnalysisContext';
import { SectionHeader } from '../Decorative/Decorative';
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
    window.dispatchEvent(
      new CustomEvent('open-mascot-chat', {
        detail: {
          prompt: 'Explain my dynamic roadmap sprints and recommend what I should focus on first to close my engineering gaps.',
        },
      })
    );
  };

  return (
    <section id="roadmap" className="roadmap">
      <div className="roadmap__panel brutal-card reveal">
        <p className="roadmap__hint">
          {ready
            ? 'Your personalized dynamic career progression roadmap.'
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
              Your Primary Stack: {githubResult.topLanguages.slice(0, 2).map((l) => `${l.name} (${l.percentage}%)`).join(', ')}
            </span>
          )}
        </div>



        {error && <div className="roadmap__error">{error}</div>}
      </div>

      {roadmap && (
        <div className="roadmap__results">
          <div className="roadmap__score brutal-card reveal-left">
            <span className="roadmap__score-label">Combined Career Readiness Score (Linkedin + Github)</span>
            <span className="roadmap__score-value">{roadmap.combinedScore} / 100</span>
            <p className="roadmap__summary-text">{roadmap.summary}</p>

            <div className="roadmap__metrics-strip">
              <div className="roadmap__metric-badge">
                <span className="roadmap__metric-label">Primary Stack</span>
                <span className="roadmap__metric-val">{roadmap.primaryLanguage || roadmap.strongLanguages?.[0] || 'Modern Stack'}</span>
              </div>
              <div className="roadmap__metric-badge">
                <span className="roadmap__metric-label">Roadmap Phases</span>
                <span className="roadmap__metric-val">{roadmap.totalMilestones || roadmap.weeks?.length} Phases</span>
              </div>
              <div className="roadmap__metric-badge">
                <span className="roadmap__metric-label">Estimated Timeline</span>
                <span className="roadmap__metric-val">{roadmap.estimatedTotalDuration || 'Flexible Track'}</span>
              </div>
            </div>
          </div>

          <div className="roadmap__milestones-header-wrap reveal">
            <h3 className="roadmap__weeks-header">Action Phases &amp; Deliverables</h3>
            <p className="roadmap__milestones-sub">
              Step-by-step roadmap tailored to your active {roadmap.primaryLanguage || 'GitHub'} codebase with tangible goals:
            </p>
          </div>

          <div className="roadmap__weeks">
            {roadmap.weeks.map((week) => {
              const cleanPhase = (week.phase || `Phase 0${week.week}`)
                .replace(/Sprint/gi, 'Phase');
              const cleanDuration = (week.duration || '')
                .replace(/Sprint/gi, 'Phase')
                .replace(/⏱️/g, '')
                .trim();

              return (
                <article key={week.week} className="roadmap__week brutal-card reveal">
                  <div className="roadmap__week-header-row">
                    <span className="roadmap__week-label">{cleanPhase}</span>
                    {cleanDuration && (
                      <span className="roadmap__duration-pill">{cleanDuration}</span>
                    )}
                  </div>

                  <h3 className="roadmap__week-title">{week.title || week.focus}</h3>

                  {week.languageContext && (
                    <span className="roadmap__lang-pill">
                      {week.languageContext}
                    </span>
                  )}

                  {week.deliverable && (
                    <div className="roadmap__deliverable">
                      <span className="roadmap__deliverable-label">Target Outcome</span>
                      <p className="roadmap__deliverable-text">{week.deliverable}</p>
                    </div>
                  )}

                  <div className="roadmap__tasks-header">
                    <span className="roadmap__tasks-heading">Action Checklist</span>
                  </div>

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
                            aria-label={task}
                          />
                          <span className={`roadmap__task-text ${isDone ? 'roadmap__task-text--done' : ''}`}>
                            {task}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </article>
              );
            })}
          </div>

          {roadmap.nextActions && roadmap.nextActions.length > 0 && (
            <div className="roadmap__actions-panel brutal-card reveal">
              <div className="roadmap__actions-head">
                <h3>Recommended Next Steps</h3>
                <p className="roadmap__actions-sub">Priority items to start with right away:</p>
              </div>
              <ul className="roadmap__actions-list">
                {roadmap.nextActions.map((action, i) => {
                  const cleanAction = action
                    .replace(/Milestone/gi, 'Phase')
                    .replace(/Sprint/gi, 'Phase');
                  return (
                    <li key={i} className="roadmap__actions-item">
                      <span className="roadmap__actions-num">0{i + 1}</span>
                      <span>{cleanAction}</span>
                    </li>
                  );
                })}
              </ul>
              <div style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="brutal-btn brutal-btn--primary"
                  onClick={handleAskAIAboutRoadmap}
                >
                  Ask PulseBot AI Coach for Guide
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
