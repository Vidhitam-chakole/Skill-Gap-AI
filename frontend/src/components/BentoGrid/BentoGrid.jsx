import { useEffect, useRef, useState, useCallback } from 'react';
import './BentoGrid.css';

const FEATURES = [
  {
    id: 'linkedin',
    destination: 'linkedin',
    title: 'LinkedIn Profile Analyzer',
    desc: 'Free LinkedIn profile analysis online. Deep review of career history, claimed skills, and job readiness.',
    color: 'orange',
    eyeColor: '#0077b5', // LinkedIn Blue
    scleraBg: '#ffffff',
    pupilBg: '#05070a',
    border: 'var(--black, #0a0a0a)',
    rotate: -3,
  },
  {
    id: 'github',
    destination: 'github',
    title: 'GitHub Profile Analyzer',
    desc: 'GitHub profile review tool for developers. Measure repo quality, test coverage, and language depth.',
    color: 'cyan',
    eyeColor: '#39d353', // GitHub Neon Green
    scleraBg: '#0d1117',
    pupilBg: '#05070a',
    border: '#39d353',
    rotate: 2,
  },
  {
    id: 'roadmap',
    destination: 'roadmap',
    title: 'AI Career Analyzer & Roadmap',
    desc: 'AI tool to improve LinkedIn profile standing with custom sprints tailored to high-demand skills.',
    color: 'pink',
    eyeColor: '#ffe600', // Roadmap Yellow
    scleraBg: '#ffffff',
    pupilBg: '#05070a',
    border: 'var(--black, #0a0a0a)',
    rotate: -1,
  },
  {
    id: 'verifier',
    destination: 'verifier',
    title: 'AI Code & Skill Verifier',
    desc: 'Interactive coding challenges to verify technical skills and validate developer proficiency.',
    color: 'yellow',
    eyeColor: '#a6ff00', // Verifier Lime
    scleraBg: '#ffffff',
    pupilBg: '#05070a',
    border: 'var(--black, #0a0a0a)',
    rotate: 4,
  },
  {
    id: 'reports',
    destination: 'roadmap',
    title: 'Developer Profile Analysis',
    desc: 'Identify skill gaps for software developer jobs and internships compared to industry hiring standards.',
    color: 'lime',
    eyeColor: '#ff0055', // Vibrant Magenta
    scleraBg: '#ffffff',
    pupilBg: '#05070a',
    border: 'var(--black, #0a0a0a)',
    rotate: -2,
    wide: true,
  },
  {
    id: 'chat',
    destination: 'chat',
    title: 'AI Career Coach',
    desc: 'Ask your AI assistant anything about tech interview prep, system design, and career roadmap steps.',
    color: 'purple',
    eyeColor: '#ff5c00', // Chad Orange
    scleraBg: '#ffffff',
    pupilBg: '#05070a',
    border: 'var(--black, #0a0a0a)',
    rotate: 1,
  },
];

