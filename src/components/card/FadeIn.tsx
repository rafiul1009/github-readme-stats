import type { ReactNode } from "react";

export interface FadeInProps {
  /** Animation start delay, in seconds. */
  delay?: number;
  /** Animation duration, in seconds. */
  duration?: number;
  disabled?: boolean;
  children: ReactNode;
}

/**
 * Wraps children in a fade-in entrance animation, staggered by `delay`.
 * When `disabled` (disable_animations=true, or PNG output), renders children
 * at full opacity with no animation, matching the current streak card's
 * disable_animations behavior.
 */
export function FadeIn({ delay = 0, duration = 0.5, disabled = false, children }: FadeInProps) {
  if (disabled) {
    return <g>{children}</g>;
  }

  return (
    <g style={{ opacity: 0, animation: `fadein ${duration}s linear forwards ${delay}s` }}>
      {children}
    </g>
  );
}

/** The <style> block FadeIn's animation depends on. Include once per card. */
export function FadeInKeyframes() {
  return (
    <style>{`
      @keyframes fadein { 0% { opacity: 0; } 100% { opacity: 1; } }
    `}</style>
  );
}
