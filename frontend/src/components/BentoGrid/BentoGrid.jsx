import './BentoGrid.css';

const FEATURES = [
  {
    title: 'LinkedIn Scan',
    desc: 'Deep analysis of your professional profile, endorsements, and career trajectory.',
    color: 'orange',
    icon: 'in',
    rotate: -3,
  },
  {
    title: 'GitHub Deep Dive',
    desc: 'Repo quality, language distribution, contribution patterns, and OSS presence.',
    color: 'cyan',
    icon: 'gh',
    rotate: 2,
  },
  {
    title: 'AI Roadmap',
    desc: 'Personalized learning paths based on market demand and your current skills.',
    color: 'pink',
    icon: 'AI',
    rotate: -1,
  },
  {
    title: 'Market Intel',
    desc: 'Real-time skill demand data to prioritize what to learn next.',
    color: 'yellow',
    icon: 'M',
    rotate: 4,
  },
  {
    title: 'Gap Reports',
    desc: 'Detailed reports highlighting exactly where you stand vs. industry standards.',
    color: 'lime',
    icon: 'R',
    rotate: -2,
    wide: true,
  },
  {
    title: 'Chat Assistant',
    desc: 'Ask anything about your career, skills, or how to use the platform.',
    color: 'purple',
    icon: 'C',
    rotate: 1,
  },
];

export default function BentoGrid({ onNavigate }) {
  const destinations = ['linkedin', 'github', 'roadmap', 'linkedin', 'roadmap', 'chat'];

  return (
    <section className="bento">
      <h2 className="bento__title reveal">What We Do</h2>
      <div className="bento__grid">
        {FEATURES.map((f, i) => (
          <button
            type="button"
            key={f.title}
            className={`bento__card bento__card--${f.color} ${f.wide ? 'bento__card--wide' : ''} reveal`}
            style={{ transform: `rotate(${f.rotate}deg)`, animationDelay: `${i * 0.1}s` }}
            onClick={() => onNavigate?.(destinations[i])}
          >
            <span className="bento__icon">{f.icon}</span>
            <h3 className="bento__card-title">{f.title}</h3>
            <p className="bento__card-desc">{f.desc}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