export default function BentoGrid({ onNavigate }) {
  const eyeRefs = useRef({});
  const eyePositions = useRef(new Map());
  const targetPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [isAmbient, setIsAmbient] = useState(true);
  const [blinkingEyes, setBlinkingEyes] = useState({});

  const idleTimer = useRef(null);
  const ambientTimer = useRef(null);
  const rafId = useRef(null);

  // Cache eye bounding coordinates to avoid repeated layout thrashing (getBoundingClientRect) on every mousemove
  const refreshEyePositions = useCallback(() => {
    if (!eyeRefs.current) return;
    Object.entries(eyeRefs.current).forEach(([key, eyeEl]) => {
      if (!eyeEl) return;
      const rect = eyeEl.getBoundingClientRect();
      eyePositions.current.set(key, {
        cx: rect.left + rect.width / 2,
        cy: rect.top + rect.height / 2,
        maxTravel: rect.width * 0.24,
      });
    });
  }, []);

  // Update eye pupils to look at target position using cached layout measurements
  const updateEyes = useCallback(() => {
    if (!eyeRefs.current) return;

    Object.entries(eyeRefs.current).forEach(([key, eyeEl]) => {
      if (!eyeEl) return;
      let pos = eyePositions.current.get(key);
      if (!pos) {
        const rect = eyeEl.getBoundingClientRect();
        pos = {
          cx: rect.left + rect.width / 2,
          cy: rect.top + rect.height / 2,
          maxTravel: rect.width * 0.24,
        };
        eyePositions.current.set(key, pos);
      }

      const dx = targetPos.current.x - pos.cx;
      const dy = targetPos.current.y - pos.cy;
      const angle = Math.atan2(dy, dx);
      const dist = Math.hypot(dx, dy);

      const travel = Math.min(dist / 14, pos.maxTravel);
      const pupilX = Math.cos(angle) * travel;
      const pupilY = Math.sin(angle) * travel;

      const pupilEl = eyeEl.querySelector('.bento__eye-pupil');
      if (pupilEl) {
        pupilEl.style.transform = `translate3d(${pupilX.toFixed(2)}px, ${pupilY.toFixed(2)}px, 0)`;
      }
    });
  }, []);

  // Ambient idle wander loop
  const startAmbientLoop = useCallback(() => {
    setIsAmbient(true);

    const waypoints = [
      { xRatio: 0.5, yRatio: 0.35 },
      { xRatio: 0.7, yRatio: 0.6 },
      { xRatio: 0.35, yRatio: 0.75 },
      { xRatio: 0.65, yRatio: 0.4 },
      { xRatio: 0.3, yRatio: 0.45 },
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

  const handlePointerActive = useCallback(
    (clientX, clientY) => {
      setIsAmbient(false);
      targetPos.current = { x: clientX, y: clientY };

      if (ambientTimer.current) clearTimeout(ambientTimer.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);

      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(updateEyes);

      idleTimer.current = setTimeout(() => {
        startAmbientLoop();
      }, 2500);
    },
    [updateEyes, startAmbientLoop]
  );

  // Setup cursor, scroll and resize listeners
  useEffect(() => {
    const onMouseMove = (e) => handlePointerActive(e.clientX, e.clientY);
    const onTouchStart = (e) => {
      if (e.touches && e.touches[0]) handlePointerActive(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) handlePointerActive(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('scroll', refreshEyePositions, { passive: true });
    window.addEventListener('resize', refreshEyePositions, { passive: true });

    refreshEyePositions();
    startAmbientLoop();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('scroll', refreshEyePositions);
      window.removeEventListener('resize', refreshEyePositions);
      if (ambientTimer.current) clearTimeout(ambientTimer.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [handlePointerActive, refreshEyePositions, startAmbientLoop]);

  // Completely desynchronized, random individual blinking for each eye
  useEffect(() => {
    let isMounted = true;
    const timers = [];

    FEATURES.forEach((feature, index) => {
      const scheduleNextBlink = () => {
        const delay = 2200 + Math.random() * 4300;
        const timerId = setTimeout(() => {
          if (!isMounted) return;

          setBlinkingEyes((prev) => ({ ...prev, [feature.id]: true }));

          const closeTimer = setTimeout(() => {
            if (!isMounted) return;
            setBlinkingEyes((prev) => ({ ...prev, [feature.id]: false }));
            scheduleNextBlink();
          }, 125 + Math.random() * 35);
          timers.push(closeTimer);
        }, delay);
        timers.push(timerId);
      };

      const initialOffset = 400 + index * 650 + Math.random() * 1100;
      const initialTimer = setTimeout(() => {
        if (!isMounted) return;
        scheduleNextBlink();
      }, initialOffset);
      timers.push(initialTimer);
    });

    return () => {
      isMounted = false;
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  const handleCardClick = (feature) => {
    setBlinkingEyes((prev) => ({ ...prev, [feature.id]: true }));
    setTimeout(() => {
      setBlinkingEyes((prev) => ({ ...prev, [feature.id]: false }));
    }, 200);
    onNavigate?.(feature.destination);
  };

  return (
    <section className="bento" id="bento-tools">
      <h2 className="bento__title reveal">AI Career Analyzer &amp; Profile Review Tools</h2>
      <div className="bento__grid">
        {FEATURES.map((f, i) => {
          const isBlinking = Boolean(blinkingEyes[f.id]);
          return (
            <button
              type="button"
              key={f.title}
              className={`bento__card bento__card--${f.color} ${f.wide ? 'bento__card--wide' : ''} reveal`}
              style={{ transform: `rotate(${f.rotate}deg)`, animationDelay: `${i * 0.1}s` }}
              onClick={() => handleCardClick(f)}
            >
              <div className="bento__eye-wrapper">
                <span
                  ref={(el) => (eyeRefs.current[f.id] = el)}
                  className={`bento__eye ${isBlinking ? 'bento__eye--blinking' : ''} ${isAmbient ? 'bento__eye--ambient' : ''}`}
                  style={{
                    '--bento-eye-color': f.eyeColor,
                    '--bento-sclera-bg': f.scleraBg,
                    '--bento-pupil-bg': f.pupilBg,
                    '--bento-eye-border': f.border,
                  }}
                  aria-hidden="true"
                >
                  <span className="bento__eye-sclera">
                    <span className="bento__eye-pupil">
                      <span className="bento__eye-iris" />
                      <span className="bento__eye-catchlight" />
                    </span>
                  </span>
                </span>
              </div>
              <h3 className="bento__card-title">{f.title}</h3>
              <p className="bento__card-desc">{f.desc}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
