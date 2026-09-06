export type StatIconName =
  | "star"
  | "commit"
  | "pr"
  | "issue"
  | "contrib"
  | "follower"
  | "review"
  | "discussion"
  | "repo";

export interface StatIconProps {
  name: StatIconName;
  x: number;
  y: number;
  size?: number;
  color: string;
}

/**
 * Small original 16x16 glyphs (not reproductions of any icon set) for the
 * stats card's optional show_icons mode. Kept intentionally simple —
 * geometric shapes rather than pixel-precise iconography. `stroke`/`fill`
 * are set once on the wrapping <g> and inherited by children that don't
 * override them, so each glyph only needs to say `fill="none"` where it
 * wants an outline instead of a solid shape.
 */
export function StatIcon({ name, x, y, size = 16, color }: StatIconProps) {
  const scale = size / 16;

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} fill={color} stroke={color} strokeWidth={1.5}>
      {renderGlyph(name)}
    </g>
  );
}

function renderGlyph(name: StatIconName) {
  switch (name) {
    case "star":
      return <path stroke="none" d="M8 0.5 L9.9 5.1 L15 5.5 L11.1 8.9 L12.3 14 L8 11.2 L3.7 14 L4.9 8.9 L1 5.5 L6.1 5.1 Z" />;
    case "commit":
      return (
        <>
          <circle cx={8} cy={8} r={2.6} fill="none" />
          <line x1={0} y1={8} x2={5.4} y2={8} />
          <line x1={10.6} y1={8} x2={16} y2={8} />
        </>
      );
    case "pr":
      return (
        <>
          <circle cx={3} cy={3} r={1.8} fill="none" />
          <circle cx={3} cy={13} r={1.8} fill="none" />
          <circle cx={13} cy={5} r={1.8} fill="none" />
          <line x1={3} y1={4.8} x2={3} y2={11.2} />
          <path d="M3 11.2 C3 8 6 6.8 8 6.8 L13 6.8" fill="none" />
        </>
      );
    case "issue":
      return (
        <>
          <circle cx={8} cy={8} r={6.5} fill="none" />
          <circle cx={8} cy={8} r={1.8} stroke="none" />
        </>
      );
    case "contrib":
      return (
        <>
          <circle cx={5.5} cy={8} r={4} fill="none" opacity={0.55} />
          <circle cx={10.5} cy={8} r={4} fill="none" />
        </>
      );
    case "follower":
      return (
        <>
          <circle cx={8} cy={5} r={3} stroke="none" />
          <path stroke="none" d="M1.5 15 C1.5 10.5 5 9 8 9 C11 9 14.5 10.5 14.5 15 Z" />
        </>
      );
    case "review":
      return (
        <>
          <rect x={1.5} y={2} width={13} height={9} rx={1.5} fill="none" />
          <path stroke="none" d="M4.5 15 L7 11 H4.5 Z" />
        </>
      );
    case "discussion":
      return <path d="M2 3 H14 V10 H6 L3 13 V10 H2 Z" fill="none" strokeLinejoin="round" />;
    case "repo":
      return (
        <>
          <rect x={1.5} y={1.5} width={13} height={13} rx={1.8} fill="none" />
          <line x1={5} y1={1.5} x2={5} y2={14.5} />
        </>
      );
    default:
      return null;
  }
}
