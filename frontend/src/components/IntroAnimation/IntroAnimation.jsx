import { useState, useEffect, useRef } from 'react';
import './IntroAnimation.css';

export default function IntroAnimation({ onComplete }) {
  const videoRef = useRef(null);
  const [, setIsVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // When video ends, close the intro
    const handleVideoEnd = () => {
      setTimeout(() => onComplete(), 400);
    };

    // Mark video as ready when it can play
    const handleCanPlay = () => {
      setIsVideoReady(true);
    };

    video.addEventListener('ended', handleVideoEnd);
    video.addEventListener('canplay', handleCanPlay);

    // Auto-close after 8 seconds max (in case video doesn't end)
    const maxTimer = setTimeout(() => onComplete(), 8000);

    return () => {
      video.removeEventListener('ended', handleVideoEnd);
      video.removeEventListener('canplay', handleCanPlay);
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
