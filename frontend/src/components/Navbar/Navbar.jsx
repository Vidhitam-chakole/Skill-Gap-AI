import './Navbar.css';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: 'H' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'in' },
  { id: 'github', label: 'GitHub', icon: 'gh' },
  { id: 'roadmap', label: 'Roadmap', icon: 'R' },
  { id: 'chat', label: 'Chat', icon: 'C' },
];

export default function Navbar({ activeSection, onNavigate }) {
  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <img src="/logo.png" alt="SkillGap AI" />
      </div>
      <ul className="navbar__links">
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <button
              className={`navbar__link ${activeSection === item.id ? 'navbar__link--active' : ''}`}
              onClick={() => onNavigate(item.id)}
              title={item.label}
            >
              <span className="navbar__icon">{item.icon}</span>
              <span className="navbar__label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="navbar__decor">
        <span className="navbar__star">*</span>
        <span className="navbar__arrow">&rarr;</span>
      </div>
    </nav>
  );
}
