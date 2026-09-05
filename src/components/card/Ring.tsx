export interface RingProps {
  cx: number;
  cy: number;
  radius: number;
  color: string;
  strokeWidth?: number;
  /** Fraction 0-1 of the ring to draw. Omit for a full decorative ring (e.g. the streak card's fire ring). */
  progress?: number;
  trackColor?: string;
}

/**
 * A circular ring, either decorative (full circle) or a progress arc (used
 * by rank/trophy "next rank" indicators). Progress arcs start at the top
 * (12 o'clock) and sweep clockwise.
 */
export function Ring({ cx, cy, radius, color, strokeWidth = 5, progress, trackColor }: RingProps) {
  if (progress === undefined) {
    return <circle cx={cx} cy={cy} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} />;
  }

  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 1);
  const dashOffset = circumference * (1 - clamped);

  return (
    <g transform={`rotate(-90 ${cx} ${cy})`}>
      {trackColor && (
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      )}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
      />
    </g>
  );
}
