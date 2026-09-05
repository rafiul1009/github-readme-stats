import type { ReactNode } from "react";

export interface CardProps {
  width: number;
  height: number;
  background: string;
  border: string;
  borderRadius?: number;
  borderWidth?: number;
  hideBorder?: boolean;
  /** Unique id prefix for this card's <defs> elements, to avoid collisions when multiple cards share a page. */
  idPrefix: string;
  children: ReactNode;
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
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect
          x={borderWidth / 2}
          y={borderWidth / 2}
          width={width - borderWidth}
          height={height - borderWidth}
          rx={borderRadius}
          fill={background}
          stroke={hideBorder ? "transparent" : border}
          strokeWidth={borderWidth}
        />
        {children}
      </g>
    </svg>
  );
}
