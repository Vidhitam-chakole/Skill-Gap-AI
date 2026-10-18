import { useState, useEffect } from 'react';
import { useAnalysis } from '../../context/AnalysisContext';
import { SectionHeader, Sticker } from '../Decorative/Decorative';
import { skillVerifierApi } from '../../services/api';
import './SkillVerifier.css';

export default function SkillVerifier({ initialLanguage = null }) {
  const { linkedinResult, githubResult } = useAnalysis();
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage || 'Python');
  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const strongestLang =
    githubResult?.primaryLanguage ||
    githubResult?.strongLanguages?.[0] ||
    githubResult?.topLanguages?.find(
      (l) => !['html', 'css', 'scss', 'less', 'markdown', 'json'].includes((l.name || '').toLowerCase())
    )?.name ||
    githubResult?.topLanguages?.[0]?.name ||
    'Python';

  const strongestPct =
    githubResult?.topLanguages?.find((l) => (l.name || '').toLowerCase() === (strongestLang || '').toLowerCase())?.percentage ||
    githubResult?.topLanguages?.[0]?.percentage;

  // Sync selected language to user's analyzed strongest language
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

  // Other detected languages from GitHub excluding the primary one
  const otherLanguages = (githubResult?.topLanguages || []).filter(
    (l) => l.name && l.name.toLowerCase() !== (strongestLang || '').toLowerCase()
  );

  return (
    <section id="verifier" className="verifier">
      <Sticker color="yellow" rotation={3} className="verifier__sticker">Anti-AI Verifier</Sticker>

      <SectionHeader
        tag="03 // AUTHENTICITY"
        title="AI Code & Skill Verifier"
        subtitle="Did you write your code, or did AI? Take the 10-Question Truth Test to verify genuine mastery over your claimed GitHub strong languages."
        rotate={1}
      />

      {error && <div className="analyzer__error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {/* 1. SETUP / EXTRACTED LANGUAGE VIEW */}
      {!quiz && !results && (
        <div className="verifier__setup-card brutal-card reveal">
          <div className="verifier__setup-title">
            <span>Verify Language Authenticity</span>
            <span className="badge">✨ Custom-Made Papers</span>
          </div>

          <p className="verifier__setup-desc">
            Technical interviewers can immediately distinguish between engineers who intuitively understand core language mechanics vs candidates who copy-paste AI-generated code.
            Assessment papers are <strong>never predefined</strong>—every test is <strong>dynamically custom-generated</strong> on the fly with randomized anti-AI traps, calibrated directly to your analyzed profile.
          </p>

          {/* Connected Profiles Badges */}
          <div className="verifier__connected-strip">
            {githubResult && (
              <div className="verifier__connected-pill verifier__connected-pill--github">
                <span className="verifier__pulse-dot"></span>
                <span>GITHUB CODEBASE: @{githubResult.username}</span>
              </div>
            )}
            {linkedinResult && (
              <div className="verifier__connected-pill verifier__connected-pill--linkedin">
                <span>✓ LINKEDIN: {linkedinResult.name}</span>
                {linkedinResult.headline ? <span style={{ opacity: 0.75 }}>({linkedinResult.headline})</span> : null}
              </div>
            )}
          </div>

          {/* Strongest Language Detected Hero Card */}
          <div className="verifier__gh-extracted-card">
            <div className="verifier__gh-extracted-badge">
              ⚡ Primary Codebase Language
            </div>
            <div className="verifier__gh-extracted-content">
              <div className="verifier__gh-extracted-text">
                <h4>
                  Strongest Language Detected: <span className="verifier__lang-highlight">{strongestLang}</span>
                  {strongestPct ? <span className="verifier__lang-pct"> ({strongestPct}% of public repos)</span> : null}
                </h4>
                <p>
                  This test is dynamically calibrated to your verified code repositories. Anti-AI traps will test pointer lifetimes, memory boundaries, concurrency, and scoping traps to confirm genuine engineering fluency.
                </p>
              </div>
              <button
                type="button"
                className="brutal-btn brutal-btn--accent verifier__start-strongest-btn"
                disabled={loading}
                onClick={() => handleStartQuiz(strongestLang)}
              >
                {loading ? 'Crafting Custom Paper...' : `⚡ Start Custom ${strongestLang} Test (10 Questions)`}
              </button>
            </div>

            {/* Other detected languages from real repositories */}
            {otherLanguages.length > 0 && (
              <div className="verifier__other-langs">
                <span className="verifier__other-langs-label">Or verify other detected languages from your GitHub profile:</span>
                <div className="verifier__gh-chips">
                  {otherLanguages.map((lang, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`verifier__chip ${selectedLanguage.toLowerCase() === lang.name.toLowerCase() ? 'verifier__chip--active' : ''}`}
                      onClick={() => {
                        setSelectedLanguage(lang.name);
                        handleStartQuiz(lang.name);
                      }}
                    >
                      {lang.name} ({lang.percentage}%) &rarr; Start Test
                    </button>
                  ))}
                </div>
              </div>
            )}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
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
              style={{ background: 'transparent', border: 'none', color: '#ff6b1a', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800, textDecoration: 'underline' }}
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
              <p style={{ lineHeight: '1.6', fontWeight: 600 }}>{results.summary}</p>
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
                            c.percentage >= 80 ? '#16a34a' : c.percentage >= 50 ? '#ffaa00' : '#e11d48',
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

                  <p style={{ fontWeight: 800, color: 'var(--black, #0a0a0a)', marginBottom: '0.75rem', fontSize: '1.05rem' }}>
                    {rev.question}
                  </p>

                  {rev.codeSnippet && (
                    <div className="verifier__code-box" style={{ marginBottom: '1rem', padding: '1rem' }}>
                      <pre style={{ fontSize: '0.9rem' }}>{rev.codeSnippet}</pre>
                    </div>
                  )}

                  <div style={{ fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.5rem', fontWeight: 600 }}>
                    <div>
                      <strong>Your Answer: </strong>
                      <span style={{ color: rev.isCorrect ? '#16a34a' : '#e11d48', fontWeight: 800 }}>
                        {rev.selectedIndex !== null && rev.selectedIndex !== undefined
                          ? `${String.fromCharCode(65 + rev.selectedIndex)}: ${rev.options[rev.selectedIndex]}`
                          : 'No answer selected'}
                      </span>
                    </div>
                    {!rev.isCorrect && (
                      <div style={{ marginTop: '0.35rem' }}>
                        <strong>Correct Answer: </strong>
                        <span style={{ color: '#16a34a', fontWeight: 800 }}>
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
          {otherLanguages.length > 0 && (
            <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '2px dashed var(--black, #0a0a0a)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--black, #0a0a0a)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '0.75rem' }}>
                Test other languages extracted from @{githubResult?.username}&apos;s GitHub:
              </span>
              <div className="verifier__gh-chips">
                {otherLanguages
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
