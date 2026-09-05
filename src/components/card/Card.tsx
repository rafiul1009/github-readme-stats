import type { ReactNode } from "react";
import type { ColorValue } from "@/lib/color";

export interface CardProps {
  width: number;
  height: number;
  /** A solid color string, or a parsed gradient (see src/lib/color.ts parseColorValue). */
  background: string | ColorValue;
  border: string;
  borderRadius?: number;
  borderWidth?: number;
  hideBorder?: boolean;
  /** Unique id prefix for this card's <defs> elements, to avoid collisions when multiple cards share a page. */
  idPrefix: string;
  children: ReactNode;
}

/** Converts a CSS gradient angle (0deg = to top, 90deg = to right, ...) into an objectBoundingBox gradient vector. */
function gradientVector(angleDeg: number) {
  const theta = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(theta);
  const dy = -Math.cos(theta);
  return {
    x1: 0.5 - dx / 2,
    y1: 0.5 - dy / 2,
    x2: 0.5 + dx / 2,
    y2: 0.5 + dy / 2,
  };
}

/**
 * Shared outer card shell: sizes the SVG viewport, clips content to a
 * rounded rect, and draws the background/border. Every widget's root
 * element should be a <Card>.
 */
export function Card({
  width,
  height,
  background,
  border,
  borderRadius = 4.5,
  borderWidth = 1,
  hideBorder = false,
  idPrefix,
  children,
}: CardProps) {
  const clipId = `${idPrefix}-outer-rect`;
  const gradientId = `${idPrefix}-bg-gradient`;
  const isGradient = typeof background === "object" && background.type === "gradient";
  const backgroundFill = isGradient ? `url(#${gradientId})` : (background as string);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      direction="ltr"
    >
      <defs>
        <clipPath id={clipId}>
          <rect width={width} height={height} rx={borderRadius} />
        </clipPath>
        {isGradient && (
          <linearGradient id={gradientId} {...gradientVector(background.angle)}>
            {background.stops.map((stop, index) => (
              <stop
                key={index}
                offset={`${(index / Math.max(background.stops.length - 1, 1)) * 100}%`}
                stopColor={stop}
              />
            ))}
          </linearGradient>
        )}
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect
          x={borderWidth / 2}
          y={borderWidth / 2}
          width={width - borderWidth}
          height={height - borderWidth}
          rx={borderRadius}
          fill={backgroundFill}
          stroke={hideBorder ? "transparent" : border}
          strokeWidth={borderWidth}
        />
        {children}
      </g>
    </svg>
  );
}
