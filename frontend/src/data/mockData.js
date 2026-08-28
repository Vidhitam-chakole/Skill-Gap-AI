export const mockLinkedInResults = {
  analysisId: 'li-mock-001',
  profileUrl: 'https://linkedin.com/in/example',
  name: 'Alex Rivera',
  headline: 'Full-Stack Developer | React & Node.js',
  overallScore: 78,
  skillGaps: [
    { skill: 'System Design', severity: 'high', recommendation: 'Study distributed systems & microservices patterns' },
    { skill: 'Cloud (AWS/GCP)', severity: 'medium', recommendation: 'Complete AWS Solutions Architect certification' },
    { skill: 'DevOps / CI-CD', severity: 'medium', recommendation: 'Learn Docker, Kubernetes, and GitHub Actions' },
    { skill: 'GraphQL', severity: 'low', recommendation: 'Build a side project using Apollo Server' },
  ],
  strengths: ['React', 'JavaScript', 'Team Leadership', 'Agile'],
  marketDemand: [
    { skill: 'React', demand: 92 },
    { skill: 'TypeScript', demand: 88 },
    { skill: 'AWS', demand: 85 },
    { skill: 'Python', demand: 79 },
  ],
};

export const mockGitHubResults = {
  analysisId: 'gh-mock-001',
  username: 'alexrivera-dev',
  name: 'Alex Rivera',
  overallScore: 82,
  stats: { repos: 47, stars: 312, followers: 89, contributions: 1240 },
  topLanguages: [
    { name: 'JavaScript', percentage: 42 },
    { name: 'TypeScript', percentage: 28 },
    { name: 'Python', percentage: 18 },
    { name: 'CSS', percentage: 12 },
  ],
  skillGaps: [
    { skill: 'Testing (Jest/Cypress)', severity: 'high', recommendation: 'Add unit & e2e tests to existing repos' },
    { skill: 'Open Source Contributions', severity: 'medium', recommendation: 'Contribute to 2-3 popular OSS projects' },
    { skill: 'Documentation', severity: 'low', recommendation: 'Improve README files across repositories' },
  ],
  pinnedRepos: [
    { name: 'react-dashboard', stars: 89, language: 'TypeScript' },
    { name: 'node-api-starter', stars: 56, language: 'JavaScript' },
    { name: 'ml-pipeline', stars: 34, language: 'Python' },
  ],
};

export const mockRoadmap = {
  roadmapId: 'rm-mock-001',
  combinedScore: 80,
  summary: 'Combined career score 80/100. Close high-severity gaps first over the next four weeks.',
  priorities: [
    { skill: 'System Design', severity: 'high', source: 'linkedin', recommendation: 'Study distributed systems and ship a small architecture writeup.' },
    { skill: 'Testing (Jest/Cypress)', severity: 'high', source: 'github', recommendation: 'Add unit and e2e tests to your main repositories.' },
    { skill: 'Cloud (AWS/GCP)', severity: 'medium', source: 'linkedin', recommendation: 'Complete a cloud fundamentals path and deploy one service.' },
  ],
  weeks: [
    { week: 1, focus: 'System Design', tasks: ['Sketch a request flow for one of your apps', 'Read one distributed-systems primer', 'Write a 1-page design doc'] },
    { week: 2, focus: 'Testing', tasks: ['Add Jest/Vitest to the main repo', 'Cover the happiest user path', 'Document how to run tests in the README'] },
    { week: 3, focus: 'Cloud', tasks: ['Containerize one service', 'Deploy a preview environment', 'Add a simple health check'] },
    { week: 4, focus: 'Portfolio polish', tasks: ['Pin the repo', 'Post a LinkedIn recap', 'Prepare two interview stories from the work'] },
  ],
  nextActions: [
    'Study distributed systems & microservices patterns',
    'Add unit & e2e tests to existing repos',
    'Complete AWS Solutions Architect certification',
  ],
};

export const mockChatResponses = [
  "Based on your profile, I'd recommend focusing on cloud architecture skills — they're in high demand right now!",
  'Great question! Your GitHub shows strong frontend skills. Consider adding backend projects to become full-stack.',
  'I analyzed similar profiles — developers who learn System Design see a 23% salary increase on average.',
  "Try building a project that uses Docker + Kubernetes. It'll fill a major gap in your current skill set.",
];
