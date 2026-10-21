import './Hero.css';

export default function Hero({ onNavigate }) {
  return (
    <section id="home" className="hero">
      <div className="hero__bg-shapes">
        <div className="hero__shape hero__shape--1" style={{ transform: 'translate(var(--parallax-x, 0), var(--parallax-y, 0))' }} />
        <div className="hero__shape hero__shape--2" style={{ transform: 'translate(calc(var(--parallax-x, 0) * -0.5), calc(var(--parallax-y, 0) * -0.5))' }} />
        <div className="hero__shape hero__shape--3" />
      </div>

      <div className="hero__sticker hero__sticker--new">NEW!</div>
      <div className="hero__sticker hero__sticker--ai">AI POWERED</div>

      <div className="hero__content">
        <p className="hero__eyebrow reveal">AI Skill Gap Analyzer &amp; Career Intelligence</p>

        <h1 className="hero__title reveal">
          <span className="hero__title-line">Close Your</span>
          <span className="hero__title-line hero__title-line--accent">Skill Gap</span>
          <span className="hero__title-line hero__title-line--small">with AI</span>
        </h1>

        <p className="hero__desc reveal">
          Free LinkedIn profile analyzer and GitHub profile review tool. Identify skill gaps for software developer jobs and internships with personalized AI career roadmaps.
        </p>

        <div className="hero__actions reveal">
          <button
            className="brutal-btn brutal-btn--primary"
            onClick={() => onNavigate('linkedin')}
            aria-label="Analyze LinkedIn profile online for free"
          >
            Analyze LinkedIn →
          </button>
          <button
            className="brutal-btn brutal-btn--secondary"
            onClick={() => onNavigate('github')}
            aria-label="Analyze GitHub profile for developers"
          >
            Analyze GitHub ★
          </button>
        </div>
      </div>

      <div className="hero__visual reveal-right">
        <div className="hero__card hero__card--1">
          <span className="hero__card-label">Score</span>
          <span className="hero__card-value">87</span>
        </div>
        <div className="hero__card hero__card--2">
          <span className="hero__card-label">Gaps Found</span>
          <span className="hero__card-value">4</span>
        </div>
        <div className="hero__card hero__card--3">
          <img src="/logo.png" alt="SkillPulse AI Logo" className="hero__card-logo" />
        </div>
        <div className="hero__arrow-deco" aria-hidden="true">→</div>
      </div>
    </section>
  );
}
