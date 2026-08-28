import './Sidebar.css';

const NAV_GROUPS = [
  {
    label: 'Analysis',
    items: [
      { id: 'overview', label: 'Overview', icon: '◎' },
      { id: 'repositories', label: 'Repositories', icon: '▦' },
      { id: 'skills', label: 'Skills', icon: '◆' },
      { id: 'quality', label: 'Quality', icon: '■' },
      { id: 'report', label: 'Report', icon: '▤' },
    ],
  },
  {
    label: 'Career Intelligence',
    items: [
      { id: 'roadmap', label: 'Roadmap', icon: '→' },
    ],
  },
  {
    label: 'AI',
    items: [
      { id: 'ai-mentor', label: 'AI Mentor', icon: 'AI' },
    ],
  },
  {
    label: 'Other',
    items: [
      { id: 'export', label: 'Export', icon: '↗' },
      { id: 'settings', label: 'Settings', icon: '⚙' },
    ],
  },
];

export default function Sidebar({ activeSection, onNavigate }) {
  return (
    <nav className="sidebar">
      <div className="sidebar__logo">
        <img src="/logo.svg" alt="Skill+" />
      </div>

      <div className="sidebar__groups">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="sidebar__group">
            <span className="sidebar__group-label">{group.label}</span>
            <ul className="sidebar__links">
              {group.items.map((item) => (
                <li key={item.id}>
                  <button
                    className={`sidebar__link ${activeSection === item.id ? 'sidebar__link--active' : ''}`}
                    onClick={() => onNavigate(item.id)}
                    title={item.label}
                  >
                    <span className="sidebar__icon">{item.icon}</span>
                    <span className="sidebar__label">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="sidebar__footer">
        <span className="sidebar__star">*</span>
        <span className="sidebar__version">v1.0</span>
      </div>
    </nav>
  );
}
