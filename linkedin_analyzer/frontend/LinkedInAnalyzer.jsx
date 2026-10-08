import { useState, useRef } from 'react';
import { linkedInApi } from '../../services/api';
import { useAnalysis } from '../../context/AnalysisContext';
import { SectionHeader, Sticker } from '../Decorative/Decorative';
import './Analyzer.css';

export default function LinkedInAnalyzer() {
  const { linkedinResult, setLinkedinResult, setRoadmap } = useAnalysis();
  const [mode, setMode] = useState('pdf'); // 'pdf' | 'url'
  const [pdfFile, setPdfFile] = useState(null);
  const [linkedinName, setLinkedinName] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const results = linkedinResult;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.pdf')) {
        setPdfFile(file);
        setError(null);
      } else {
        setError('Please drop a valid .pdf file.');
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.toLowerCase().endsWith('.pdf')) {
        setPdfFile(file);
        setError(null);
      } else {
        setError('Please upload a valid .pdf file.');
      }
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let data;
      if (mode === 'pdf') {
        if (!pdfFile) {
          throw new Error('Please select or upload your LinkedIn profile PDF.');
        }
        data = await linkedInApi.analyzePdf(pdfFile, linkedinName, profileUrl);
      } else {
        const inputVal = (profileUrl || linkedinName).trim();
        if (!inputVal) {
          throw new Error('Please provide your LinkedIn profile URL or name.');
        }
        data = await linkedInApi.analyze(inputVal);
      }

      setLinkedinResult(data);
      setRoadmap(null); // Reset roadmap so user can synthesize a fresh roadmap
    } catch (err) {
      setError(err.message || 'LinkedIn analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="linkedin" className="analyzer">
      <Sticker color="pink" rotation={3} className="analyzer__sticker">LinkedIn Review</Sticker>

      <SectionHeader
        tag="// linkedin_profile_analyzer"
        title="LinkedIn Profile &amp; Resume Review"
        subtitle="Upload your LinkedIn profile PDF export to extract skills, experience, and critical market gaps."
        rotate={1}
      />

      {/* ─── How to Download LinkedIn Profile PDF Guide ─── */}
      <div className="analyzer__steps-card brutal-card reveal">
        <h3 className="analyzer__steps-title">
          <span>📋</span> How to Download Your LinkedIn Profile PDF:
        </h3>
        <p className="analyzer__steps-sub">
          LinkedIn has a built-in feature to download your full official profile as a PDF in 3 seconds:
        </p>
        <ol className="analyzer__steps-list">
          <li className="analyzer__step-item">
            <span className="analyzer__step-num">Step 01</span>
            <span className="analyzer__step-text">
              Open your <strong>LinkedIn Profile</strong> in your browser.
            </span>
          </li>
          <li className="analyzer__step-item">
            <span className="analyzer__step-num">Step 02</span>
            <span className="analyzer__step-text">
              Click the <strong>'More'</strong> button in the intro header card (next to 'Open to' / 'Add profile section').
            </span>
          </li>
          <li className="analyzer__step-item">
            <span className="analyzer__step-num">Step 03</span>
            <span className="analyzer__step-text">
              Select <strong>'Save to PDF'</strong> from the dropdown menu to download your profile.
            </span>
          </li>
          <li className="analyzer__step-item">
            <span className="analyzer__step-num">Step 04</span>
            <span className="analyzer__step-text">
              Upload the downloaded <strong>.pdf</strong> file below and enter your name for context!
            </span>
          </li>
        </ol>
      </div>

      {/* ─── Analysis Input Form ─── */}
      <form className="analyzer__form brutal-card reveal" onSubmit={handleAnalyze}>
        <div className="analyzer__mode-tabs">
          <button
            type="button"
            className={`analyzer__tab-btn ${mode === 'pdf' ? 'analyzer__tab-btn--active' : ''}`}
            onClick={() => setMode('pdf')}
          >
            📄 Upload LinkedIn PDF (Recommended)
          </button>
          <button
            type="button"
            className={`analyzer__tab-btn ${mode === 'url' ? 'analyzer__tab-btn--active' : ''}`}
            onClick={() => setMode('url')}
          >
            🔗 Analyze via Name / URL
          </button>
        </div>

        {mode === 'pdf' ? (
          <>
            {!pdfFile ? (
              <div
                className={`analyzer__dropzone ${dragActive ? 'analyzer__dropzone--active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <span className="analyzer__dropzone-icon">📥</span>
                <p className="analyzer__dropzone-title">Click to browse or drop your LinkedIn profile PDF here</p>
                <p className="analyzer__dropzone-hint">Accepts official LinkedIn resume .pdf export (Max 15)</p>
              </div>
            ) : (
              <div className="analyzer__file-selected">
                <span>✓ Selected PDF: {pdfFile.name} ({(pdfFile.size / 1024).toFixed(1)} KB)</span>
                <button
                  type="button"
                  className="analyzer__file-remove"
                  onClick={() => setPdfFile(null)}
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="analyzer__fields-grid">
              <div className="analyzer__field">
                <label className="analyzer__label" htmlFor="li-name">
                  LinkedIn Name (For Context)hi
                </label>
                <input
                  id="li-name"
                  type="text"
                  className="analyzer__input"
                  placeholder="e.g. Alex Rivera"
                  value={linkedinName}
                  onChange={(e) => setLinkedinName(e.target.value)}
                />
              </div>

              <div className="analyzer__field">
                <label className="analyzer__label" htmlFor="li-url">
                  Profile Link (Optional)
                </label>
                <input
                  id="li-url"
                  type="text"
                  className="analyzer__input"
                  placeholder="e.g. https://linkedin.com/in/alex-rivera"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="brutal-btn brutal-btn--primary" disabled={loading || !pdfFile}>
              {loading ? 'Parsing LinkedIn PDF...' : '⚡ Analyze LinkedIn Profile PDF'}
            </button>
          </>
        ) : (
          <>
            <div className="analyzer__fields-grid">
              <div className="analyzer__field">
                <label className="analyzer__label" htmlFor="li-url-only">
                  LinkedIn Profile URL or Handle
                </label>
                <input
                  id="li-url-only"
                  type="text"
                  className="analyzer__input"
                  placeholder="https://linkedin.com/in/your-profile"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  required
                />
              </div>

              <div className="analyzer__field">
                <label className="analyzer__label" htmlFor="li-name-only">
                  Your Full Name
                </label>
                <input
                  id="li-name-only"
                  type="text"
                  className="analyzer__input"
                  placeholder="e.g. Alex Rivera"
                  value={linkedinName}
                  onChange={(e) => setLinkedinName(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="brutal-btn brutal-btn--primary" disabled={loading}>
              {loading ? 'Analyzing Profile...' : 'Analyze LinkedIn Profile'}
            </button>
          </>
        )}
      </form>

      {error && <div className="analyzer__error reveal">{error}</div>}

      {/* ─── Review Results ─── */}
      {results && (
        <div className="analyzer__results">
          <div className="analyzer__score-card brutal-card reveal-left">
            <span className="analyzer__score-label">LinkedIn Review Score</span>
            <span className="analyzer__score-value">{results.overallScore}</span>
            <div className="analyzer__profile-info">
              <strong>{results.name}</strong>
              <span>{results.headline}</span>
              {results.profileUrl && (
                <a
                  href={results.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="analyzer__profile-link"
                >
                  {results.profileUrl}
                </a>
              )}
            </div>
          </div>

          <div className="analyzer__grid">
            <div className="analyzer__panel brutal-card reveal">
              <h3>Identified Technical Skill Gaps</h3>
              <p className="analyzer__panel-subtitle">Areas to address for modern industry competitiveness:</p>
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
              <h3>Extracted Skills &amp; Strengths</h3>
              <p className="analyzer__panel-subtitle">Verified proficiencies detected from your profile:</p>
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
