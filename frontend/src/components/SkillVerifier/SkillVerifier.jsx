import { useState, useEffect, useCallback } from 'react';
import { useAnalysis } from '../../context/AnalysisContext';
import { SectionHeader, Sticker } from '../Decorative/Decorative';
import { skillVerifierApi } from '../../services/api';
import './SkillVerifier.css';

const DEFAULT_LANGUAGES = [
  { id: 'python', name: 'Python', category: 'Backend & AI/ML' },
  { id: 'javascript', name: 'JavaScript', category: 'Full Stack & Web' },
  { id: 'typescript', name: 'TypeScript', category: 'Architecture & Frontend' },
  { id: 'c', name: 'C Programming', category: 'Systems & Embedded' },
  { id: 'cpp', name: 'C++', category: 'High Performance' },
  { id: 'java', name: 'Java', category: 'Enterprise Backend' },
  { id: 'go', name: 'Go (Golang)', category: 'Cloud & Distributed' },
  { id: 'rust', name: 'Rust', category: 'Systems & Memory Safety' },
];

export default function SkillVerifier({ initialLanguage = null }) {
  const { githubResult } = useAnalysis();
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage || 'Python');
  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const strongestLang = githubResult?.topLanguages?.[0]?.name;
  const strongestPct = githubResult?.topLanguages?.[0]?.percentage;

  // If initialLanguage or githubResult updates, sync pre-selection to user's strongest language
  useEffect(() => {
    if (initialLanguage) {
      setSelectedLanguage(initialLanguage);
    } else if (strongestLang) {
      setSelectedLanguage(strongestLang);
    }
  }, [initialLanguage, strongestLang]);

  // Start Assessment
  const handleStartQuiz = async (langToUse = selectedLanguage) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setAnswers({});
    setCurrentIndex(0);

    try {
      const data = await skillVerifierApi.generate(
        langToUse,
        githubResult?.analysisId || null
      );
      setQuiz(data);
      setStartTime(Date.now());
    } catch (err) {
      setError(err.message || 'Failed to generate assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    setError(null);

    const timeSpent = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

    try {
      const evalResult = await skillVerifierApi.submit({
        quizId: quiz.quizId,
        language: quiz.language,
        answers,
        timeSpentSeconds: timeSpent,
      });
      setResults(evalResult);
      setQuiz(null);
    } catch (err) {
      setError(err.message || 'Assessment submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = quiz?.questions?.[currentIndex];
  const totalQ = quiz?.questions?.length || 10;
  const answeredCount = Object.keys(answers).length;

  const getDifficultyClass = (diff) => {
    const d = (diff || '').toLowerCase();
    if (d.includes('fund')) return 'verifier__badge-diff--fundamental';
    if (d.includes('inter')) return 'verifier__badge-diff--intermediate';
    return 'verifier__badge-diff--deep-mechanics';
  };

  const getVerdictTheme = (status) => {
    if (status === 'VERIFIED_AUTHENTIC') return 'verifier__score-banner--verified';
    if (status === 'LIKELY_AI_AUGMENTED') return 'verifier__score-banner--augmented';
    return 'verifier__score-banner--suspect';
  };

  return (
    <section id="verifier" className="verifier">


      <SectionHeader
        
        title="AI Code & Skill Verifier"
        subtitle="Did you write your code, or did AI? Take the 10-Question Truth Test to verify genuine mastery over your claimed GitHub strong languages."
        rotate={1}
      />

      {error && <div className="analyzer__error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {/* 1. SETUP / LANGUAGE SELECTOR (when no active quiz and no results) */}
      {!quiz && !results && (
        <div className="verifier__setup-card brutal-card reveal">
          <div className="verifier__setup-title">
            <span>Verify Language Authenticity</span>
            <span className="badge badge--dynamic">✨ Custom-Made Papers</span>
          </div>

          <p className="verifier__setup-desc">
            Technical interviewers can immediately distinguish between engineers who intuitively understand core language mechanics vs candidates who copy-paste AI-generated code.
            Assessment papers are <strong>never predefined</strong>—every test is <strong>dynamically custom-generated</strong> on the fly, with randomized code traps, execution paths, and real repository context from your GitHub profile.
          </p>

          {/* GitHub Detected Strongest Language Banner */}
          {githubResult ? (
            <div className="verifier__gh-extracted-card">
              <div className="verifier__gh-extracted-badge">
                <span className="verifier__pulse-dot"></span>
                <span>GITHUB PROFILE CONNECTED: @{githubResult.username}</span>
              </div>
              <div className="verifier__gh-extracted-content">
                <div className="verifier__gh-extracted-text">
                  <h4>
                    Strongest Language Detected: <span className="verifier__lang-highlight">{strongestLang || 'Primary Language'}</span>
                    {strongestPct ? <span className="verifier__lang-pct"> ({strongestPct}% of public repos)</span> : null}
                  </h4>
                  <p>
                    Paper will be dynamically tailored to your GitHub stack. Anti-AI traps will test pointer lifetimes, memory boundaries, concurrency, and scoping traps.
                  </p>
                </div>
                <button
                  type="button"
                  className="brutal-btn brutal-btn--accent verifier__start-strongest-btn"
                  disabled={loading}
                  onClick={() => handleStartQuiz(strongestLang || selectedLanguage)}
                >
                  {loading ? 'Crafting Custom Paper...' : `⚡ Start Custom ${strongestLang || selectedLanguage} Test`}
                </button>
              </div>

              {githubResult.topLanguages?.length > 1 && (
                <div className="verifier__other-langs">
                  <span className="verifier__other-langs-label">Or test other detected languages from your repositories:</span>
                  <div className="verifier__gh-chips">
                    {githubResult.topLanguages.slice(1).map((lang, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`verifier__chip ${selectedLanguage.toLowerCase() === lang.name.toLowerCase() ? 'verifier__chip--active' : ''}`}
                        onClick={() => {
                          setSelectedLanguage(lang.name);
                          handleStartQuiz(lang.name);
                        }}
                      >
                        {lang.name} ({lang.percentage}%) &rarr; Custom Test
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="verifier__no-gh-tip">
              <div className="verifier__no-gh-text">
                <span className="verifier__no-gh-icon">💡</span>
                <div>
                  <strong>Personalize with your GitHub Profile:</strong>
                  <p>Analyze your GitHub profile above to automatically extract your personal strongest language and generate diagnostic questions calibrated to your repositories.</p>
                </div>
              </div>
              <a href="#github" className="brutal-btn brutal-btn--outline verifier__no-gh-btn">
                Analyze GitHub &rarr;
              </a>
            </div>
          )}

          {/* Manual Picker */}
          <div className="verifier__picker-row">
            <label className="verifier__picker-label">Choose any language to generate a custom paper:</label>
            <div className="verifier__picker-controls">
              <select
                className="verifier__select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {DEFAULT_LANGUAGES.map((l) => (
                  <option key={l.id} value={l.name}>
                    {l.name} ({l.category})
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="brutal-btn brutal-btn--primary"
                disabled={loading}
                onClick={() => handleStartQuiz(selectedLanguage)}
              >
                {loading ? 'Generating Custom Paper...' : `Generate Custom 10-Question ${selectedLanguage} Test`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACTIVE QUIZ VIEW */}
      {quiz && currentQ && (
        <div className="verifier__quiz-card brutal-card">
          {/* Progress bar */}
          <div className="verifier__progress-bar-wrap">
            <div
              className="verifier__progress-bar-fill"
              style={{ width: `${((currentIndex + 1) / totalQ) * 100}%` }}
            />
          </div>

          {/* Header */}
          <div className="verifier__quiz-header">
            <div className="verifier__q-num">
              Question {currentIndex + 1} of {totalQ}
            </div>
            <div className="verifier__q-meta">
              <span className={`verifier__badge-diff ${getDifficultyClass(currentQ.difficulty)}`}>
                {currentQ.difficulty}
              </span>
              <span className="verifier__concept-tag">// {currentQ.concept}</span>
              <span className="verifier__badge-dynamic">
                ✨ Dynamic Custom Paper ({quiz.language})
              </span>
            </div>
          </div>

          {/* Developer Context & Re-roll header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#94a3b8' }}>
            <span>
              {quiz.developerContext ? (
                <>Assessment calibrated for <strong>{quiz.developerContext}</strong></>
              ) : (
                <>Custom dynamic 10-question evaluation</>
              )}
            </span>
            <button
              type="button"
              onClick={() => handleStartQuiz(quiz.language)}
              style={{ background: 'transparent', border: 'none', color: '#00f0ff', cursor: 'pointer', fontSize: '0.82rem', textDecoration: 'underline' }}
              title="Generate 10 completely new questions for this language"
            >
              🎲 Re-roll Fresh Paper &rarr;
            </button>
          </div>

          {/* Question Text */}
          <div className="verifier__question-text">{currentQ.question}</div>

          {/* Code Snippet if present */}
          {currentQ.codeSnippet && (
            <div className="verifier__code-box">
              <pre>{currentQ.codeSnippet}</pre>
            </div>
          )}

          {/* Options Grid */}
          <div className="verifier__options-grid">
            {currentQ.options.map((opt, i) => {
              const isSelected = answers[currentQ.id] === opt.id;
              const letter = String.fromCharCode(65 + i); // A, B, C, D
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`verifier__option-btn ${isSelected ? 'verifier__option-btn--selected' : ''}`}
                  onClick={() => handleSelectOption(currentQ.id, opt.id)}
                >
                  <span className="verifier__opt-letter">{letter}</span>
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="verifier__nav-controls">
            <button
              type="button"
              className="brutal-btn brutal-btn--outline"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            >
              &larr; Previous
            </button>

            {/* Jump Dots */}
            <div className="verifier__dots">
              {quiz.questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    type="button"
                    className={`verifier__dot ${isAnswered ? 'verifier__dot--answered' : ''} ${isCurrent ? 'verifier__dot--current' : ''}`}
                    onClick={() => setCurrentIndex(idx)}
                    title={`Question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {currentIndex < totalQ - 1 ? (
              <button
                type="button"
                className="brutal-btn brutal-btn--primary"
                onClick={() => setCurrentIndex((prev) => Math.min(totalQ - 1, prev + 1))}
              >
                Next &rarr;
              </button>
            ) : (
              <button
                type="button"
                className="brutal-btn brutal-btn--accent"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? 'Verifying Answers...' : `Submit (${answeredCount}/${totalQ} Answered)`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. EVALUATION RESULTS VIEW */}
      {results && (
        <div className="verifier__results-card brutal-card">
          {/* Big Score Banner */}
          <div className={`verifier__score-banner ${getVerdictTheme(results.authenticityStatus)}`}>
            <div className="verifier__score-details">
              <span className="verifier__badge-pill">{results.badge}</span>
              <h2 className="verifier__verdict-title">{results.authenticityLabel}</h2>
              <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>{results.summary}</p>
            </div>
            <div className="verifier__score-dial">
              <span className="verifier__score-digits">
                {results.score}/{results.totalQuestions}
              </span>
              <span className="verifier__score-sub">{results.percentage}% Authenticity Index</span>
            </div>
          </div>

          <div className="verifier__results-grid">
            {/* AI Forensic Insight */}
            <div className="verifier__card-block">
              <h3>
                <span>🛡️</span> AI Forensic Breakdown
              </h3>
              <div className="verifier__insight-box">{results.aiDetectionInsight}</div>
              <ul className="verifier__rec-list">
                {results.recommendations.map((rec, i) => (
                  <li key={i} className="verifier__rec-item">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Concept Mastery Bars */}
            <div className="verifier__card-block">
              <h3>
                <span>📊</span> Tested Core Mechanics
              </h3>
              <div className="verifier__concepts-list">
                {results.conceptBreakdown.map((c, i) => (
                  <div key={i} className="verifier__concept-item">
                    <div className="verifier__concept-meta">
                      <span>{c.concept}</span>
                      <span>
                        {c.correct}/{c.total} ({c.percentage}%)
                      </span>
                    </div>
                    <div className="verifier__concept-track">
                      <div
                        className="verifier__concept-fill"
                        style={{
                          width: `${c.percentage}%`,
                          backgroundColor:
                            c.percentage >= 80 ? '#00e676' : c.percentage >= 50 ? '#ffaa00' : '#ff0055',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="verifier__review-section">
            <h3 className="verifier__review-title">Detailed Question Review &amp; Deep Explanations</h3>
            <div className="verifier__review-list">
              {results.detailedReview.map((rev) => (
                <div
                  key={rev.id}
                  className={`verifier__review-item ${rev.isCorrect ? 'verifier__review-item--correct' : 'verifier__review-item--incorrect'}`}
                >
                  <div className="verifier__review-header">
                    <span className="verifier__concept-tag">// Q{rev.id}: {rev.concept}</span>
                    <span
                      className={`verifier__review-status ${rev.isCorrect ? 'verifier__review-status--ok' : 'verifier__review-status--bad'}`}
                    >
                      {rev.isCorrect ? '✓ Verified Correct' : '✗ Incorrect / Trap'}
                    </span>
                  </div>

                  <p style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: '0.75rem' }}>{rev.question}</p>

                  {rev.codeSnippet && (
                    <div className="verifier__code-box" style={{ marginBottom: '1rem', padding: '0.8rem' }}>
                      <pre style={{ fontSize: '0.85rem' }}>{rev.codeSnippet}</pre>
                    </div>
                  )}

                  <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                    <div>
                      <strong>Your Answer: </strong>
                      <span style={{ color: rev.isCorrect ? '#00e676' : '#ff0055' }}>
                        {rev.selectedIndex !== null && rev.selectedIndex !== undefined
                          ? `${String.fromCharCode(65 + rev.selectedIndex)}: ${rev.options[rev.selectedIndex]}`
                          : 'No answer selected'}
                      </span>
                    </div>
                    {!rev.isCorrect && (
                      <div style={{ marginTop: '0.25rem' }}>
                        <strong>Correct Answer: </strong>
                        <span style={{ color: '#00e676' }}>
                          {String.fromCharCode(65 + rev.correctIndex)}: {rev.options[rev.correctIndex]}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="verifier__explanation-box">
                    <strong>Technical Rationale &amp; AI Misconception:</strong>
                    {rev.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions Footer */}
          <div className="verifier__actions-footer">
            <button
              type="button"
              className="brutal-btn brutal-btn--primary"
              onClick={() => handleStartQuiz(results.language)}
            >
              🎲 Generate Fresh Custom {results.language} Paper (New 10 Questions)
            </button>
            <button
              type="button"
              className="brutal-btn brutal-btn--outline"
              onClick={() => {
                setResults(null);
                setQuiz(null);
              }}
            >
              Verify Another Language
            </button>
            <a href="#chat" className="brutal-btn brutal-btn--accent">
              Ask AI Career Assistant About These Gaps &rarr;
            </a>
          </div>

          {/* Quick links to test remaining GitHub languages */}
          {githubResult && githubResult.topLanguages?.length > 1 && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px dashed rgba(255, 255, 255, 0.15)' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>
                Test other languages extracted from @{githubResult.username}&apos;s GitHub:
              </span>
              <div className="verifier__gh-chips">
                {githubResult.topLanguages
                  .filter((l) => l.name.toLowerCase() !== results.language.toLowerCase())
                  .map((lang, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="verifier__chip"
                      onClick={() => {
                        setSelectedLanguage(lang.name);
                        handleStartQuiz(lang.name);
                      }}
                    >
                      {lang.name} ({lang.percentage}%) &rarr; Start Custom Test
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
