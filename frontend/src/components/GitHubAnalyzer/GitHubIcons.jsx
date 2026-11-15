import React from 'react';

const baseProps = (size = 16, className = '') => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '2',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: `gh-icon ${className}`.trim(),
  style: { display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 },
});

export const IconRepo = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
    <path d="M6 6h10" />
    <path d="M6 10h10" />
  </svg>
);

export const IconStar = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const IconFork = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <line x1="6" y1="3" x2="6" y2="15" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 9a9 9 0 0 1-9 9" />
  </svg>
);

export const IconCommit = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <circle cx="12" cy="12" r="4" />
    <line x1="1.05" y1="12" x2="7" y2="12" />
    <line x1="17.01" y1="12" x2="22.96" y2="12" />
  </svg>
);

export const IconBranch = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <line x1="6" y1="3" x2="6" y2="15" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 9a9 9 0 0 1-9 9" />
  </svg>
);

export const IconPullRequest = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <path d="M13 6h3a2 2 0 0 1 2 2v7" />
    <line x1="6" y1="9" x2="6" y2="21" />
  </svg>
);

export const IconIssue = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const IconReview = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

export const IconDiscussion = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const IconCalendar = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export const IconActivity = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export const IconStreak = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export const IconUsers = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const IconBuilding = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="9" y1="22" x2="9" y2="22.01" />
    <line x1="15" y1="22" x2="15" y2="22.01" />
    <line x1="9" y1="6" x2="9" y2="6.01" />
    <line x1="15" y1="6" x2="15" y2="6.01" />
    <line x1="9" y1="10" x2="9" y2="10.01" />
    <line x1="15" y1="10" x2="15" y2="10.01" />
    <line x1="9" y1="14" x2="9" y2="14.01" />
    <line x1="15" y1="14" x2="15" y2="14.01" />
    <line x1="9" y1="18" x2="9" y2="18.01" />
    <line x1="15" y1="18" x2="15" y2="18.01" />
  </svg>
);

export const IconGist = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

export const IconMapPin = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const IconLink = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export const IconTwitter = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <path d="M4 4l11.733 16h4.267l-11.733-16z" />
    <path d="M4 20l6.768-6.768m3.464-3.464L20 4" />
  </svg>
);

export const IconClock = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const IconShield = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const IconShieldCheck = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const IconShieldAlert = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const IconLock = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const IconFileText = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export const IconFolder = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

export const IconTerminal = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

export const IconDatabase = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

export const IconCloud = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>
);

export const IconServer = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </svg>
);

export const IconCpu = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="15" x2="23" y2="15" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="15" x2="4" y2="15" />
  </svg>
);

export const IconLayers = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

export const IconTool = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

export const IconTestTube = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2" />
    <path d="M8.5 2h7" />
    <path d="M9.5 12h5" />
  </svg>
);

export const IconEye = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconCheck = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const IconClose = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const IconAlertTriangle = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const IconInfo = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export const IconGlobe = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const IconExternalLink = ({ size = 14, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export const IconLayout = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

export const IconHardDrive = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <line x1="22" y1="12" x2="2" y2="12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    <line x1="6" y1="16" x2="6.01" y2="16" />
    <line x1="10" y1="16" x2="10.01" y2="16" />
  </svg>
);

export const IconChart = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

export const IconAudit = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9 15l2 2 4-4" />
  </svg>
);

export const IconTrendingUp = ({ size = 16, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export const IconBolt = ({ size = 14, className = '' }) => (
  <svg {...baseProps(size, className)}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
