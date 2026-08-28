import './Decorative.css';

export function FloatingShapes() {
  return (
    <div className="deco-shapes" aria-hidden="true">
      <div className="deco-shapes__item deco-shapes__item--star">*</div>
      <div className="deco-shapes__item deco-shapes__item--circle" />
      <div className="deco-shapes__item deco-shapes__item--triangle" />
      <div className="deco-shapes__item deco-shapes__item--cross">+</div>
    </div>
  );
}

export function SectionHeader({ tag, title, subtitle, rotate = -1 }) {
  return (
    <div className="section-header reveal" style={{ '--rotate': `${rotate}deg` }}>
      <span className="section-header__tag">{tag}</span>
      <h2 className="section-header__title">{title}</h2>
      {subtitle && <p className="section-header__subtitle">{subtitle}</p>}
    </div>
  );
}

export function Sticker({ children, color = 'yellow', rotation = -5, className = '' }) {
  return (
    <div
      className={`sticker sticker--${color} ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {children}
    </div>
  );
}
