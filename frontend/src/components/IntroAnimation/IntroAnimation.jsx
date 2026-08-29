import { useState, useEffect, useRef } from 'react';
import './IntroAnimation.css';

export default function IntroAnimation({ onComplete }) {
  const videoRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // When video ends, close the intro
    const handleVideoEnd = () => {
      setTimeout(() => onComplete(), 500);
    };

    // Mark video as ready when it can play
    const handleCanPlay = () => {
      setIsVideoReady(true);
    };

    video.addEventListener('ended', handleVideoEnd);
    video.addEventListener('canplay', handleCanPlay);

    // Auto-close after 10 seconds max (in case video doesn't end)
    const maxTimer = setTimeout(() => onComplete(), 10000);

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
        onContextMenu={(e) => e.preventDefault()}
      >
        <source src="/intro.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <button type="button" className="intro__skip" onClick={onComplete}>
        Skip
      </button>
    </div>
  );
}

