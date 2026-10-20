import { useEffect, useRef, useState, useCallback } from 'react';
import { useAnalysis } from '../../context/AnalysisContext';
import './Navbar.css';

const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Home',
    eyeColor: '#00e5ff',
    scleraBg: '#ffffff',
    border: 'var(--black, #0a0a0a)',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    eyeColor: '#0077b5', // Linden Blue
    scleraBg: '#ffffff',
    border: '#0077b5',
  },
  {
    id: 'github',
    label: 'GitHub',
    eyeColor: '#39d353', // Github Black and green
    scleraBg: '#0d1117',
    border: '#39d353',
    pupilBg: '#05070a',
  },
  {
    id: 'verifier',
    label: 'Verifier',
    eyeColor: '#a6ff00',
    scleraBg: '#ffffff',
    border: 'var(--black, #0a0a0a)',
  },
  {
    id: 'roadmap',
    label: 'Roadmap',
    eyeColor: '#ffe600', // Roadmap Yellow
    scleraBg: '#ffffff',
    border: 'var(--black, #0a0a0a)',
  },
  {
    id: 'chat',
    label: 'Chat',
    eyeColor: '#ff5c00', // Chad Orange
    scleraBg: '#ffffff',
    border: 'var(--black, #0a0a0a)',
  },
];

export default function Navbar({ activeSection, onNavigate }) {
  const { linkedinResult, githubResult, isVerifierUnlocked } = useAnalysis();
  const isVerifierReady = Boolean(linkedinResult || githubResult || isVerifierUnlocked);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.id === 'verifier') {
      return isVerifierReady;
    }
    return true;
  });

  const eyeRefs = useRef({});
  const targetPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [winkingId, setWinkingId] = useState(null);
  const [isAmbient, setIsAmbient] = useState(true);

  const idleTimer = useRef(null);
  const ambientTimer = useRef(null);
  const blinkTimer = useRef(null);
  const rafId = useRef(null);

  const updateEyes = useCallback(() => {
    if (!eyeRefs.current) return;

    Object.values(eyeRefs.current).forEach((eyeEl) => {
      if (!eyeEl) return;
      const rect = eyeEl.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const dx = targetPos.current.x - eyeCenterX;
      const dy = targetPos.current.y - eyeCenterY;
      const angle = Math.atan2(dy, dx);
      const dist = Math.hypot(dx, dy);

      const maxTravel = rect.width * 0.24;
      const travel = Math.min(dist / 14, maxTravel);

      const pupilX = Math.cos(angle) * travel;
      const pupilY = Math.sin(angle) * travel;

      const pupilEl = eyeEl.querySelector('.navbar__eye-pupil');
      if (pupilEl) {
        pupilEl.style.transform = `translate3d(${pupilX.toFixed(2)}px, ${pupilY.toFixed(2)}px, 0)`;
      }
    });
  }, []);

  const startAmbientLoop = useCallback(() => {
    setIsAmbient(true);

    const waypoints = [
      { xRatio: 0.5, yRatio: 0.3 },
      { xRatio: 0.7, yRatio: 0.6 },
      { xRatio: 0.4, yRatio: 0.8 },
      { xRatio: 0.6, yRatio: 0.5 },
      { xRatio: 0.3, yRatio: 0.4 },
    ];

    let wpIdx = 0;
    const roam = () => {
      const wp = waypoints[wpIdx % waypoints.length];
      wpIdx += 1;
      targetPos.current = {
        x: window.innerWidth * wp.xRatio,
        y: window.innerHeight * wp.yRatio,
      };
      updateEyes();
      ambientTimer.current = setTimeout(roam, 2200 + Math.random() * 1000);
    };

    ambientTimer.current = setTimeout(roam, 400);
  }, [updateEyes]);

  const handlePointerActive = useCallback((clientX, clientY) => {
    setIsAmbient(false);
    targetPos.current = { x: clientX, y: clientY };

    if (ambientTimer.current) clearTimeout(ambientTimer.current);
    if (idleTimer.current) clearTimeout(idleTimer.current);

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(updateEyes);

    idleTimer.current = setTimeout(() => {
      startAmbientLoop();
    }, 2500);
  }, [updateEyes, startAmbientLoop]);

  useEffect(() => {
    const onMouseMove = (e) => {
      handlePointerActive(e.clientX, e.clientY);
    };

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

    startAmbientLoop();

    const triggerBlink = () => {
      const ids = visibleItems.map((item) => item.id);
      const chosen = Math.random() > 0.4 ? ids[Math.floor(Math.random() * ids.length)] : 'all';
      setWinkingId(chosen);
      setTimeout(() => {
        setWinkingId(null);
      }, 150);

      blinkTimer.current = setTimeout(triggerBlink, 3200 + Math.random() * 2800);
    };

    blinkTimer.current = setTimeout(triggerBlink, 3000);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      if (ambientTimer.current) clearTimeout(ambientTimer.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (blinkTimer.current) clearTimeout(blinkTimer.current);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [handlePointerActive, startAmbientLoop, visibleItems]);

  const handleNavClick = (id) => {
    setWinkingId(id);
    setTimeout(() => {
      setWinkingId(null);
    }, 220);
    onNavigate(id);
  };

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <img src="/logo.png" alt="SkillGap AI" />
      </div>
      <ul className="navbar__links">
        {visibleItems.map((item) => {
          const isWinking = winkingId === item.id || winkingId === 'all';
          return (
            <li key={item.id}>
              <button
                className={`navbar__link ${activeSection === item.id ? 'navbar__link--active' : ''} ${item.id === 'verifier' ? 'navbar__link--unlocked' : ''}`}
                onClick={() => handleNavClick(item.id)}
                title={item.label}
              >
                <span
                  ref={(el) => (eyeRefs.current[item.id] = el)}
                  className={`navbar__eye ${isWinking ? 'navbar__eye--winking' : ''} ${isAmbient ? 'navbar__eye--ambient' : ''}`}
                  style={{
                    '--nav-eye-color': item.eyeColor,
                    '--nav-sclera-bg': item.scleraBg,
                    '--nav-eye-border': item.border,
                    '--nav-pupil-bg': item.pupilBg || '#000000',
                  }}
                  aria-hidden="true"
                >
                  <span className="navbar__eye-sclera">
                    <span className="navbar__eye-pupil">
                      <span className="navbar__eye-iris" />
                      <span className="navbar__eye-catchlight" />
                    </span>
                  </span>
                </span>
                <span className="navbar__label">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
