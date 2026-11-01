import { useAnalysis } from '../../context/AnalysisContext';
import './Navbar.css';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: 'H' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'in' },
  { id: 'github', label: 'GitHub', icon: 'gh' },
  { id: 'roadmap', label: 'Roadmap', icon: 'R' },
  { id: 'verifier', label: 'Verifier', icon: 'V' },
  { id: 'faq', label: 'FAQ', icon: '?' },
];

export default function Navbar({ activeSection, onNavigate }) {
  const { linkedinResult, githubResult, isVerifierUnlocked } = useAnalysis();
  const isVerifierReady = Boolean(linkedinResult || githubResult || isVerifierUnlocked);

  return (
    <nav className="navbar" aria-label="Main Navigation">
      <div
        className="navbar__logo"
        onClick={() => onNavigate('home')}
        style={{ cursor: 'pointer' }}
        title="Skill Plus AI Home"
      >
        <picture>
          <source srcSet="/logo-192.webp" type="image/webp" />
          <img src="/logo-192.png" alt="Skill Plus AI" width="52" height="52" loading="eager" />
        </picture>
      </div>

      <ul className="navbar__links">
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <button
              className={`navbar__link ${activeSection === item.id ? 'navbar__link--active' : ''} ${item.id === 'verifier' && isVerifierReady ? 'navbar__link--unlocked' : ''}`}
              onClick={() => onNavigate(item.id)}
              title={item.label}
              aria-label={`Navigate to ${item.label}`}
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
