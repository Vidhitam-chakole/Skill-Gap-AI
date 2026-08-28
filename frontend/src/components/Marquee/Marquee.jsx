import './Marquee.css';

export default function Marquee({ items, speed = 30, direction = 'left' }) {
  const doubled = [...items, ...items];

  return (
    <div className={`marquee marquee--${direction}`}>
      <div className="marquee__track" style={{ '--speed': `${speed}s` }}>
        {doubled.map((item, i) => (
          <span key={i} className="marquee__item">
            {item}
            <span className="marquee__star">★</span>
          </span>
        ))}
      </div>
    </div>
  );
}
