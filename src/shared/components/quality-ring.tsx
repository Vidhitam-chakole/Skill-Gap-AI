/**
 * Quality Score Ring — BRUTALIST
 * Reference: Design Spec §B.15, Brutalism × Neo-Maximalism restyle
 *
 * Thick-stroked SVG ring, harsh colors, monospace score center.
 */

import { useEffect, useState } from "react";
import type { QualitySubScores } from "@/shared/types";
import { getQualityColor, getQualityLevel } from "@/shared/utils/confidence";
import { cn } from "@/shared/utils/cn";

interface QualityRingProps {
  score: number;
  subScores: QualitySubScores;
  size?: number;
  className?: string;
}

const SEGMENT_KEYS: (keyof QualitySubScores)[] = [
  "documentation",
  "testing",
  "cicd",
  "structure",
];

export function QualityRing({
  score,
  subScores,
  size = 80,
  className,
}: QualityRingProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const segmentLength = circumference / 4;
  const gap = 6;
  const usableSegment = segmentLength - gap;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {SEGMENT_KEYS.map((key, i) => {
          const value = subScores[key] ?? 0;
          const level = getQualityLevel(value);
          const color = getQualityColor(level);
          const dashOffset = mounted
            ? usableSegment * (1 - value / 100)
            : usableSegment;
          const delay = i * 100;

          return (
            <circle
              key={key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${usableSegment} ${gap}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
              style={{
                transition: `stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
                transform: `rotate(${i * 90}deg)`,
                transformOrigin: "center",
              }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-heading-md font-bold text-text-primary">
          {score}
        </span>
      </div>
    </div>
  );
}

/**
 * Mini Quality Ring for cards (32px) — BRUTALIST
 */
export function MiniQualityRing({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const level = getQualityLevel(score);
  const color = getQualityColor(level);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
    >
      <svg width={36} height={36} className="-rotate-90">
        <circle
          cx={18}
          cy={18}
          r={13}
          fill="none"
          stroke="var(--color-border-subtle)"
          strokeWidth={4}
        />
        <circle
          cx={18}
          cy={18}
          r={13}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeDasharray={`${(2 * Math.PI * 13 * score) / 100} ${2 * Math.PI * 13}`}
          strokeLinecap="butt"
        />
      </svg>
      <span className="absolute font-mono text-[9px] font-bold text-text-primary">
        {score}
      </span>
    </div>
  );
}
