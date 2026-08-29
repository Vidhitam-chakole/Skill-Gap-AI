import { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import Roadmap from '../components/Roadmap/Roadmap';
import ChatBot from '../components/ChatBot/ChatBot';
import { useAnalysis } from '../context/AnalysisContext';
import { useOnboarding } from '../context/OnboardingContext';
import { SectionHeader, Sticker } from '../components/Decorative/Decorative';
import './DashboardPage.css';

/* ─── Scroll-reveal hook ─── */
function useScrollReveal(threshold = 0.12) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold }
    );

    const observeAll = () => {
      el.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((node) => observer.observe(node));
    };

    observeAll();
    const mutations = new MutationObserver(observeAll);
    mutations.observe(el, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [threshold]);

  return ref;
}

/* ─── Loading banner ─── */
function AnalysisLoading({ username }) {
  return (
    <div className="analysis-loading brutal-card">
      <div className="analysis-loading__spinner" />
      <div className="analysis-loading__text">
        <strong>Analyzing @{username}…</strong>
        <p>Scanning repositories, languages, and contributions. This may take a moment.</p>
      </div>
    </div>
  );
}

/* ─── Section wrappers ─── */

function OverviewSection() {
  const { linkedinResult, githubResult, githubUsername, analysisLoading, analysisError } = useAnalysis();
  const hasData = linkedinResult || githubResult;

  if (analysisLoading) {
    return (
      <section className="dash-section">
        <SectionHeader
          tag="// overview"
          title="Overview"
          subtitle="Your Skill+ career intelligence dashboard at a glance."
          rotate={-1}
        />
        <AnalysisLoading username={githubUsername} />
      </section>
    );
  }

  if (analysisError && !hasData) {
    return (
      <section className="dash-section">
        <SectionHeader
          tag="// overview"
          title="Overview"
          subtitle="Your Skill+ career intelligence dashboard at a glance."
          rotate={-1}
        />
        <div className="analysis-error brutal-card">
          <h3>Analysis Failed</h3>
          <p>{analysisError}</p>
          <p className="analysis-error__hint">Try re-entering your username from the Welcome page, or check that the backend is running.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="dash-section">
      <SectionHeader
        tag="// overview"
        title="Overview"
        subtitle="Your Skill+ career intelligence dashboard at a glance."
        rotate={-1}
      />

      <div className="overview__cards">
        <div className="overview__card brutal-card reveal">
          <span className="overview__card-label">Status</span>
          <span className="overview__card-value">
            {hasData ? 'Active' : 'No Analysis Yet'}
          </span>
          <p className="overview__card-desc">
            {hasData
              ? 'Your profiles have been analyzed. Explore your results below.'
              : 'Run a LinkedIn or GitHub analysis from the sidebar to get started.'}
          </p>
        </div>

        {linkedinResult && (
          <div className="overview__card brutal-card reveal" style={{ background: 'var(--orange)' }}>
            <span className="overview__card-label">LinkedIn Score</span>
            <span className="overview__card-value">{linkedinResult.overallScore}</span>
            <p className="overview__card-desc">{linkedinResult.name}</p>
          </div>
        )}

        {githubResult && (
          <div className="overview__card brutal-card reveal" style={{ background: 'var(--cyan)' }}>
            <span className="overview__card-label">Dev Score</span>
            <span className="overview__card-value">{githubResult.overallScore}</span>
            <p className="overview__card-desc">@{githubResult.username}</p>
          </div>
        )}

        {!linkedinResult && (
          <div className="overview__card brutal-card reveal overview__card--placeholder">
            <span className="overview__card-label">LinkedIn</span>
            <span className="overview__card-value">—</span>
            <p className="overview__card-desc">Not connected</p>
          </div>
        )}

        {!githubResult && (
          <div className="overview__card brutal-card reveal overview__card--placeholder">
            <span className="overview__card-label">GitHub</span>
            <span className="overview__card-value">—</span>
            <p className="overview__card-desc">Not connected</p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Repositories: display results directly from context ─── */

function RepositoriesSection() {
  const { githubResult, analysisLoading } = useAnalysis();

  if (analysisLoading) {
    return (
      <section className="dash-section">
        <SectionHeader
          tag="// repositories"
          title="Repositories"
          subtitle="An overview of your GitHub repositories, languages, and pinned projects."
          rotate={-1}
        />
        <AnalysisLoading username="your username" />
      </section>
    );
  }

  return (
    <section className="dash-section">
      <SectionHeader
        tag="// repositories"
        title="Repositories"
        subtitle="An overview of your GitHub repositories, languages, and pinned projects."
        rotate={-1}
      />
      {githubResult ? (
        <div className="dash-content">
          {/* Score card */}
          <div className="analyzer__score-card brutal-card reveal-left analyzer__score-card--gh">
            <span className="analyzer__score-label">Dev Score</span>
            <span className="analyzer__score-value">{githubResult.overallScore}</span>
            <div className="analyzer__profile-info">
              <strong>@{githubResult.username}</strong>
              <span>{githubResult.name}</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="analyzer__stats-row reveal">
            {Object.entries(githubResult.stats).map(([key, val]) => (
              <div key={key} className="analyzer__stat brutal-card">
                <span className="analyzer__stat-value">{val.toLocaleString()}</span>
                <span className="analyzer__stat-label">{key}</span>
              </div>
            ))}
          </div>

          {/* Languages & Pinned repos */}
          <div className="analyzer__grid">
            <div className="analyzer__panel brutal-card reveal">
              <h3>Top Languages</h3>
              <div className="analyzer__lang-list">
                {githubResult.topLanguages?.map((lang, i) => (
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
                {githubResult.pinnedRepos?.map((repo, i) => (
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
                {githubResult.skillGaps?.map((gap, i) => (
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
      ) : (
        <div className="dash-empty brutal-card">
          <p>Run a GitHub analysis to see your repositories.</p>
        </div>
      )}
    </section>
  );
}

function SkillsSection() {
  const { linkedinResult, githubResult, analysisLoading } = useAnalysis();
  const hasData = linkedinResult || githubResult;

  const allGaps = [
    ...(linkedinResult?.skillGaps || []).map((g) => ({ ...g, source: 'LinkedIn' })),
    ...(githubResult?.skillGaps || []).map((g) => ({ ...g, source: 'GitHub' })),
  ];

  if (analysisLoading) {
    return (
      <section className="dash-section">
        <SectionHeader
          tag="// skills"
          title="Skills Analysis"
          subtitle="Detected skill gaps and strengths from your profile analyses."
          rotate={1}
        />
        <AnalysisLoading username="your username" />
      </section>
    );
  }

  return (
    <section className="dash-section">
      <SectionHeader
        tag="// skills"
        title="Skills Analysis"
        subtitle="Detected skill gaps and strengths from your profile analyses."
        rotate={1}
      />
      {hasData ? (
        <div className="dash-content">
          {allGaps.length > 0 ? (
            <div className="skills__list">
              {allGaps.map((gap, i) => (
                <div key={i} className="skills__item brutal-card reveal">
                  <div className="skills__item-header">
                    <span className="skills__item-skill">{gap.skill}</span>
                    <span className={`analyzer__severity severity-${gap.severity}`}>
                      {gap.severity}
                    </span>
                    <span className="skills__item-source">{gap.source}</span>
                  </div>
                  <p className="skills__item-rec">{gap.recommendation}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="dash-empty brutal-card">
              <p>No skill gaps detected yet.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="dash-empty brutal-card">
          <p>Run an analysis to see your skills breakdown.</p>
        </div>
      )}
    </section>
  );
}

function QualitySection() {
  const { githubResult, analysisLoading } = useAnalysis();

  if (analysisLoading) {
    return (
      <section className="dash-section">
        <SectionHeader
          tag="// quality"
          title="Repository Quality"
          subtitle="Code quality metrics, documentation, testing, and best practices."
          rotate={1}
        />
        <AnalysisLoading username="your username" />
      </section>
    );
  }

  return (
    <section className="dash-section">
      <SectionHeader
        tag="// quality"
        title="Repository Quality"
        subtitle="Code quality metrics, documentation, testing, and best practices."
        rotate={1}
      />
      {githubResult ? (
        <div className="dash-content">
          <div className="quality__stats">
            {Object.entries(githubResult.stats).map(([key, val]) => (
              <div key={key} className="quality__stat brutal-card reveal">
                <span className="quality__stat-value">{val.toLocaleString()}</span>
                <span className="quality__stat-label">{key}</span>
              </div>
            ))}
          </div>
          <div className="quality__note">
            <Sticker color="cyan" rotation={2}>coming soon</Sticker>
            <p>Detailed quality scoring will be available in a future update.</p>
          </div>
        </div>
      ) : (
        <div className="dash-empty brutal-card">
          <p>Run a GitHub analysis to see quality metrics.</p>
        </div>
      )}
    </section>
  );
}

function ReportSection() {
  const { linkedinResult, githubResult, analysisLoading } = useAnalysis();
  const hasData = linkedinResult || githubResult;

  if (analysisLoading) {
    return (
      <section className="dash-section">
        <SectionHeader
          tag="// full_report"
          title="Full Report"
          subtitle="Comprehensive analysis report combining all profile data."
          rotate={-1}
        />
        <AnalysisLoading username="your username" />
      </section>
    );
  }

  return (
    <section className="dash-section">
      <SectionHeader
        tag="// full_report"
        title="Full Report"
        subtitle="Comprehensive analysis report combining all profile data."
        rotate={-1}
      />
      {hasData ? (
        <div className="dash-content">
          <div className="report__sections">
            {linkedinResult && (
              <div className="report__block brutal-card reveal">
                <h3>LinkedIn Analysis</h3>
                <p>Score: <strong>{linkedinResult.overallScore}</strong></p>
                <p>Name: {linkedinResult.name}</p>
                <p>Headline: {linkedinResult.headline}</p>
                <p>Strengths: {linkedinResult.strengths?.join(', ')}</p>
                <p>Skill gaps: {linkedinResult.skillGaps?.length || 0} detected</p>
              </div>
            )}
            {githubResult && (
              <div className="report__block brutal-card reveal">
                <h3>GitHub Analysis</h3>
                <p>Score: <strong>{githubResult.overallScore}</strong></p>
                <p>Username: @{githubResult.username}</p>
                <p>Top languages: {githubResult.topLanguages?.map((l) => l.name).join(', ')}</p>
                <p>Repos: {githubResult.stats?.repos}, Stars: {githubResult.stats?.stars}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="dash-empty brutal-card">
          <p>Run analyses to generate your full report.</p>
        </div>
      )}
    </section>
  );
}

function ExportSection() {
  return (
    <section className="dash-section">
      <SectionHeader
        tag="// export"
        title="Export"
        subtitle="Download your analysis results and reports."
        rotate={-1}
      />
      <div className="dash-content">
        <div className="export__placeholder brutal-card">
          <Sticker color="lime" rotation={2}>coming soon</Sticker>
          <p>Export functionality will be available once backend integration is complete.</p>
        </div>
      </div>
    </section>
  );
}

function SettingsSection({ onResetOnboarding }) {
  return (
    <section className="dash-section">
      <SectionHeader
        tag="// settings"
        title="Settings"
        subtitle="Manage your Skill+ preferences and profile data."
        rotate={1}
      />
      <div className="dash-content">
        <div className="settings__panel brutal-card">
          <h3>Onboarding</h3>
          <p>Reset the onboarding flow to re-enter your profile URLs or start fresh.</p>
          <button
            className="brutal-btn brutal-btn--dark"
            onClick={onResetOnboarding}
          >
            Reset Onboarding
          </button>
        </div>
        <div className="settings__panel brutal-card">
          <h3>Data Mode</h3>
          <p>
            Current mode: <strong>{import.meta.env.VITE_USE_MOCK === 'true' ? 'Mock' : 'API'}</strong>
          </p>
          <p className="settings__hint">
            Set <code>VITE_USE_MOCK=false</code> in your .env to use the live backend.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Section map ─── */

const SECTIONS = {
  overview: OverviewSection,
  repositories: RepositoriesSection,
  skills: SkillsSection,
  quality: QualitySection,
  report: ReportSection,
  roadmap: Roadmap,
  'ai-mentor': ChatBot,
  export: ExportSection,
  settings: SettingsSection,
};

/* ─── DashboardPage ─── */

export default function DashboardPage({ onResetOnboarding }) {
  const [activeSection, setActiveSection] = useState('overview');
  const scrollRef = useScrollReveal();
  const { githubUsername, githubResult, analyzeGithub } = useAnalysis();
  const { githubUrl } = useOnboarding();

  // Auto-trigger analysis on mount: use context username first, then fall back to persisted onboarding URL
  useEffect(() => {
    const username = githubUsername || githubUrl;
    if (username && !githubResult) {
      analyzeGithub(username).catch(() => {
        // Error is stored in AnalysisContext
      });
    }
  }, []); // Only on mount

  const handleNavigate = useCallback((sectionId) => {
    setActiveSection(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const ActiveComponent = SECTIONS[activeSection] || OverviewSection;

  return (
    <div className="dashboard" ref={scrollRef}>
      <Sidebar activeSection={activeSection} onNavigate={handleNavigate} />

      <div className="dashboard__main">
        {activeSection === 'settings' ? (
          <ActiveComponent onResetOnboarding={onResetOnboarding} />
        ) : (
          <ActiveComponent />
        )}
      </div>

    </div>
  );
}
