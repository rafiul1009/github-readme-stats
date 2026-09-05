import { wrapText } from "@/lib/text";
import { Card } from "./Card";

export interface ErrorCardProps {
  message: string;
  width?: number;
  height?: number;
}

/**
 * Themed error card (docs/TODOS.md 3.6): an `<img>` tag has no way to show
 * plain-text error bodies, so a failed render still needs to produce a
 * valid, readable SVG rather than a broken-image icon in the README.
 */
export function ErrorCard({ message, width = 400, height = 120 }: ErrorCardProps) {
  const lines = wrapText(message, 46, 3);

  return (
    <Card width={width} height={height} background="#fff0f0" border="#e34848" borderRadius={4.5} idPrefix="error">
      <g transform="translate(24, 30)">
        <circle cx={8} cy={8} r={9} fill="none" stroke="#d33" strokeWidth={1.6} />
        <line x1={8} y1={4} x2={8} y2={9} stroke="#d33" strokeWidth={1.6} strokeLinecap="round" />
        <circle cx={8} cy={12.3} r={1} fill="#d33" />
      </g>
      <text x={46} y={36} fill="#a11" fontFamily="Inter, Ubuntu, sans-serif" fontWeight={700} fontSize={13}>
        Could not render widget
      </text>
      {lines.map((line, i) => (
        <text
          key={i}
          x={24}
          y={58 + i * 18}
          fill="#a11"
          fontFamily="Inter, Ubuntu, sans-serif"
          fontSize={12}
        >
          {line}
        </text>
      ))}
    </Card>
  );
}
