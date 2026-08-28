import { useEffect, useRef } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { FloatingShapes } from '../components/Decorative/Decorative';
import './IntroPage.css';

export default function IntroPage() {
  const { goToWelcome } = useOnboarding();
  const pageRef = useRef(null);

  // GSAP-free entrance: CSS-driven reveal on mount
  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    el.querySelectorAll('.intro-page__reveal').forEach((node, i) => {
      node.style.animationDelay = `${i * 0.15}s`;
    });
  }, []);

  return (
    <div className="intro-page" ref={pageRef}>
      <div className="intro-page__bg">
        <FloatingShapes />
      </div>

      <div className="intro-page__content">
        <div className="intro-page__hero">
          <p className="intro-page__eyebrow intro-page__reveal">
            // career intelligence platform
          </p>

          <h1 className="intro-page__title intro-page__reveal">
            <span className="intro-page__title-line">Close Your</span>
            <span className="intro-page__title-line intro-page__title-line--accent">
              Skill Gap
            </span>
            <span className="intro-page__title-line intro-page__title-line--small">
              with AI
            </span>
          </h1>

          <p className="intro-page__desc intro-page__reveal">
            Skill+ analyzes your GitHub and LinkedIn profiles to identify skill gaps,
            detect career direction, and generate a personalized learning roadmap.
          </p>

          <div className="intro-page__features intro-page__reveal">
            <div className="intro-page__feature">
              <span className="intro-page__feature-icon">gh</span>
              <span>Analyze GitHub</span>
            </div>
            <div className="intro-page__feature">
              <span className="intro-page__feature-icon">in</span>
              <span>Analyze LinkedIn</span>
            </div>
            <div className="intro-page__feature">
              <span className="intro-page__feature-icon">!</span>
              <span>Identify Skills</span>
            </div>
            <div className="intro-page__feature">
              <span className="intro-page__feature-icon">→</span>
              <span>Detect Gaps</span>
            </div>
            <div className="intro-page__feature">
              <span className="intro-page__feature-icon">↗</span>
              <span>Career Direction</span>
            </div>
            <div className="intro-page__feature">
              <span className="intro-page__feature-icon">R</span>
              <span>Learning Roadmap</span>
            </div>
          </div>

          <div className="intro-page__actions intro-page__reveal">
            <button
              className="brutal-btn brutal-btn--primary"
              onClick={goToWelcome}
            >
              Get Started →
            </button>
          </div>
        </div>

        <div className="intro-page__visual intro-page__reveal">
          <div className="intro-page__card intro-page__card--1">
            <span className="intro-page__card-label">Score</span>
            <span className="intro-page__card-value">87</span>
          </div>
          <div className="intro-page__card intro-page__card--2">
            <span className="intro-page__card-label">Gaps Found</span>
            <span className="intro-page__card-value">4</span>
          </div>
          <div className="intro-page__card intro-page__card--3">
            <img src="/logo.svg" alt="" className="intro-page__card-logo" />
          </div>
        </div>
      </div>

      <div className="intro-page__sticker intro-page__sticker--new">NEW!</div>
      <div className="intro-page__sticker intro-page__sticker--ai">AI POWERED</div>
    </div>
  );
}
