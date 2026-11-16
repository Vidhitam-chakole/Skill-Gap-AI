import { useState, useMemo } from 'react';
import { gitHubApi } from '../../services/api';
import { useAnalysis } from '../../context/AnalysisContext';
import GitHubAutocomplete from './GitHubAutocomplete';
import {
  IconRepo,
  IconStar,
  IconFork,
  IconPullRequest,
  IconIssue,
  IconReview,
  IconDiscussion,
  IconCalendar,
  IconActivity,
  IconStreak,
  IconUsers,
  IconBuilding,
  IconGist,
  IconMapPin,
  IconLink,
  IconTwitter,
  IconClock,
  IconShield,
  IconShieldCheck,
  IconShieldAlert,
  IconLock,
  IconFileText,
  IconFolder,
  IconTerminal,
  IconDatabase,
  IconCloud,
  IconServer,
  IconCpu,
  IconLayers,
  IconTool,
  IconTestTube,
  IconEye,
  IconCheck,
  IconClose,
  IconAlertTriangle,
  IconInfo,
  IconGlobe,
  IconExternalLink,
  IconLayout,
  IconHardDrive,
  IconChart,
  IconAudit,
  IconTrendingUp,
  IconBolt,
  IconBranch,
} from './GitHubIcons';
import './GitHubDashboard.css';
import '../LinkedInAnalyzer/Analyzer.css';

// Developer Tier Classifier based on the ONE Developer Intelligence Score
function getScoreRank(score) {
  if (score >= 90) return { title: 'Principal Systems Architect', tier: 'Tier 5 · Elite', color: '#16a34a' };
  if (score >= 80) return { title: 'Senior Staff Polyglot', tier: 'Tier 4 · Advanced', color: '#00e5ff' };
  if (score >= 70) return { title: 'Proficient Full-Stack Specialist', tier: 'Tier 3 · Proficient', color: '#b8ff00' };
  if (score >= 55) return { title: 'Emerging Core Developer', tier: 'Tier 2 · Competent', color: '#ffe600' };
  return { title: 'Junior Software Crafter', tier: 'Tier 1 · Foundational', color: '#ff8c42' };
}

