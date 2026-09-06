/**
 * MotionCard — Brutalist Animated Card
 * A card with Framer Motion hover/tap animations and brutalist styling.
 */

import { motion } from "framer-motion";
import { cn } from "@/shared/utils/cn";
import type { ReactNode } from "react";

interface MotionCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  /** Enable hover lift animation */
  hover?: boolean;
  /** Enable tap (click) animation */
  tap?: boolean;
  /** Delay for stagger animations */
  delay?: number;
}

export function MotionCard({
  children,
  className,
  onClick,
  hover = true,
  tap = true,
  delay = 0,
}: MotionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
      whileHover={hover ? { y: -4, boxShadow: "6px 6px 0px 0px #B8FF00" } : undefined}
      whileTap={tap ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        "border-2 border-border-strong bg-bg-surface transition-colors",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

/**
 * MotionButton — Animated button with brutalist hover
 */
export function MotionButton({
  children,
  className,
  onClick,
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "default" | "primary" | "ghost";
}) {
  const variants = {
    default: "border-2 border-border-strong bg-bg-surface text-text-secondary hover:border-brand-primary hover:text-brand-primary",
    primary: "border-2 border-brand-primary bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20",
    ghost: "text-text-secondary hover:text-text-primary",
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 font-mono text-caption font-bold uppercase transition-colors",
        variants[variant],
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
