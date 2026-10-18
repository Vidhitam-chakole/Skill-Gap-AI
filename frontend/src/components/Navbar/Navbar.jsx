import { useAnalysis } from '../../context/AnalysisContext';
import './Navbar.css';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: 'H' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'in' },
  { id: 'github', label: 'GitHub', icon: 'gh' },
  { id: 'verifier', label: 'Verifier', icon: 'V' },
  { id: 'roadmap', label: 'Roadmap', icon: 'R' },
  { id: 'chat', label: 'Chat', icon: 'C' },
];

export default function Navbar({ activeSection, onNavigate }) {
  const { linkedinResult, githubResult } = useAnalysis();
  const isVerifierReady = Boolean(linkedinResult && githubResult);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.id === 'verifier') {
      return isVerifierReady;
    }
    return true;
  });

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <img src="/logo.png" alt="SkillGap AI" />
      </div>
      <ul className="navbar__links">
        {visibleItems.map((item) => (
          <li key={item.id}>
            <button
              className={`navbar__link ${activeSection === item.id ? 'navbar__link--active' : ''} ${item.id === 'verifier' ? 'navbar__link--unlocked' : ''}`}
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
