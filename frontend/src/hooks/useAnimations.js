import { useEffect, useRef } from 'react';

export function useScrollReveal(threshold = 0.12) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    const observeAll = () => {
      el.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((node) => {
        if (!node.classList.contains('visible')) {
          observer.observe(node);
        }
      });
    };

    observeAll();
    const mutations = new MutationObserver(observeAll);
    mutations.observe(el, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [threshold]);

  return ref;
}

export function useParallax(intensity = 0.03) {
  useEffect(() => {
    let ticking = false;
    let targetX = 0;
    let targetY = 0;

    const handleMove = (e) => {
      targetX = (e.clientX - window.innerWidth / 2) * intensity;
      targetY = (e.clientY - window.innerHeight / 2) * intensity;

      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          document.documentElement.style.setProperty('--parallax-x', `${targetX}px`);
          document.documentElement.style.setProperty('--parallax-y', `${targetY}px`);
          ticking = false;
        });
      }
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, [intensity]);
}

export function useIntroSeen() {
  const key = 'skillgap-intro-seen';
  return {
    hasSeen: sessionStorage.getItem(key) === 'true',
    markSeen: () => sessionStorage.setItem(key, 'true'),
  };
}

export function useScrollSpy(sectionIds, onChange) {
  useEffect(() => {
    const nodes = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!nodes.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) onChange(visible.target.id);
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0.1, 0.25, 0.5] }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sectionIds, onChange]);
}
