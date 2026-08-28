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
          }
        });
      },
      { threshold }
    );

    const observeAll = () => {
      el.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((node) => observer.observe(node));
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
    const handleMove = (e) => {
      const x = (e.clientX - window.innerWidth / 2) * intensity;
      const y = (e.clientY - window.innerHeight / 2) * intensity;
      document.documentElement.style.setProperty('--parallax-x', `${x}px`);
      document.documentElement.style.setProperty('--parallax-y', `${y}px`);
    };

    window.addEventListener('mousemove', handleMove);
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
