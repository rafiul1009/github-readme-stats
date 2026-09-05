import { escapeXml } from "@/lib/escape";

export interface TitleProps {
  x: number;
  y: number;
  text: string;
  color: string;
  fontFamily: string;
  fontSize?: number;
  textAnchor?: "start" | "middle" | "end";
}

export function Title({ x, y, text, color, fontFamily, fontSize = 18, textAnchor = "start" }: TitleProps) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fill={color}
      fontFamily={fontFamily}
      fontWeight={700}
      fontSize={fontSize}
    >
      {escapeXml(text)}
    </text>
  );
}
