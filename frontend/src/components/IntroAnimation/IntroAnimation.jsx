import { useEffect, useRef } from 'react';
import './IntroAnimation.css';

export default function IntroAnimation({ onComplete }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoEnd = () => {
      setTimeout(() => onComplete(), 400);
    };

    video.addEventListener('ended', handleVideoEnd);
    const maxTimer = setTimeout(() => onComplete(), 8000);

    return () => {
      video.removeEventListener('ended', handleVideoEnd);
      clearTimeout(maxTimer);
    };
  }, [onComplete]);

  return (
    <div className="intro intro--video">
      <video
        ref={videoRef}
        className="intro__video"
        autoPlay
        muted
        playsInline
        preload="auto"
        onContextMenu={(e) => e.preventDefault()}
      >
        <source src="/intro.webm" type="video/webm" />
        <source src="/intro.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <button type="button" className="intro__skip" onClick={onComplete} aria-label="Skip Intro Video">
        Skip
      </button>
    </div>
  );
}
