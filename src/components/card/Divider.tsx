export interface DividerProps {
  x: number;
  y1: number;
  y2: number;
  color: string;
}

/** A vertical divider line, e.g. between columns of a stats card. */
export function Divider({ x, y1, y2, color }: DividerProps) {
  return (
    <line
      x1={x}
      y1={y1}
      x2={x}
      y2={y2}
      vectorEffect="non-scaling-stroke"
      strokeWidth={1}
      stroke={color}
      strokeLinejoin="miter"
      strokeLinecap="square"
      strokeMiterlimit={3}
    />
  );
}
