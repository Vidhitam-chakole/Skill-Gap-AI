import { useState, useEffect } from 'react';
import './IntroAnimation.css';

export default function IntroAnimation({ onComplete }) {
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('logo'), 400),
      setTimeout(() => setPhase('visual'), 1400),
      setTimeout(() => setPhase('zoom'), 2800),
      setTimeout(() => setPhase('exit'), 4200),
      setTimeout(() => onComplete(), 5200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className={`intro ${phase}`}>
      <div className="intro__bg">
        <div className="intro__grid" />
        <div className="intro__orb intro__orb--1" />
        <div className="intro__orb intro__orb--2" />
        <div className="intro__orb intro__orb--3" />
      </div>

      <div className="intro__content">
        <div className="intro__logo-wrap">
          <img src="/logo.svg" alt="SkillGap AI" className="intro__logo" />
          <p className="intro__tagline">SkillGap AI</p>
        </div>

        <div className="intro__visual">
          <div className="intro__terminal">
            <div className="intro__terminal-bar">
              <span /><span /><span />
            </div>
            <div className="intro__terminal-body">
              <p className="intro__line"><span className="intro__prompt">&gt;</span> analyzing skill gaps...</p>
              <p className="intro__line intro__line--delay"><span className="intro__prompt">&gt;</span> scanning profiles...</p>
              <p className="intro__line intro__line--delay2"><span className="intro__prompt">&gt;</span> building your roadmap<span className="intro__cursor">_</span></p>
            </div>
          </div>

          <div className="intro__badges">
            <span className="intro__badge">LinkedIn</span>
            <span className="intro__badge intro__badge--gh">GitHub</span>
            <span className="intro__badge intro__badge--ai">AI</span>
          </div>
        </div>
      </div>

      <button type="button" className="intro__skip" onClick={onComplete}>
        Skip
      </button>

      <div className="intro__zoom-layer" />
    </div>
  );
}
