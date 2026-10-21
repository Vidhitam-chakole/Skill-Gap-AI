import { useState, useRef } from 'react';
import { linkedInApi } from '../../services/api';
import { useAnalysis } from '../../context/AnalysisContext';
import { SectionHeader, Sticker } from '../Decorative/Decorative';
import './Analyzer.css';

export default function LinkedInAnalyzer() {
  const { linkedinResult, setLinkedinResult, setRoadmap } = useAnalysis();
  const [pdfFile, setPdfFile] = useState(null);
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
    if (!pdfFile) {
      setError('Please select or upload your LinkedIn profile PDF.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await linkedInApi.analyzePdf(pdfFile);
      setLinkedinResult(data);
      setRoadmap(null); // Reset roadmap so user can synthesize a fresh combined roadmap
    } catch (err) {
      setError(err.message || 'LinkedIn PDF analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="linkedin" className="analyzer">
      <Sticker color="pink" rotation={3} className="analyzer__sticker">Free LinkedIn Profile Analysis</Sticker>

      <SectionHeader
        title="LinkedIn Profile Analyzer &amp; Resume Review"
        subtitle="Analyze LinkedIn profile online with free PDF export parsing. Extract verified skills, career trajectory, and identify critical skill gaps for software developer jobs."
        rotate={1}
      />

      {/* ─── How to Download LinkedIn Profile PDF Guide (Hidden when results shown) ─── */}
      {!results && (
        <div className="analyzer__steps-card brutal-card reveal">
          <h3 className="analyzer__steps-title">
            <span>📋</span> How to Analyze Your LinkedIn Profile Online (Free &amp; Instant):
          </h3>
          <p className="analyzer__steps-sub">
            LinkedIn has a built-in feature to download your official profile as a PDF in 3 seconds:
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
                Upload the downloaded <strong>.pdf</strong> file below for free AI LinkedIn profile analysis &amp; skill-gap insights!
              </span>
            </li>
          </ol>
        </div>
      )}

      {/* ─── Analysis Input Form (PDF Only - Hidden when results shown) ─── */}
      {!results && (
        <form className="analyzer__form brutal-card reveal" onSubmit={handleAnalyze}>
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
              <p className="analyzer__dropzone-hint">Accepts official LinkedIn resume .pdf export or CV (Max 15MB)</p>
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

          <button
            type="submit"
            className="brutal-btn brutal-btn--primary"
            style={{ width: '100%', marginTop: '1.25rem' }}
            disabled={loading || !pdfFile}
          >
            {loading ? 'Analyzing Profile Online...' : 'Analyze LinkedIn Profile Online (Free)'}
          </button>
        </form>
      )}

      {error && <div className="analyzer__error reveal">{error}</div>}

      {/* ─── Review Results: Personalized Candidate Dossier ─── */}
      {results && (
        <div className="analyzer__results reveal">
          {/* Header Profile Dossier Card */}
          <div className="analyzer__dossier-card brutal-card">
            <div className="analyzer__dossier-header-row">
              <span className="analyzer__dossier-badge">✓ Verified Candidate Profile</span>
              <button
                type="button"
                className="analyzer__reupload-btn"
                onClick={() => {
                  setLinkedinResult(null);
                  setPdfFile(null);
                }}
                title="Upload another LinkedIn profile PDF"
              >
                🔄 Upload Another PDF
              </button>
            </div>
            <div className="analyzer__dossier-top">
              <h2 className="analyzer__dossier-name">{results.name}</h2>
              <h3 className="analyzer__dossier-headline">{results.headline}</h3>
            </div>

            {/* Concise 2 to 3 line summary */}
            {results.summary && (
              <div className="analyzer__summary-box">
                <span className="analyzer__summary-label">Executive Professional Summary</span>
                <p className="analyzer__summary-text">{results.summary}</p>
              </div>
            )}

            {/* Contact details strip */}
            <div className="analyzer__contact-strip">
              {results.contact?.email && (
                <a href={`mailto:${results.contact.email}`} className="analyzer__contact-pill">
                  <span className="analyzer__contact-icon">✉️</span>
                  <span>{results.contact.email}</span>
                </a>
              )}
              {results.contact?.phone && (
                <div className="analyzer__contact-pill">
                  <span className="analyzer__contact-icon">📞</span>
                  <span>{results.contact.phone}</span>
                </div>
              )}
              {results.contact?.location && (
                <div className="analyzer__contact-pill">
                  <span className="analyzer__contact-icon">📍</span>
                  <span>{results.contact.location}</span>
                </div>
              )}
              {results.profileUrl && (
                <a
                  href={results.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="analyzer__contact-pill analyzer__contact-pill--link"
                >
                  <span className="analyzer__contact-icon">🔗</span>
                  <span>View LinkedIn Profile &rarr;</span>
                </a>
              )}
            </div>
          </div>

          {/* Dossier Grid: Experience, Education, Skills, Certifications */}
          <div className="analyzer__grid">
            {/* Column 1: Experience & Education */}
            <div className="analyzer__col">
              {/* Experience Section */}
              <div className="analyzer__panel brutal-card reveal">
                <h3>💼 Professional Experience</h3>
                <p className="analyzer__panel-subtitle">Career history extracted from your profile:</p>

                {results.experience && results.experience.length > 0 ? (
                  <div className="analyzer__timeline">
                    {results.experience.map((exp, i) => (
                      <div key={i} className="analyzer__timeline-item">
                        <div className="analyzer__timeline-header">
                          <h4 className="analyzer__timeline-title">{exp.title}</h4>
                          <span className="analyzer__timeline-company">{exp.company}</span>
                        </div>
                        {exp.duration && (
                          <span className="analyzer__duration-badge">{exp.duration}</span>
                        )}
                        {exp.description && (
                          <p className="analyzer__timeline-desc">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="analyzer__empty-note">
                    Experience entries extracted directly from your profile will be featured here.
                  </p>
                )}
              </div>

              {/* Education Section */}
              <div className="analyzer__panel brutal-card reveal" style={{ marginTop: '2rem' }}>
                <h3>🎓 Education History</h3>
                <p className="analyzer__panel-subtitle">Academic degrees and institutions:</p>

                {results.education && results.education.length > 0 ? (
                  <div className="analyzer__edu-list">
                    {results.education.map((edu, i) => (
                      <div key={i} className="analyzer__edu-item">
                        <h4 className="analyzer__edu-degree">{edu.degree}</h4>
                        <span className="analyzer__edu-inst">{edu.institution}</span>
                        {(edu.fieldOfStudy || edu.year) && (
                          <div className="analyzer__edu-meta">
                            {edu.fieldOfStudy && <span>{edu.fieldOfStudy}</span>}
                            {edu.year && <span className="analyzer__edu-year">{edu.year}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="analyzer__empty-note">Academic background extracted from your PDF.</p>
                )}
              </div>
            </div>

            {/* Column 2: Skills & Certifications */}
            <div className="analyzer__col">
              {/* Skills Section */}
              <div className="analyzer__panel brutal-card reveal-right">
                <h3>🛠️ Verified Skills &amp; Proficiencies</h3>
                <p className="analyzer__panel-subtitle">Technical skills and domain competencies identified:</p>

                {results.skills && results.skills.length > 0 ? (
                  <div className="analyzer__tags">
                    {results.skills.map((skill, i) => (
                      <span key={i} className="analyzer__tag">{skill}</span>
                    ))}
                  </div>
                ) : (
                  <p className="analyzer__empty-note">Core competencies extracted from your profile.</p>
                )}
              </div>

              {/* Certifications Section */}
              <div className="analyzer__panel brutal-card reveal-right" style={{ marginTop: '2rem' }}>
                <h3>📜 Licenses &amp; Certifications</h3>
                <p className="analyzer__panel-subtitle">Professional accreditations and verified credentials:</p>

                {results.certifications && results.certifications.length > 0 ? (
                  <div className="analyzer__cert-list">
                    {results.certifications.map((cert, i) => (
                      <div key={i} className="analyzer__cert-item">
                        <h4 className="analyzer__cert-name">{cert.name}</h4>
                        {cert.issuer && <span className="analyzer__cert-issuer">{cert.issuer}</span>}
                        {cert.issueDate && <span className="analyzer__cert-date">{cert.issueDate}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="analyzer__empty-note">
                    Certifications, course credentials, and professional licenses will appear here.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
