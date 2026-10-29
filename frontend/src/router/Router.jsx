import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const RouterContext = createContext(null);

export const ROUTES = {
  HOME: '/',
  LINKEDIN: '/linkedin',
  GITHUB: '/github',
  ROADMAP: '/roadmap',
  VERIFIER: '/verifier',
};

// Map URL pathname to route identifier
export function getRouteFromPath(pathname = window.location.pathname, hash = window.location.hash) {
  const cleanPath = pathname.toLowerCase().replace(/\/+$/, '') || '/';

  // Backwards compatibility with hash links (e.g., /#linkedin -> linkedin page)
  const cleanHash = hash.toLowerCase().replace(/^#/, '');
  if (cleanHash === 'linkedin' || cleanHash === 'linkedin-analysis') return 'linkedin';
  if (cleanHash === 'github' || cleanHash === 'github-analysis') return 'github';
  if (cleanHash === 'roadmap' || cleanHash === 'career-roadmap') return 'roadmap';
  if (cleanHash === 'verifier' || cleanHash === 'skill-verifier') return 'verifier';

  if (cleanPath === '/linkedin' || cleanPath === '/linkedin-analysis') return 'linkedin';
  if (cleanPath === '/github' || cleanPath === '/github-analysis') return 'github';
  if (cleanPath === '/roadmap' || cleanPath === '/career-roadmap') return 'roadmap';
  if (cleanPath === '/verifier' || cleanPath === '/skill-verifier') return 'verifier';

  return 'home';
}

export function getPathFromRoute(route) {
  switch (route) {
    case 'linkedin':
      return ROUTES.LINKEDIN;
    case 'github':
      return ROUTES.GITHUB;
    case 'roadmap':
      return ROUTES.ROADMAP;
    case 'verifier':
      return ROUTES.VERIFIER;
    case 'home':
    default:
      return ROUTES.HOME;
  }
}

// Per-page SEO, AEO, and GEO metadata definitions
export const PAGE_METADATA = {
  home: {
    title: 'SkillPulse AI — AI Skill Gap Analyzer | Free LinkedIn & GitHub Profile Review',
    description: 'SkillPulse AI is an AI skill gap analyzer and career analyzer. Analyze LinkedIn profile online, run a free GitHub profile review for developers, verify skills, and identify skill gaps for software developer jobs.',
    canonical: 'https://skillpulsai.vercel.app/',
    keywords: 'LinkedIn profile analyzer, GitHub profile analyzer, AI skill gap analyzer, AI career analyzer, Free LinkedIn profile analysis, GitHub profile review tool',
  },
  linkedin: {
    title: 'LinkedIn Profile Analyzer & AI Resume Review — SkillPulse AI',
    description: 'Free LinkedIn profile analysis online. Upload your LinkedIn PDF to extract verified skills, measure career trajectory, detect missing qualifications, and close skill gaps for software developer jobs.',
    canonical: 'https://skillpulsai.vercel.app/linkedin',
    keywords: 'LinkedIn profile analyzer, Free LinkedIn profile analysis, AI tool to improve LinkedIn profile, resume review, skill gap analysis, tech jobs',
  },
  github: {
    title: 'GitHub Profile Analyzer & Developer Review Tool — SkillPulse AI',
    description: 'Free GitHub profile review tool for developers. Measure byte-weighted language proficiency, repository test coverage, commit consistency, and engineering signals for software internships and jobs.',
    canonical: 'https://skillpulsai.vercel.app/github',
    keywords: 'GitHub profile analyzer, GitHub profile review tool, Analyze GitHub profile for developers, Developer profile analysis for internships, code quality inspection',
  },
  roadmap: {
    title: 'AI Career Roadmap & Adaptive Sprint Planner — SkillPulse AI',
    description: 'Personalized AI career roadmap generator. Synthesizes real skill gaps from your LinkedIn profile and GitHub repositories into milestone-driven sprints to level up your engineering career.',
    canonical: 'https://skillpulsai.vercel.app/roadmap',
    keywords: 'AI career analyzer, AI career roadmap, career roadmap generator, Identify skill gaps for software developer jobs, sprint planner, tech career growth',
  },
  verifier: {
    title: 'AI Code & Skill Verifier | Interactive Technical Challenges — SkillPulse AI',
    description: 'Verify your technical programming skills with interactive coding challenges calibrated to your GitHub tech stack. Automated scoring, question reviews, and developer skill certification.',
    canonical: 'https://skillpulsai.vercel.app/verifier',
    keywords: 'AI Code & Skill Verifier, technical coding challenges, developer skill verification, coding assessment, tech interview prep',
  },
};

export function RouterProvider({ children }) {
  const [route, setRoute] = useState(() => getRouteFromPath());

  const applyPageMetadata = useCallback((targetRoute) => {
    const meta = PAGE_METADATA[targetRoute] || PAGE_METADATA.home;
    document.title = meta.title;

    // Update Meta Description
    let descEl = document.querySelector('meta[name="description"]');
    if (!descEl) {
      descEl = document.createElement('meta');
      descEl.name = 'description';
      document.head.appendChild(descEl);
    }
    descEl.setAttribute('content', meta.description);

    // Update Meta Keywords
    let kwEl = document.querySelector('meta[name="keywords"]');
    if (kwEl) {
      kwEl.setAttribute('content', meta.keywords);
    }

    // Update Canonical URL
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.rel = 'canonical';
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', meta.canonical);

    // Update Open Graph & Twitter
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', meta.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', meta.description);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', meta.canonical);
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', meta.title);
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', meta.description);
  }, []);

  const navigate = useCallback((target, options = {}) => {
    let targetRoute = target;
    let targetPath = target;

    // Target can be a route name ('linkedin') or path ('/linkedin')
    if (target.startsWith('/')) {
      targetRoute = getRouteFromPath(target);
      targetPath = target;
    } else {
      targetPath = getPathFromRoute(target);
    }

    if (window.location.pathname !== targetPath) {
      if (options.replace) {
        window.history.replaceState(null, '', targetPath);
      } else {
        window.history.pushState(null, '', targetPath);
      }
    }

    setRoute(targetRoute);
    applyPageMetadata(targetRoute);

    if (options.scroll !== false) {
      window.scrollTo({ top: 0, behavior: options.smooth ? 'smooth' : 'auto' });
    }
  }, [applyPageMetadata]);

  // Handle browser back and forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const current = getRouteFromPath();
      setRoute(current);
      applyPageMetadata(current);
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    applyPageMetadata(route);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [applyPageMetadata, route]);

  const openMascotChat = useCallback((prompt) => {
    window.dispatchEvent(
      new CustomEvent('open-mascot-chat', {
        detail: { prompt: prompt || '' },
      })
    );
  }, []);

  return (
    <RouterContext.Provider value={{ route, path: getPathFromRoute(route), navigate, openMascotChat }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

