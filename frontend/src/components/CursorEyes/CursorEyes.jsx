import { useEffect, useRef, useState, useCallback } from 'react';
import './CursorEyes.css';

const EYE_CONFIG = [
  { id: 'linkedin', label: 'LinkedIn', accent: 'var(--cyan, #00E5FF)', size: 32, irisOffset: 0 },
  { id: 'github', label: 'GitHub', accent: 'var(--purple, #7B2CBF)', size: 30, irisOffset: 1 },
  { id: 'verifier', label: 'Verifier', accent: 'var(--lime, #A6FF00)', size: 34, irisOffset: -1 },
  { id: 'roadmap', label: 'Roadmap', accent: 'var(--orange, #FF5C00)', size: 30, irisOffset: 0 },
  { id: 'chat', label: 'AI Chat', accent: 'var(--pink, #FF69B4)', size: 33, irisOffset: 1 },
  { id: 'home', label: 'Top', accent: 'var(--yellow, #FFE600)', size: 28, irisOffset: -1 },
];

export default function CursorEyes({ onNavigate }) {
  const containerRef = useRef(null);
  const eyeRefs = useRef([]);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [winkingIndex, setWinkingIndex] = useState(null);
  const [isAmbient, setIsAmbient] = useState(true);

  // Keep track of target coordinates and ambient state
  const targetPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const idleTimer = useRef(null);
  const ambientTimer = useRef(null);
  const blinkTimer = useRef(null);
  const rafId = useRef(null);

  // Update eye pupils smoothly
  const updateEyes = useCallback(() => {
    if (!eyeRefs.current) return;

    eyeRefs.current.forEach((eyeEl, index) => {
      if (!eyeEl) return;
      const rect = eyeEl.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const dx = targetPos.current.x - eyeCenterX;
      const dy = targetPos.current.y - eyeCenterY;
      const angle = Math.atan2(dy, dx);
      const dist = Math.hypot(dx, dy);

      // Maximum travel distance within eye boundary
      const maxTravel = rect.width * 0.26;
      // Smoothly clamp travel distance
      const travel = Math.min(dist / 14, maxTravel);

      const pupilX = Math.cos(angle) * travel;
      const pupilY = Math.sin(angle) * travel;

      const pupilEl = eyeEl.querySelector('.cursor-eye__pupil');
      if (pupilEl) {
        pupilEl.style.transform = `translate3d(${pupilX.toFixed(2)}px, ${pupilY.toFixed(2)}px, 0)`;
      }
    });
  }, []);

  // Ambient idle wander for phone / touch & when cursor is still
  const startAmbientLoop = useCallback(() => {
    setIsAmbient(true);

    const ambientWaypoints = [
      { xRatio: 0.35, yRatio: 0.65 }, // Down-left towards CTA buttons
      { xRatio: 0.75, yRatio: 0.40 }, // Right towards score cards
      { xRatio: 0.50, yRatio: 0.48 }, // Center at user
      { xRatio: 0.25, yRatio: 0.30 }, // Up-left at title
      { xRatio: 0.65, yRatio: 0.70 }, // Down-right
    ];

    let wpIndex = 0;
    const wander = () => {
      const wp = ambientWaypoints[wpIndex % ambientWaypoints.length];
      wpIndex += 1;

      targetPos.current = {
        x: window.innerWidth * wp.xRatio,
        y: window.innerHeight * wp.yRatio,
      };

      updateEyes();
      ambientTimer.current = setTimeout(wander, 2200 + Math.random() * 1000);
    };

    ambientTimer.current = setTimeout(wander, 400);
  }, [updateEyes]);

  // Touch & Mouse handlers
  const handlePointerActive = useCallback((clientX, clientY) => {
    setIsAmbient(false);
    targetPos.current = { x: clientX, y: clientY };

    if (ambientTimer.current) clearTimeout(ambientTimer.current);
    if (idleTimer.current) clearTimeout(idleTimer.current);

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(updateEyes);

    // After 2.5s of no pointer movement, resume ambient roam (key for mobile after finger release)
    idleTimer.current = setTimeout(() => {
      startAmbientLoop();
    }, 2500);
  }, [updateEyes, startAmbientLoop]);

  useEffect(() => {
    const onMouseMove = (e) => {
      handlePointerActive(e.clientX, e.clientY);
    };

    // Touch event handling for mobile phones
    const onTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        handlePointerActive(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        handlePointerActive(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    // Initial ambient loop on mount
    startAmbientLoop();

    // Spontaneous natural blinking every 3.5 - 6s
    const triggerRandomBlink = () => {
      // Pick random eye or all eyes
      const randomIdx = Math.random() > 0.4 ? Math.floor(Math.random() * EYE_CONFIG.length) : 'all';
      setWinkingIndex(randomIdx);

      setTimeout(() => {
        setWinkingIndex(null);
      }, 160);

      blinkTimer.current = setTimeout(triggerRandomBlink, 3200 + Math.random() * 2800);
    };

    blinkTimer.current = setTimeout(triggerRandomBlink, 3000);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      if (ambientTimer.current) clearTimeout(ambientTimer.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (blinkTimer.current) clearTimeout(blinkTimer.current);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [handlePointerActive, startAmbientLoop]);

  // Click on eye: wink and smoothly navigate
  const handleEyeClick = (item, index) => {
    setWinkingIndex(index);
    setTimeout(() => {
      setWinkingIndex(null);
    }, 240);

    if (onNavigate) {
      onNavigate(item.id);
    }
  };

  return (
    <div className="cursor-eyes" ref={containerRef} aria-label="Interactive Eye Navigation">
      <div className="cursor-eyes__inner">
        <div className="cursor-eyes__meta">
          <span className="cursor-eyes__dot" aria-hidden="true" />
          <span className="cursor-eyes__label">AI RADAR</span>
        </div>

        <div className="cursor-eyes__row">
          {EYE_CONFIG.map((item, index) => {
            const isWinking = winkingIndex === index || winkingIndex === 'all';
            const isActive = activeTooltip === index;

            return (
              <div key={item.id} className="cursor-eyes__item-wrap">
                <button
                  type="button"
                  ref={(el) => (eyeRefs.current[index] = el)}
                  className={`cursor-eye ${isWinking ? 'cursor-eye--winking' : ''} ${isAmbient ? 'cursor-eye--ambient' : ''}`}
                  style={{
                    width: `${item.size}px`,
                    height: `${item.size}px`,
                    '--eye-accent': item.accent,
                  }}
                  onClick={() => handleEyeClick(item, index)}
                  onMouseEnter={() => setActiveTooltip(index)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onFocus={() => setActiveTooltip(index)}
                  onBlur={() => setActiveTooltip(null)}
                  title={`Jump to ${item.label}`}
                  aria-label={`Jump to ${item.label}`}
                >
                  <div className="cursor-eye__sclera">
                    <div className="cursor-eye__pupil">
                      <div className="cursor-eye__iris-ring" />
                      <div className="cursor-eye__catchlight" />
                    </div>
                  </div>
                </button>

                {isActive && (
                  <div className="cursor-eyes__tooltip" role="tooltip">
                    <span className="cursor-eyes__tooltip-label">{item.label}</span>
                    <span className="cursor-eyes__tooltip-arrow">&rarr;</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <span className="cursor-eyes__hint">TAP TO JUMP</span>
      </div>
    </div>
  );
}
