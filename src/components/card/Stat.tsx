import { escapeXml } from "@/lib/escape";

export interface StatProps {
  x: number;
  y: number;
  value: string | number;
  label: string;
  valueColor: string;
  labelColor: string;
  fontFamily: string;
  valueFontSize?: number;
  labelFontSize?: number;
}

/**
 * A centered "big number over a label" column, the layout unit used by the
 * streak card's three sections and the stats card's stat rows.
 */
export function Stat({
  x,
  y,
  value,
  label,
  valueColor,
  labelColor,
  fontFamily,
  valueFontSize = 28,
  labelFontSize = 14,
}: StatProps) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <text
        x={0}
        y={valueFontSize + 4}
        textAnchor="middle"
        fill={valueColor}
        fontFamily={fontFamily}
        fontWeight={700}
        fontSize={valueFontSize}
      >
        {escapeXml(String(value))}
      </text>
      <text
        x={0}
        y={valueFontSize + 4 + labelFontSize + 22}
        textAnchor="middle"
        fill={labelColor}
        fontFamily={fontFamily}
        fontWeight={400}
        fontSize={labelFontSize}
      >
        {escapeXml(label)}
      </text>
    </g>
  );
}