export default function GitHubAnalyzer() {
  const { githubResult, setGithubResult, setRoadmap, startVerification } = useAnalysis();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview | heatmap | tech | repos | audit | community
  const [hoveredDay, setHoveredDay] = useState(null);
  const [techFilter, setTechFilter] = useState('all');
  const [repoSearch, setRepoSearch] = useState('');
  const [repoLangFilter, setRepoLangFilter] = useState('all');
  const [repoTypeFilter, setRepoTypeFilter] = useState('all');
  const [repoSort, setRepoSort] = useState('stars');
  const [expandedRepo, setExpandedRepo] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedVerifyLang, setSelectedVerifyLang] = useState('');

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
      setRoadmap(null); // Reset roadmap so user can synthesize a fresh combined roadmap
    } catch (err) {
      setError(err.message || 'GitHub analysis failed. Please verify the username or profile link.');
    } finally {
      setLoading(false);
    }
  };

  // Safe defaults and fallbacks for data
  const profile = results?.profile || {};
  const stats = results?.stats || {};
  const topLanguages = results?.topLanguages || [];
  const allRepositories = results?.allRepositories || [];
  const techStack = results?.techStack || {
    languages: [],
    frameworks: [],
    backend: [],
    frontend: [],
    databases: [],
    devops: [],
    testing: [],
    tools: [],
  };
  const activity = results?.activity || {
    dayOfWeekDistribution: {},
    timeOfDayDistribution: {},
    recentCommitMessages: [],
  };
  const contributions = results?.contributions || { calendar: [], monthlyTrends: [] };
  const collaboration = results?.collaboration || {};
  const organizations = results?.organizations || [];
  const gists = results?.gists || [];
  const evidenceMap = results?.evidenceMap || [];
  const engineeringAudit = results?.engineeringAudit || {};
  const securityAudit = results?.securityAudit || {};
  const dataProvenance = results?.dataProvenance || {
    verifiedLiveMetrics: [],
    inferredInsights: [],
    unavailableData: [],
  };

  // Distinct programming languages extracted for skill verification
  const userLanguages = useMemo(() => {
    const list = [];
    const seen = new Set();
    const addLang = (name, percentage = null, color = null) => {
      if (!name || typeof name !== 'string') return;
      const clean = name.trim();
      const lower = clean.toLowerCase();
      if (!clean || seen.has(lower) || lower === 'unknown' || lower === 'general code') return;
      seen.add(lower);
      list.push({ name: clean, percentage, color: color || '#00e5ff' });
    };

    if (results?.primaryLanguage) {
      addLang(results.primaryLanguage, null, '#ff6b1a');
    }
    topLanguages.forEach((l) => {
      addLang(l.name, l.percentage, l.color);
    });
    (techStack?.languages || []).forEach((tl) => {
      const name = typeof tl === 'string' ? tl : tl.name;
      addLang(name);
    });
    return list;
  }, [results?.primaryLanguage, topLanguages, techStack?.languages]);

  const scoreRank = useMemo(() => {
    return results ? getScoreRank(results.overallScore) : null;
  }, [results?.overallScore]);

  // Account longevity / years on GitHub
  const accountYears = useMemo(() => {
    if (profile.accountAgeYears && profile.accountAgeYears > 0) {
      return profile.accountAgeYears;
    }
    if (profile.createdAt) {
      const diffYears = (new Date() - new Date(profile.createdAt)) / (365.25 * 24 * 3600 * 1000);
      return Math.max(0.1, Math.round(diffYears * 10) / 10);
    }
    return null;
  }, [profile.accountAgeYears, profile.createdAt]);

  const joinedYear = useMemo(() => {
    if (profile.createdAt) {
      try {
        return new Date(profile.createdAt).getFullYear();
      } catch {
        return null;
      }
    }
    return null;
  }, [profile.createdAt]);

  // Heatmap Weeks arrangement (52 weeks x 7 days)
  const heatmapWeeks = useMemo(() => {
    if (!contributions.calendar || contributions.calendar.length === 0) return [];
    const weeks = [];
    let currentWeek = [];
    contributions.calendar.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === contributions.calendar.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    return weeks;
  }, [contributions.calendar]);

  // Filtered and Sorted Repositories
  const filteredRepos = useMemo(() => {
    return allRepositories
      .filter((r) => {
        if (repoSearch) {
          const q = repoSearch.toLowerCase();
          const matchName = r.name?.toLowerCase().includes(q);
          const matchDesc = r.description?.toLowerCase().includes(q);
          const matchTopics = r.topics?.some((t) => t.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchTopics) return false;
        }
        if (repoLangFilter !== 'all') {
          if ((r.language || '').toLowerCase() !== repoLangFilter.toLowerCase()) return false;
        }
        if (repoTypeFilter === 'original' && r.isFork) return false;
        if (repoTypeFilter === 'forks' && !r.isFork) return false;
        return true;
      })
      .sort((a, b) => {
        if (repoSort === 'stars') return (b.stars || 0) - (a.stars || 0);
        if (repoSort === 'forks') return (b.forks || 0) - (a.forks || 0);
        if (repoSort === 'size') return (b.sizeKb || 0) - (a.sizeKb || 0);
        if (repoSort === 'updated') {
          return new Date(b.pushedAt || b.updatedAt || 0) - new Date(a.pushedAt || a.updatedAt || 0);
        }
        return 0;
      });
  }, [allRepositories, repoSearch, repoLangFilter, repoTypeFilter, repoSort]);

  // Unique languages for repository filter dropdown
  const repoLanguages = useMemo(() => {
    const set = new Set();
    allRepositories.forEach((r) => {
      if (r.language) set.add(r.language);
    });
    return Array.from(set).sort();
  }, [allRepositories]);

  // Max value for monthly chart
  const maxMonthlyCount = useMemo(() => {
    if (!contributions.monthlyTrends || contributions.monthlyTrends.length === 0) return 1;
    return Math.max(...contributions.monthlyTrends.map((m) => m.count || 0), 1);
  }, [contributions.monthlyTrends]);

  // Max value for day of week chart
  const maxDayCount = useMemo(() => {
    const vals = Object.values(activity.dayOfWeekDistribution || {});
    return Math.max(...vals, 1);
  }, [activity.dayOfWeekDistribution]);

  // SVG Dial Math for the ONE Developer Intelligence Score (r=62, c=2*pi*r=389.55)
  const dialRadius = 62;
  const dialCircumference = 2 * Math.PI * dialRadius;
  const dialOffset = results
    ? dialCircumference - (Math.min(Math.max(results.overallScore, 0), 100) / 100) * dialCircumference
    : dialCircumference;

  return (
    <section id="github" className="analyzer analyzer--github">
      {/* Search & Analyze Input Form */}
      <form
        className="analyzer__form brutal-card reveal"
        onSubmit={(e) => handleAnalyze(e)}
        style={{ position: 'relative', zIndex: 30 }}
      >
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
            placeholder="e.g. torvalds, shadcn, or https://github.com/torvalds"
          />
          <button
            type="submit"
            className="brutal-btn brutal-btn--primary"
            disabled={loading}
            aria-label="Analyze public GitHub profile"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </form>

      {error && <div className="analyzer__error reveal">{error}</div>}

      {results && (
        <div className="gh-dashboard">
          {/* ─────────────────────────────────────────────────────────────
              1. EXECUTIVE IDENTITY & ONE OVERALL INTELLIGENCE SCORE
             ───────────────────────────────────────────────────────────── */}
          <div className="gh-hero">
            {/* The ONLY Score Displayed: 0-100 */}
            <div className="gh-score-card">
              <span className="gh-score-badge">Developer Intelligence</span>

              <div className="gh-score-dial">
                <svg className="gh-score-svg" viewBox="0 0 160 160">
                  <circle
                    className="gh-score-bg-circle"
                    cx="80"
                    cy="80"
                    r={dialRadius}
                    fill="none"
                    strokeWidth="14"
                  />
                  <circle
                    className="gh-score-bar-circle"
                    cx="80"
                    cy="80"
                    r={dialRadius}
                    fill="none"
                    strokeWidth="14"
                    strokeDasharray={dialCircumference}
                    strokeDashoffset={dialOffset}
                  />
                </svg>
                <div className="gh-score-inner">
                  <span className="gh-score-value">{results.overallScore}</span>
                  <span className="gh-score-max">/ 100</span>
                </div>
              </div>

              <div className="gh-score-rank" style={{ borderColor: 'var(--black)' }}>
                {scoreRank?.title}
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, marginTop: '0.35rem', color: '#1f2937' }}>
                {scoreRank?.tier}
              </span>
            </div>

            {/* Profile Identity Card */}
            <div className="gh-profile-card">
              <div className="gh-profile-top">
                <div className="gh-avatar-wrap">
                  <img
                    src={profile.avatarUrl || results.stats?.avatar_url || `https://github.com/${results.username}.png`}
                    alt={results.name || results.username}
                    className="gh-avatar"
                  />
                  <span className="gh-online-dot" title="Active Public Profile" />
                </div>

                <div className="gh-profile-details">
                  <div className="gh-profile-name-row">
                    <h2 className="gh-profile-name">{results.name || results.username}</h2>
                    <span className="gh-profile-username">@{results.username}</span>
                    {accountYears !== null && (
                      <span
                        className="gh-tenure-badge"
                        title={joinedYear ? `Member since ${joinedYear}` : 'Account Longevity'}
                      >
                        <IconClock size={13} />
                        <span>
                          {accountYears >= 1
                            ? `${accountYears} ${accountYears === 1 ? 'Year' : 'Years'} on GitHub`
                            : `${Math.max(1, Math.round(accountYears * 12))} Months on GitHub`}
                        </span>
                        {joinedYear && <span className="gh-tenure-year">· Since {joinedYear}</span>}
                      </span>
                    )}
                  </div>

                  {profile.bio && <p className="gh-profile-bio">{profile.bio}</p>}

                  <div className="gh-meta-badges">
                    {profile.company && (
                      <span className="gh-meta-pill" title="Organization">
                        <IconBuilding size={13} /> {profile.company}
                      </span>
                    )}
                    {profile.location && (
                      <span className="gh-meta-pill" title="Location">
                        <IconMapPin size={13} /> {profile.location}
                      </span>
                    )}
                    {profile.blog && (
                      <a
                        href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`}
                        target="_blank"
                        rel="noreferrer"
                        className="gh-meta-pill gh-meta-pill--link"
                        title="Website / Portfolio"
                      >
                        <IconLink size={13} /> {profile.blog.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                    {profile.twitterUsername && (
                      <a
                        href={`https://x.com/${profile.twitterUsername}`}
                        target="_blank"
                        rel="noreferrer"
                        className="gh-meta-pill"
                        title="Twitter / X"
                      >
                        <IconTwitter size={13} /> @{profile.twitterUsername}
                      </a>
                    )}
                    {profile.hireable && (
                      <span className="gh-meta-pill gh-meta-pill--hireable" title="Hireable Status">
                        <span className="gh-status-dot gh-status-dot--live" /> Available for Hire
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Formatted Key Repository & Developer Metrics Grid (Replaces Provenance Box) */}
              <div className="gh-profile-stats-grid">
                <div className="gh-profile-stat-box">
                  <div className="gh-profile-stat-header">
                    <span className="gh-profile-stat-label">Public Repos</span>
                    <span className="gh-profile-stat-icon"><IconRepo size={15} /></span>
                  </div>
                  <span className="gh-profile-stat-value">{stats.repos || 0}</span>
                </div>

                <div className="gh-profile-stat-box">
                  <div className="gh-profile-stat-header">
                    <span className="gh-profile-stat-label">Total Stars</span>
                    <span className="gh-profile-stat-icon"><IconStar size={15} /></span>
                  </div>
                  <span className="gh-profile-stat-value">{stats.stars || 0}</span>
                </div>

                <div className="gh-profile-stat-box">
                  <div className="gh-profile-stat-header">
                    <span className="gh-profile-stat-label">Total Forks</span>
                    <span className="gh-profile-stat-icon"><IconFork size={15} /></span>
                  </div>
                  <span className="gh-profile-stat-value">{stats.forks || 0}</span>
                </div>

                <div className="gh-profile-stat-box">
                  <div className="gh-profile-stat-header">
                    <span className="gh-profile-stat-label">Annual Commits</span>
                    <span className="gh-profile-stat-icon"><IconActivity size={15} /></span>
                  </div>
                  <span className="gh-profile-stat-value">{contributions.totalLastYear || stats.contributions || 0}</span>
                </div>

                <div className="gh-profile-stat-box">
                  <div className="gh-profile-stat-header">
                    <span className="gh-profile-stat-label">Longest Streak</span>
                    <span className="gh-profile-stat-icon"><IconStreak size={15} /></span>
                  </div>
                  <span className="gh-profile-stat-value">{contributions.longestStreak || 0}d</span>
                </div>

                <div className="gh-profile-stat-box">
                  <div className="gh-profile-stat-header">
                    <span className="gh-profile-stat-label">Followers</span>
                    <span className="gh-profile-stat-icon"><IconUsers size={15} /></span>
                  </div>
                  <span className="gh-profile-stat-value">{stats.followers || 0}</span>
                </div>

                <div className="gh-profile-stat-box">
                  <div className="gh-profile-stat-header">
                    <span className="gh-profile-stat-label">Public Gists</span>
                    <span className="gh-profile-stat-icon"><IconGist size={15} /></span>
                  </div>
                  <span className="gh-profile-stat-value">{stats.gists || 0}</span>
                </div>

                <div className="gh-profile-stat-box">
                  <div className="gh-profile-stat-header">
                    <span className="gh-profile-stat-label">Organizations</span>
                    <span className="gh-profile-stat-icon"><IconBuilding size={15} /></span>
                  </div>
                  <span className="gh-profile-stat-value">{organizations.length || stats.organizations || 0}</span>
                </div>
              </div>

              <div className="gh-profile-actions" style={{ justifyContent: 'flex-end' }}>
                <a
                  href={`https://github.com/${results.username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="gh-github-link-btn"
                >
                  <span>View on GitHub</span>
                  <IconExternalLink size={13} />
                </a>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              3. DASHBOARD NAVIGATION TABS
             ───────────────────────────────────────────────────────────── */}
          <nav
            className="gh-nav-tabs"
            aria-label="GitHub Analytics Sections"
            style={{ overflow: 'visible', overflowX: 'visible', flexWrap: 'wrap' }}
          >
            <button
              type="button"
              className={`gh-nav-btn ${activeTab === 'overview' ? 'gh-nav-btn--active' : ''}`}
              onClick={() => setActiveTab('overview')}
              style={{
                color: '#000000',
                background: activeTab === 'overview' ? 'var(--cyan, #00e5ff)' : '#ffffff',
              }}
            >
              <IconChart size={15} style={{ stroke: '#000000', color: '#000000' }} />
              <span style={{ color: '#000000', fontWeight: 900 }}>Executive Overview</span>
            </button>
            <button
              type="button"
              className={`gh-nav-btn ${activeTab === 'heatmap' ? 'gh-nav-btn--active' : ''}`}
              onClick={() => setActiveTab('heatmap')}
              style={{
                color: '#000000',
                background: activeTab === 'heatmap' ? 'var(--cyan, #00e5ff)' : '#ffffff',
              }}
            >
              <IconCalendar size={15} style={{ stroke: '#000000', color: '#000000' }} />
              <span style={{ color: '#000000', fontWeight: 900 }}>Heatmap &amp; Activity</span>
            </button>
            <button
              type="button"
              className={`gh-nav-btn ${activeTab === 'tech' ? 'gh-nav-btn--active' : ''}`}
              onClick={() => setActiveTab('tech')}
              style={{
                color: '#000000',
                background: activeTab === 'tech' ? 'var(--cyan, #00e5ff)' : '#ffffff',
              }}
            >
              <IconLayers size={15} style={{ stroke: '#000000', color: '#000000' }} />
              <span style={{ color: '#000000', fontWeight: 900 }}>Tech Stack &amp; Evidence</span>
            </button>
            <button
              type="button"
              className={`gh-nav-btn ${activeTab === 'repos' ? 'gh-nav-btn--active' : ''}`}
              onClick={() => setActiveTab('repos')}
              style={{
                color: '#000000',
                background: activeTab === 'repos' ? 'var(--cyan, #00e5ff)' : '#ffffff',
              }}
            >
              <IconRepo size={15} style={{ stroke: '#000000', color: '#000000' }} />
              <span style={{ color: '#000000', fontWeight: 900 }}>Repository Explorer ({allRepositories.length})</span>
            </button>
            <button
              type="button"
              className={`gh-nav-btn ${activeTab === 'audit' ? 'gh-nav-btn--active' : ''}`}
              onClick={() => setActiveTab('audit')}
              style={{
                color: '#000000',
                background: activeTab === 'audit' ? 'var(--cyan, #00e5ff)' : '#ffffff',
              }}
            >
              <IconShield size={15} style={{ stroke: '#000000', color: '#000000' }} />
              <span style={{ color: '#000000', fontWeight: 900 }}>.ENV &amp; Secret Security</span>
            </button>
            <button
              type="button"
              className={`gh-nav-btn ${activeTab === 'community' ? 'gh-nav-btn--active' : ''}`}
              onClick={() => setActiveTab('community')}
              style={{
                color: '#000000',
                background: activeTab === 'community' ? 'var(--cyan, #00e5ff)' : '#ffffff',
              }}
            >
              <IconUsers size={15} style={{ stroke: '#000000', color: '#000000' }} />
              <span style={{ color: '#000000', fontWeight: 900 }}>Community &amp; Collaboration</span>
            </button>
          </nav>

          {/* ─────────────────────────────────────────────────────────────
              TAB 1: EXECUTIVE OVERVIEW
             ───────────────────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="gh-tab-panel">
              {/* Languages Breakdown & Verified Skills Action */}
              <div className="gh-card">
                <div className="gh-card-header">
                  <div>
                    <h3 className="gh-card-title">
                      <IconGlobe size={18} />
                      <span>Polyglot Language Breakdown</span>
                    </h3>
                    <p className="gh-card-subtitle">
                      Byte-weighted distribution calculated across all public repositories
                    </p>
                  </div>
                </div>

                {/* Segmented Color Spectrum Bar */}
                <div className="gh-lang-spectrum">
                  {topLanguages.map((lang, idx) => (
                    <div
                      key={idx}
                      className="gh-lang-segment"
                      style={{
                        width: `${lang.percentage}%`,
                        backgroundColor: lang.color || '#00e5ff',
                      }}
                      title={`${lang.name}: ${lang.percentage}%`}
                    />
                  ))}
                </div>

                {/* Clean Language Cards Grid without repetitive verify buttons */}
                <div className="gh-lang-grid">
                  {topLanguages.map((lang, idx) => (
                    <div key={idx} className="gh-lang-item">
                      <div className="gh-lang-name-wrap">
                        <span className="gh-lang-dot" style={{ backgroundColor: lang.color || '#00e5ff' }} />
                        <span style={{ fontWeight: 800, color: '#000000' }}>{lang.name}</span>
                      </div>
                      <span className="gh-lang-pct" style={{ fontWeight: 900, color: '#000000' }}>{lang.percentage}%</span>
                    </div>
                  ))}
                </div>

                {/* Single Bottom Verification Banner */}
                {userLanguages.length > 0 && (
                  <div className="gh-verify-banner">
                    <div>
                      <h4 className="gh-verify-banner-title">
                        <IconShield size={18} />
                        <span>Skill Verification Assessment</span>
                      </h4>
                      <p className="gh-verify-banner-desc">
                        Validate and prove your technical mastery across {userLanguages.length} detected GitHub {userLanguages.length === 1 ? 'language' : 'languages'}.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="brutal-btn"
                      style={{
                        background: 'var(--cyan, #00e5ff)',
                        color: '#000000',
                        fontWeight: 900,
                        padding: '0.65rem 1.25rem',
                        border: '3px solid #000000',
                        boxShadow: '4px 4px 0 #000000',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                      }}
                      onClick={() => {
                        if (!selectedVerifyLang && userLanguages[0]) {
                          setSelectedVerifyLang(userLanguages[0].name);
                        }
                        setShowVerifyModal(true);
                      }}
                    >
                      <IconCheck size={16} />
                      <span>Verify Coding Skills &rarr;</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Featured Repositories Snapshot */}
              <div className="gh-card">
                <div className="gh-card-header">
                  <div>
                    <h3 className="gh-card-title">
                      <IconStar size={18} />
                      <span>Featured Repositories</span>
                    </h3>
                    <p className="gh-card-subtitle">Top repositories sorted by community engagement and activity</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('repos')}
                    className="brutal-btn"
                    style={{
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      background: 'var(--yellow)',
                      border: '2px solid var(--black)',
                    }}
                  >
                    View All {allRepositories.length} Repositories &rarr;
                  </button>
                </div>

                <div className="gh-repos-list">
                  {(results.pinnedRepos || []).map((repo, i) => (
                    <div key={i} className="gh-repo-card">
                      <div>
                        <div className="gh-repo-header">
                          <a
                            href={repo.htmlUrl || `https://github.com/${results.username}/${repo.name}`}
                            target="_blank"
                            rel="noreferrer"
                            className="gh-repo-title"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <span>{repo.name}</span>
                            <IconExternalLink size={12} />
                          </a>
                        </div>
                        {repo.description && <p className="gh-repo-desc">{repo.description}</p>}
                      </div>
                      <div className="gh-repo-stats-row">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <IconStar size={13} /> {repo.stars} stars
                        </span>
                        {repo.forks !== undefined && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <IconFork size={13} /> {repo.forks} forks
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engineering Highlights Quick Banner */}
              <div className="gh-habits-grid">
                <div className="gh-card" style={{ background: '#f0fdf4', border: '3px solid #16a34a' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <IconShieldCheck size={18} />
                    <span>Engineering Hygiene Quick Audit</span>
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.85rem', fontWeight: 700 }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <IconTestTube size={15} />
                      <span>Automated Tests Detected: </span>
                      <strong style={{ color: engineeringAudit.testAdoptionRate > 0 ? '#16a34a' : '#dc2626' }}>
                        {engineeringAudit.testAdoptionRate}% of inspected codebases
                      </strong>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <IconBranch size={15} />
                      <span>CI/CD Pipelines Active: </span>
                      <strong style={{ color: engineeringAudit.ciCdAdoptionRate > 0 ? '#16a34a' : '#6b7280' }}>
                        {engineeringAudit.ciCdAdoptionRate}% of inspected codebases
                      </strong>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <IconFileText size={15} />
                      <span>Open Source Documentation: </span>
                      <strong style={{ color: '#16a34a' }}>
                        {engineeringAudit.documentationHealthRate}% with README documentation
                      </strong>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <IconLock size={15} />
                      <span>Exposed Secrets Status: </span>
                      <strong style={{ color: securityAudit.riskLevel === 'High' ? '#dc2626' : '#16a34a' }}>
                        {securityAudit.statusMessage}
                      </strong>
                    </li>
                  </ul>
                </div>

                <div className="gh-card" style={{ background: '#eff6ff', border: '3px solid #2563eb' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <IconActivity size={18} />
                    <span>Contribution Velocity &amp; Habit Rhythm</span>
                  </h4>
                  <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '0.5rem' }}>
                    Pattern Verdict: {activity.codingHabitVerdict}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>
                    Recorded <strong>{contributions.totalLastYear || stats.contributions || 0} contributions</strong> in the last 365 days, maintaining an active streak peak of <strong>{contributions.longestStreak || 0} consecutive days</strong>.
                  </p>
                  <div style={{ marginTop: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('heatmap')}
                      className="brutal-btn"
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        background: 'var(--white)',
                        border: '2px solid var(--black)',
                      }}
                    >
                      Inspect 365-Day Calendar &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 2: CONTRIBUTION HEATMAP & ACTIVITY TRENDS
             ───────────────────────────────────────────────────────────── */}
          {activeTab === 'heatmap' && (
            <div className="gh-tab-panel">
              {/* 365-Day Contribution Heatmap */}
              <div className="gh-card">
                <div className="gh-card-header">
                  <div>
                    <h3 className="gh-card-title">
                      <IconCalendar size={18} />
                      <span>365-Day Contribution Heatmap</span>
                    </h3>
                    <p className="gh-card-subtitle">
                      Daily commit activity and contribution matrix extracted from GitHub
                    </p>
                  </div>
                  {hoveredDay && (
                    <div className="gh-meta-pill" style={{ background: 'var(--yellow)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <IconCalendar size={13} />
                      <span>{hoveredDay.date}: <strong>{hoveredDay.count} contribution{hoveredDay.count !== 1 ? 's' : ''}</strong></span>
                    </div>
                  )}
                </div>

                <div className="gh-heatmap-wrap">
                  <div className="gh-heatmap-grid">
                    {/* Months header */}
                    <div className="gh-heatmap-months">
                      {['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'].map(
                        (m, i) => (
                          <span key={i} className="gh-heatmap-month-label">
                            {m}
                          </span>
                        )
                      )}
                    </div>

                    <div className="gh-heatmap-body">
                      {/* Weekday indicators */}
                      <div className="gh-heatmap-days-legend">
                        <span>Mon</span>
                        <span>Wed</span>
                        <span>Fri</span>
                      </div>

                      {/* Weeks grid */}
                      <div className="gh-heatmap-weeks">
                        {heatmapWeeks.map((week, wIdx) => (
                          <div key={wIdx} className="gh-heatmap-col">
                            {week.map((day, dIdx) => (
                              <div
                                key={dIdx}
                                className={`gh-heat-cell gh-heat-${Math.min(day.level || 0, 4)}`}
                                onMouseEnter={() => setHoveredDay(day)}
                                onMouseLeave={() => setHoveredDay(null)}
                                title={`${day.date}: ${day.count} contributions (Level ${day.level})`}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="gh-heatmap-footer">
                  <div className="gh-heat-legend">
                    <span>Less</span>
                    <span className="gh-heat-cell gh-heat-0" />
                    <span className="gh-heat-cell gh-heat-1" />
                    <span className="gh-heat-cell gh-heat-2" />
                    <span className="gh-heat-cell gh-heat-3" />
                    <span className="gh-heat-cell gh-heat-4" />
                    <span>More</span>
                  </div>

                  <div className="gh-streak-badges">
                    <span className="gh-streak-item">
                      <IconActivity size={13} /> Total Last Year: <strong>{contributions.totalLastYear || 0}</strong>
                    </span>
                    <span className="gh-streak-item">
                      <IconStreak size={13} /> Longest Streak: <strong>{contributions.longestStreak || 0} days</strong>
                    </span>
                    <span className="gh-streak-item">
                      <IconTrendingUp size={13} /> Current Streak: <strong>{contributions.currentStreak || 0} days</strong>
                    </span>
                    <span className="gh-streak-item">
                      <IconCalendar size={13} /> Active Days: <strong>{contributions.activeDaysCount || 0}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Monthly Contribution Trends Bar Chart */}
              {contributions.monthlyTrends && contributions.monthlyTrends.length > 0 && (
                <div className="gh-card">
                  <div className="gh-card-header">
                    <div>
                      <h3 className="gh-card-title">
                        <IconTrendingUp size={18} />
                        <span>12-Month Contribution Trajectory</span>
                      </h3>
                      <p className="gh-card-subtitle">Monthly activity output and momentum curve</p>
                    </div>
                  </div>

                  <div className="gh-monthly-chart">
                    {contributions.monthlyTrends.map((m, i) => {
                      const heightPct = Math.max(Math.round((m.count / maxMonthlyCount) * 100), 6);
                      return (
                        <div key={i} className="gh-month-col">
                          <span className="gh-month-val">{m.count}</span>
                          <div className="gh-month-bar-wrap">
                            <div className="gh-month-bar" style={{ height: `${heightPct}%` }} />
                          </div>
                          <span className="gh-month-label">{m.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Day of Week & Hour of Day Coding Habits */}
              <div className="gh-habits-grid">
                {/* Day of Week Bar Chart */}
                <div className="gh-card">
                  <div className="gh-card-header">
                    <div>
                      <h4 className="gh-card-title">
                        <IconCalendar size={16} />
                        <span>Day of Week Commit Frequency</span>
                      </h4>
                      <p className="gh-card-subtitle">Weekly coding intensity distribution</p>
                    </div>
                  </div>

                  <div className="gh-bars-list">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                      const count = activity.dayOfWeekDistribution[day] || 0;
                      const widthPct = Math.round((count / maxDayCount) * 100);
                      return (
                        <div key={day} className="gh-bar-row">
                          <div className="gh-bar-header">
                            <span>{day}</span>
                            <span>{count} event{count !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="gh-bar-track">
                            <div className="gh-bar-fill" style={{ width: `${Math.max(widthPct, 2)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Time of Day Clock */}
                <div className="gh-card">
                  <div className="gh-card-header">
                    <div>
                      <h4 className="gh-card-title">
                        <IconClock size={16} />
                        <span>Time of Day Coding Rhythm</span>
                      </h4>
                      <p className="gh-card-subtitle">Productivity windows and diurnal habits</p>
                    </div>
                    <span className="gh-meta-pill" style={{ background: 'var(--lime)' }}>
                      {activity.codingHabitVerdict.split('(')[0]}
                    </span>
                  </div>

                  <div className="gh-bars-list">
                    {Object.entries(activity.timeOfDayDistribution || {}).map(([slot, count]) => {
                      const totalTimeEvents = Object.values(activity.timeOfDayDistribution).reduce((a, b) => a + b, 0) || 1;
                      const pct = Math.round((count / totalTimeEvents) * 100);
                      return (
                        <div key={slot} className="gh-bar-row">
                          <div className="gh-bar-header">
                            <span>{slot}</span>
                            <span>{count} ({pct}%)</span>
                          </div>
                          <div className="gh-bar-track">
                            <div
                              className="gh-bar-fill"
                              style={{ width: `${Math.max(pct, 2)}%`, background: 'var(--cyan)' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {activity.recentCommitMessages && activity.recentCommitMessages.length > 0 && (
                    <div style={{ marginTop: '1.25rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#4b5563' }}>
                        Recent Public Commit Messages:
                      </span>
                      <div className="gh-commit-feed" style={{ marginTop: '0.4rem' }}>
                        {activity.recentCommitMessages.map((msg, i) => (
                          <div key={i} className="gh-commit-item">
                            <span className="gh-commit-dot" />
                            <span style={{ fontWeight: 600 }}>{msg}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 3: TECH STACK, LIBRARIES & EVIDENCE MAP
             ───────────────────────────────────────────────────────────── */}
          {activeTab === 'tech' && (
            <div className="gh-tab-panel">
              {/* Categorized Technology Stack Grid */}
              <div className="gh-card">
                <div className="gh-card-header">
                  <div>
                    <h3 className="gh-card-title">
                      <IconLayers size={18} />
                      <span>Detected Technology Stacks &amp; Libraries</span>
                    </h3>
                    <p className="gh-card-subtitle">
                      Extracted from package.json, requirements.txt, go.mod, Cargo.toml, and repo file trees
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {['all', 'frontend', 'backend', 'databases', 'devops', 'testing', 'tools'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setTechFilter(cat)}
                        className={`gh-meta-pill ${techFilter === cat ? 'gh-meta-pill--link' : ''}`}
                        style={{ cursor: 'pointer', textTransform: 'capitalize' }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {(techFilter === 'all' || techFilter === 'frontend') && techStack.frontend?.length > 0 && (
                    <div className="gh-tech-cat-group">
                      <h4 className="gh-tech-cat-title">
                        <IconLayout size={16} />
                        <span>Frontend &amp; UI Frameworks</span>
                      </h4>
                      <div className="gh-tech-pills">
                        {techStack.frontend.map((t, i) => (
                          <span key={i} className="gh-tech-pill">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(techFilter === 'all' || techFilter === 'backend') && techStack.backend?.length > 0 && (
                    <div className="gh-tech-cat-group">
                      <h4 className="gh-tech-cat-title">
                        <IconServer size={16} />
                        <span>Backend, APIs &amp; Server Frameworks</span>
                      </h4>
                      <div className="gh-tech-pills">
                        {techStack.backend.map((t, i) => (
                          <span key={i} className="gh-tech-pill">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(techFilter === 'all' || techFilter === 'databases') && techStack.databases?.length > 0 && (
                    <div className="gh-tech-cat-group">
                      <h4 className="gh-tech-cat-title">
                        <IconDatabase size={16} />
                        <span>Databases, ORMs &amp; Storage</span>
                      </h4>
                      <div className="gh-tech-pills">
                        {techStack.databases.map((t, i) => (
                          <span key={i} className="gh-tech-pill">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(techFilter === 'all' || techFilter === 'devops') && techStack.devops?.length > 0 && (
                    <div className="gh-tech-cat-group">
                      <h4 className="gh-tech-cat-title">
                        <IconCloud size={16} />
                        <span>DevOps, Cloud &amp; CI/CD</span>
                      </h4>
                      <div className="gh-tech-pills">
                        {techStack.devops.map((t, i) => (
                          <span key={i} className="gh-tech-pill">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(techFilter === 'all' || techFilter === 'testing') && techStack.testing?.length > 0 && (
                    <div className="gh-tech-cat-group">
                      <h4 className="gh-tech-cat-title">
                        <IconTestTube size={16} />
                        <span>Testing &amp; QA Frameworks</span>
                      </h4>
                      <div className="gh-tech-pills">
                        {techStack.testing.map((t, i) => (
                          <span key={i} className="gh-tech-pill">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(techFilter === 'all' || techFilter === 'tools') && techStack.tools?.length > 0 && (
                    <div className="gh-tech-cat-group">
                      <h4 className="gh-tech-cat-title">
                        <IconTool size={16} />
                        <span>Build Tools, Linters &amp; Utilities</span>
                      </h4>
                      <div className="gh-tech-pills">
                        {techStack.tools.map((t, i) => (
                          <span key={i} className="gh-tech-pill">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Skill-to-Project Evidence Map */}
              <div className="gh-card">
                <div className="gh-card-header">
                  <div>
                    <h3 className="gh-card-title">
                      <IconAudit size={18} />
                      <span>Skill-to-Project Evidence Map</span>
                    </h3>
                    <p className="gh-card-subtitle">
                      Direct cross-referencing showing exact repositories that substantiate claimed competencies
                    </p>
                  </div>
                </div>

                <div className="gh-evidence-grid">
                  {evidenceMap.map((item, i) => (
                    <div key={i} className="gh-evidence-card">
                      <div className="gh-evidence-header">
                        <span className="gh-evidence-skill">{item.skill}</span>
                        <span className="gh-evidence-category">{item.category}</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#374151', margin: 0 }}>
                        {item.evidenceSnippet}
                      </p>
                      <div className="gh-evidence-repos">
                        {item.repos?.map((repoName, rIdx) => (
                          <span key={rIdx} className="gh-evidence-repo-tag" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <IconFolder size={12} />
                            <span>{repoName}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 4: REPOSITORY DEEP-DIVE EXPLORER
             ───────────────────────────────────────────────────────────── */}
          {activeTab === 'repos' && (
            <div className="gh-tab-panel">
              <div className="gh-card">
                <div className="gh-card-header">
                  <div>
                    <h3 className="gh-card-title">
                      <IconRepo size={18} />
                      <span>Interactive Repository Catalog</span>
                    </h3>
                    <p className="gh-card-subtitle">
                      Inspect {allRepositories.length} public repositories, root trees, dependencies, and testing indicators
                    </p>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="gh-filter-bar">
                  <input
                    type="text"
                    placeholder="Search by repo name or topic..."
                    value={repoSearch}
                    onChange={(e) => setRepoSearch(e.target.value)}
                    className="gh-search-input"
                    style={{ color: '#000000', backgroundColor: '#ffffff', colorScheme: 'light' }}
                  />

                  <select
                    value={repoLangFilter}
                    onChange={(e) => setRepoLangFilter(e.target.value)}
                    className="gh-select"
                    style={{ color: '#000000', backgroundColor: '#ffffff', colorScheme: 'light' }}
                  >
                    <option value="all" style={{ color: '#000000', backgroundColor: '#ffffff' }}>All Languages</option>
                    {repoLanguages.map((l) => (
                      <option key={l} value={l} style={{ color: '#000000', backgroundColor: '#ffffff' }}>
                        {l}
                      </option>
                    ))}
                  </select>

                  <select
                    value={repoTypeFilter}
                    onChange={(e) => setRepoTypeFilter(e.target.value)}
                    className="gh-select"
                    style={{ color: '#000000', backgroundColor: '#ffffff', colorScheme: 'light' }}
                  >
                    <option value="all" style={{ color: '#000000', backgroundColor: '#ffffff' }}>All Repositories</option>
                    <option value="original" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Original Sources Only</option>
                    <option value="forks" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Forks Only</option>
                  </select>

                  <select
                    value={repoSort}
                    onChange={(e) => setRepoSort(e.target.value)}
                    className="gh-select"
                    style={{ color: '#000000', backgroundColor: '#ffffff', colorScheme: 'light' }}
                  >
                    <option value="stars" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Most Stars</option>
                    <option value="forks" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Most Forks</option>
                    <option value="updated" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Recently Pushed</option>
                    <option value="size" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Largest Codebase</option>
                  </select>
                </div>

                {/* Repository Cards Grid */}
                <div className="gh-repos-list">
                  {filteredRepos.map((repo, i) => {
                    const isExpanded = expandedRepo === repo.name;
                    return (
                      <div key={i} className="gh-repo-card">
                        <div>
                          <div className="gh-repo-header">
                            <div>
                              <a
                                href={repo.htmlUrl || `https://github.com/${results.username}/${repo.name}`}
                                target="_blank"
                                rel="noreferrer"
                                className="gh-repo-title"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                              >
                                <span>{repo.name}</span>
                                <IconExternalLink size={12} />
                              </a>
                              {repo.isFork && (
                                <span
                                  className="gh-meta-pill"
                                  style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', marginLeft: '0.4rem' }}
                                >
                                  Fork
                                </span>
                              )}
                            </div>
                          </div>

                          {repo.description && <p className="gh-repo-desc">{repo.description}</p>}

                          {repo.homepage && (
                            <a
                              href={repo.homepage.startsWith('http') ? repo.homepage : `https://${repo.homepage}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '0.78rem', color: '#2563eb', textDecoration: 'underline', fontWeight: 700 }}
                            >
                              Live App: {repo.homepage}
                            </a>
                          )}
                        </div>

                        {/* Stats Row */}
                        <div className="gh-repo-stats-row">
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <IconStar size={12} /> {repo.stars}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <IconFork size={12} /> {repo.forks}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <IconEye size={12} /> {repo.watchers}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <IconIssue size={12} /> {repo.openIssues} issues
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <IconHardDrive size={12} /> {Math.round(repo.sizeKb / 1024 * 10) / 10} MB
                          </span>
                          {repo.license && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <IconFileText size={12} /> {repo.license}
                            </span>
                          )}
                        </div>

                        {/* Optional Container & Typing Badges (Tests, CI, and README removed as requested) */}
                        {(repo.hasDocker || repo.hasTypeScript) && (
                          <div className="gh-repo-badges">
                            {repo.hasDocker && (
                              <span className="gh-badge gh-badge--docker" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <IconTerminal size={11} /> Docker
                              </span>
                            )}
                            {repo.hasTypeScript && (
                              <span className="gh-badge gh-badge--ts">TypeScript</span>
                            )}
                          </div>
                        )}

                        {/* Drawer Trigger */}
                        <button
                          type="button"
                          className="gh-drawer-toggle"
                          onClick={() => setExpandedRepo(isExpanded ? null : repo.name)}
                        >
                          {isExpanded ? 'Hide File Tree & Architecture ▲' : 'Inspect File Tree & Details ▼'}
                        </button>

                        {/* Expandable Repository Drawer */}
                        {isExpanded && (
                          <div className="gh-repo-drawer">
                            <div>
                              <strong>Architectural Pattern:</strong> {repo.architecturePattern}
                            </div>
                            {repo.detectedStack && repo.detectedStack.length > 0 && (
                              <div>
                                <strong>Detected Stack:</strong> {repo.detectedStack.join(', ')}
                              </div>
                            )}
                            {repo.rootFiles && repo.rootFiles.length > 0 ? (
                              <div>
                                <strong>Root File Structure:</strong>
                                <div className="gh-file-tree">
                                  {repo.rootFiles.map((file, fIdx) => (
                                    <div key={fIdx}>├── {file}</div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
                                File tree not inspected in batch priority pool.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 5: .ENV & SECRET EXPOSURE SECURITY CHECK
             ───────────────────────────────────────────────────────────── */}
          {activeTab === 'audit' && (
            <div className="gh-tab-panel">
              <div
                className="gh-card"
                style={{
                  border: '4px solid var(--black)',
                  boxShadow: 'var(--shadow)',
                  padding: '2rem',
                  background: securityAudit.exposedSecretsFound ? '#fef2f2' : '#f0fdf4',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    borderBottom: '3px solid var(--black)',
                    paddingBottom: '1.25rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {securityAudit.exposedSecretsFound ? (
                      <IconShieldAlert size={30} style={{ color: '#dc2626' }} />
                    ) : (
                      <IconShieldCheck size={30} style={{ color: '#16a34a' }} />
                    )}
                    <div>
                      <h3
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.4rem',
                          margin: 0,
                          textTransform: 'uppercase',
                          color: '#000000',
                        }}
                      >
                        .ENV &amp; Sensitive Secret Exposure Check
                      </h3>
                      <p style={{ fontSize: '0.88rem', color: '#4b5563', margin: '0.25rem 0 0 0', fontWeight: 600 }}>
                        Automated inspection of public repository file trees, root directories, and commit history
                      </p>
                    </div>
                  </div>

                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      padding: '0.5rem 1rem',
                      border: '3px solid var(--black)',
                      boxShadow: '3px 3px 0 var(--black)',
                      background: securityAudit.exposedSecretsFound ? 'var(--pink, #ff3d9a)' : 'var(--lime, #b8ff00)',
                      color: '#000000',
                      fontWeight: 900,
                    }}
                  >
                    {securityAudit.exposedSecretsFound ? 'EXPOSED .ENV FOUND' : 'NO .ENV EXPOSED · SECURE'}
                  </span>
                </div>

                {/* Status Explanation */}
                <div style={{ marginBottom: '1.5rem' }}>
                  {securityAudit.exposedSecretsFound ? (
                    <div>
                      <p style={{ fontSize: '1.05rem', fontWeight: 800, color: '#991b1b', margin: '0 0 0.75rem 0' }}>
                        Warning: Unencrypted .env files or sensitive environment credentials were detected in your public repositories.
                      </p>
                      <p style={{ fontSize: '0.92rem', color: '#374151', lineHeight: 1.5, margin: 0 }}>
                        Files matching sensitive environment patterns were found in public branches. Anyone on GitHub can inspect these files to access private API tokens, database connection strings, or credentials.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: '1.05rem', fontWeight: 800, color: '#166534', margin: '0 0 0.75rem 0' }}>
                        All Clean! No exposed .env files or private credentials detected.
                      </p>
                      <p style={{ fontSize: '0.92rem', color: '#374151', lineHeight: 1.5, margin: 0 }}>
                        We verified root file trees across all {allRepositories.length} of your public repositories. No unencrypted <code>.env</code> files, private SSH/RSA keys, or exposed service credentials were found publicly accessible.
                      </p>
                    </div>
                  )}
                </div>

                {/* Exposed Files List (if any detected) */}
                {securityAudit.exposedFiles && securityAudit.exposedFiles.length > 0 && (
                  <div
                    style={{
                      background: '#ffffff',
                      border: '3px solid #dc2626',
                      padding: '1.25rem',
                      marginBottom: '1.5rem',
                      boxShadow: '3px 3px 0 #000',
                    }}
                  >
                    <h4
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1rem',
                        color: '#dc2626',
                        textTransform: 'uppercase',
                        margin: '0 0 0.5rem 0',
                      }}
                    >
                      Exposed Files Detected:
                    </h4>
                    <ul
                      style={{
                        listStyle: 'none',
                        margin: 0,
                        padding: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.45rem',
                      }}
                    >
                      {securityAudit.exposedFiles.map((file, idx) => (
                        <li
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            color: '#b91c1c',
                          }}
                        >
                          <IconAlertTriangle size={15} />
                          <code>{file}</code>
                        </li>
                      ))}
                    </ul>
                    <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '0.75rem 0 0 0', fontWeight: 700 }}>
                      Action: Add <code>.env</code> to your <code>.gitignore</code> and revoke any compromised secrets immediately.
                    </p>
                  </div>
                )}

                {/* Verification Summary Telemetry */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    background: '#ffffff',
                    border: '3px solid var(--black)',
                    padding: '1.25rem',
                    boxShadow: '3px 3px 0 var(--black)',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: '#6b7280',
                        display: 'block',
                      }}
                    >
                      Repositories Inspected
                    </span>
                    <strong style={{ fontSize: '1.35rem', fontFamily: 'var(--font-display)', color: '#000000' }}>
                      {allRepositories.length} Public Repos
                    </strong>
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: '#6b7280',
                        display: 'block',
                      }}
                    >
                      .ENV Exposure Status
                    </span>
                    <strong
                      style={{
                        fontSize: '1.35rem',
                        fontFamily: 'var(--font-display)',
                        color: securityAudit.exposedSecretsFound ? '#dc2626' : '#16a34a',
                      }}
                    >
                      {securityAudit.exposedSecretsFound ? 'Exposed' : 'Clean & Protected'}
                    </strong>
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: '#6b7280',
                        display: 'block',
                      }}
                    >
                      Exposed Sensitive Files
                    </span>
                    <strong
                      style={{
                        fontSize: '1.35rem',
                        fontFamily: 'var(--font-display)',
                        color: securityAudit.exposedSecretsFound ? '#dc2626' : '#16a34a',
                      }}
                    >
                      {securityAudit.exposedFiles?.length || 0}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 6: COMMUNITY, GISTS & OPEN SOURCE
             ───────────────────────────────────────────────────────────── */}
          {activeTab === 'community' && (
            <div className="gh-tab-panel">
              {/* Collaboration Flow */}
              <div className="gh-card">
                <div className="gh-card-header">
                  <div>
                    <h3 className="gh-card-title">
                      <IconPullRequest size={18} />
                      <span>Open Source Collaboration Index</span>
                    </h3>
                    <p className="gh-card-subtitle">Participation in Pull Requests, Code Reviews, and Issues</p>
                  </div>
                  <span className="gh-meta-pill" style={{ background: 'var(--lime)' }}>
                    {collaboration.collaborationIndex}
                  </span>
                </div>

                <div className="gh-stats-grid">
                  <div className="gh-stat-card">
                    <div className="gh-stat-header">
                      <span className="gh-stat-icon"><IconPullRequest size={20} /></span>
                      <span className="gh-stat-value">{collaboration.prsOpened || 0}</span>
                    </div>
                    <span className="gh-stat-label">PRs Opened</span>
                  </div>

                  <div className="gh-stat-card">
                    <div className="gh-stat-header">
                      <span className="gh-stat-icon"><IconReview size={20} /></span>
                      <span className="gh-stat-value">{collaboration.reviewsGiven || 0}</span>
                    </div>
                    <span className="gh-stat-label">Code Reviews Given</span>
                  </div>

                  <div className="gh-stat-card">
                    <div className="gh-stat-header">
                      <span className="gh-stat-icon"><IconIssue size={20} /></span>
                      <span className="gh-stat-value">{collaboration.issuesCreated || 0}</span>
                    </div>
                    <span className="gh-stat-label">Issues Created</span>
                  </div>

                  <div className="gh-stat-card">
                    <div className="gh-stat-header">
                      <span className="gh-stat-icon"><IconDiscussion size={20} /></span>
                      <span className="gh-stat-value">{collaboration.issueComments || 0}</span>
                    </div>
                    <span className="gh-stat-label">Discussions &amp; Comments</span>
                  </div>
                </div>
              </div>

              {/* Public Organizations & Public Gists */}
              <div className="gh-habits-grid">
                {/* Organizations */}
                <div className="gh-card">
                  <div className="gh-card-header">
                    <h4 className="gh-card-title">
                      <IconBuilding size={18} />
                      <span>Public Organizations ({organizations.length})</span>
                    </h4>
                  </div>
                  {organizations.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {organizations.map((org, i) => (
                        <a
                          key={i}
                          href={org.htmlUrl || `https://github.com/${org.login}`}
                          target="_blank"
                          rel="noreferrer"
                          className="gh-org-card"
                        >
                          <img src={org.avatarUrl} alt={org.login} className="gh-org-avatar" />
                          <div>
                            <strong style={{ fontSize: '1rem', color: 'var(--black)' }}>{org.login}</strong>
                            {org.description && (
                              <p style={{ fontSize: '0.8rem', color: '#4b5563', margin: '0.2rem 0 0 0' }}>
                                {org.description}
                              </p>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic' }}>
                      No public organizations listed for this account.
                    </p>
                  )}
                </div>

                {/* Public Gists */}
                <div className="gh-card">
                  <div className="gh-card-header">
                    <h4 className="gh-card-title">
                      <IconGist size={18} />
                      <span>Public Gists ({gists.length})</span>
                    </h4>
                  </div>
                  {gists.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {gists.map((g, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '0.75rem',
                            background: 'var(--cream)',
                            border: '2px solid var(--black)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <a
                              href={g.htmlUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontWeight: 800, fontSize: '0.88rem', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <span>{g.description || 'Public Snippet'}</span>
                              <IconExternalLink size={12} />
                            </a>
                            <div style={{ fontSize: '0.75rem', color: '#4b5563', marginTop: '0.2rem' }}>
                              {g.filesCount} file(s) · {g.commentsCount} comments
                            </div>
                          </div>
                          <span className="gh-badge gh-badge--ok">{g.language || 'Text'}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic' }}>
                      No public gists found for this profile.
                    </p>
                  )}
                </div>
              </div>

              {/* Followers Sample Grid */}
              {results.followersSample && results.followersSample.length > 0 && (
                <div className="gh-card">
                  <div className="gh-card-header">
                    <h4 className="gh-card-title">
                      <IconUsers size={18} />
                      <span>Follower Network Sample</span>
                    </h4>
                  </div>
                  <div className="gh-user-avatars-grid">
                    {results.followersSample.map((user, i) => (
                      <a
                        key={i}
                        href={user.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="gh-user-bubble"
                        title={user.login}
                      >
                        <img src={user.avatarUrl} alt={user.login} className="gh-user-bubble-avatar" />
                        <span className="gh-user-bubble-name">{user.login}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Language Verification Selection Modal ─── */}
      {showVerifyModal && (
        <div className="gh-modal-overlay" onClick={() => setShowVerifyModal(false)}>
          <div className="gh-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="gh-modal-header">
              <h3 className="gh-modal-title">
                <IconShield size={20} />
                <span>Select Language to Verify</span>
              </h3>
              <button
                type="button"
                className="gh-modal-close-btn"
                onClick={() => setShowVerifyModal(false)}
                title="Close"
              >
                &times;
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#1a1a1a', fontWeight: 600, margin: 0 }}>
              Select which programming language from your GitHub profile you would like to test and certify in our interactive Skill Verifier:
            </p>

            <div className="gh-lang-picker-grid">
              {userLanguages.map((lang, idx) => {
                const isSelected = selectedVerifyLang === lang.name;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`gh-lang-picker-btn ${isSelected ? 'gh-lang-picker-btn--selected' : ''}`}
                    onClick={() => setSelectedVerifyLang(lang.name)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        className="gh-lang-dot"
                        style={{ backgroundColor: lang.color || '#00e5ff', width: 10, height: 10, borderRadius: '50%', display: 'inline-block' }}
                      />
                      <span>{lang.name}</span>
                    </div>
                    {lang.percentage && (
                      <span style={{ fontSize: '0.75rem', opacity: 0.75, fontWeight: 700 }}>
                        {lang.percentage}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem', borderTop: '2px solid #000000', paddingTop: '1rem' }}>
              <button
                type="button"
                className="brutal-btn"
                style={{
                  background: '#f5f0e8',
                  color: '#000000',
                  border: '2px solid #000000',
                  boxShadow: '3px 3px 0 #000000',
                  padding: '0.55rem 1rem',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
                onClick={() => setShowVerifyModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="brutal-btn"
                style={{
                  background: 'var(--yellow, #ffe600)',
                  color: '#000000',
                  border: '3px solid #000000',
                  boxShadow: '4px 4px 0 #000000',
                  padding: '0.55rem 1.25rem',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  if (selectedVerifyLang && startVerification) {
                    setShowVerifyModal(false);
                    startVerification(selectedVerifyLang);
                  }
                }}
              >
                <IconCheck size={16} />
                <span>Start Verification for {selectedVerifyLang || 'Language'} &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
