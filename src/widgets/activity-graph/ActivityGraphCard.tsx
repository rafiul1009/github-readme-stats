import { Card, DrawOnPath, FadeIn, FadeInKeyframes, RtlMirror } from "@/components/card";
import { resolveThemeSlots, type ThemeDefinition } from "@/lib/themes";
import { normalizeOverrideColor, parseColorValue } from "@/lib/color";
import { formatNumber } from "@/lib/format";
import { formatDatePattern, t, isRtlLocale, monthShortLabel } from "@/lib/i18n";
import type { ActivityPoint, ActivityGranularity } from "@/lib/activity";

export interface ActivityGraphCardOverrides {
  background?: string;
  border?: string;
  title?: string;
  text?: string;
  accent?: string;
}

export interface ActivityGraphCardProps {
  points: ActivityPoint[];
  granularity: ActivityGranularity;
  style: "line" | "area" | "bar";
  showPoints: boolean;
  hideGrid: boolean;
  customTitle?: string;
  theme: ThemeDefinition;
  overrides?: ActivityGraphCardOverrides;
  locale?: string;
  numberFormat?: "short" | "long";
  disableAnimations?: boolean;
  hideBorder?: boolean;
  hideTitle?: boolean;
  borderRadius?: number;
  borderWidth?: number;
  width?: number;
  height?: number;
}

const BASE_WIDTH = 720;
const BASE_HEIGHT = 280;
const MARGIN_LEFT = 45;
const MARGIN_RIGHT = 20;
const MARGIN_BOTTOM = 30;
const MAX_X_LABELS = 6;
const GRID_LINES = 4;
const FONT = "Inter, Ubuntu, sans-serif";

function labelFor(dateStr: string, granularity: ActivityGranularity, locale: string): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  if (granularity === "month") return monthShortLabel(date, locale);
  return formatDatePattern(date, "M j", locale, new Date().getUTCFullYear());
}

function pickLabelIndices(count: number): number[] {
  if (count <= MAX_X_LABELS) return Array.from({ length: count }, (_, i) => i);
  const indices = new Set<number>();
  for (let k = 0; k < MAX_X_LABELS; k += 1) {
    indices.add(Math.round((k / (MAX_X_LABELS - 1)) * (count - 1)));
  }
  return Array.from(indices).sort((a, b) => a - b);
}

/** Contribution activity graph (task 6.1): a line/area/bar chart of contributions over a configurable range. */
export function ActivityGraphCard({
  points,
  granularity,
  style,
  showPoints,
  hideGrid,
  customTitle,
  theme,
  overrides = {},
  locale = "en",
  numberFormat = "short",
  disableAnimations = false,
  hideBorder = false,
  hideTitle = false,
  borderRadius = 4.5,
  borderWidth = 1,
  width = BASE_WIDTH,
  height = BASE_HEIGHT,
}: ActivityGraphCardProps) {
  const colors = resolveThemeSlots(theme, ["background", "border", "title", "text", "accent", "stroke"] as const, {
    border: normalizeOverrideColor(overrides.border),
    title: normalizeOverrideColor(overrides.title),
    text: normalizeOverrideColor(overrides.text),
    accent: normalizeOverrideColor(overrides.accent),
  });
  const background = overrides.background ? parseColorValue(overrides.background) : colors.background;
  const rtl = isRtlLocale(locale);

  const title = customTitle || t(locale, "activityGraphTitle");
  const marginTop = hideTitle ? 20 : 55;

  const plotLeft = MARGIN_LEFT;
  const plotRight = width - MARGIN_RIGHT;
  const plotTop = marginTop;
  const plotBottom = height - MARGIN_BOTTOM;
  const plotWidth = Math.max(plotRight - plotLeft, 1);
  const plotHeight = Math.max(plotBottom - plotTop, 1);

  const safePoints = points.length > 0 ? points : [{ date: new Date().toISOString().slice(0, 10), count: 0 }];
  const maxCount = Math.max(1, ...safePoints.map((p) => p.count));

  const xFor = (i: number) =>
    safePoints.length <= 1 ? plotLeft + plotWidth / 2 : plotLeft + (i / (safePoints.length - 1)) * plotWidth;
  const yFor = (count: number) => plotBottom - (count / maxCount) * plotHeight;

  const linePath = safePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p.count)}`).join(" ");
  const areaPath = `${linePath} L ${xFor(safePoints.length - 1)} ${plotBottom} L ${xFor(0)} ${plotBottom} Z`;

  const gridValues = Array.from({ length: GRID_LINES + 1 }, (_, i) => (maxCount * i) / GRID_LINES);
  const labelIndices = pickLabelIndices(safePoints.length);

  const barGap = 2;
  const barWidth = safePoints.length > 0 ? Math.max((plotWidth / safePoints.length) - barGap, 1) : 1;

  return (
    <Card
      width={width}
      height={height}
      background={background}
      border={colors.border}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      hideBorder={hideBorder}
      idPrefix="activity-graph"
      rtl={rtl}
    >
      <FadeInKeyframes />

      {!hideTitle && (
        <FadeIn delay={0} disabled={disableAnimations}>
          <RtlMirror x={MARGIN_LEFT} rtl={rtl}>
            <text x={MARGIN_LEFT} y={30} fill={colors.title} fontFamily={FONT} fontWeight={700} fontSize={18}>
              {title}
            </text>
          </RtlMirror>
        </FadeIn>
      )}

      {!hideGrid &&
        gridValues.map((value, i) => {
          const y = yFor(value);
          return (
            <g key={i}>
              <line x1={plotLeft} y1={y} x2={plotRight} y2={y} stroke={colors.stroke} strokeWidth={1} opacity={0.5} />
              <RtlMirror x={MARGIN_LEFT - 8} rtl={rtl}>
                <text
                  x={MARGIN_LEFT - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill={colors.text}
                  fontFamily={FONT}
                  fontSize={10}
                  opacity={0.8}
                >
                  {formatNumber(value, numberFormat, locale)}
                </text>
              </RtlMirror>
            </g>
          );
        })}

      {style === "bar" &&
        safePoints.map((p, i) => {
          const barHeight = plotBottom - yFor(p.count);
          return (
            <FadeIn key={p.date} delay={disableAnimations ? 0 : i * 0.01} disabled={disableAnimations}>
              <rect
                x={xFor(i) - barWidth / 2}
                y={yFor(p.count)}
                width={barWidth}
                height={Math.max(barHeight, 0)}
                rx={1}
                fill={colors.accent}
              />
            </FadeIn>
          );
        })}

      {style === "area" && (
        <FadeIn delay={0.1} disabled={disableAnimations}>
          <path d={areaPath} fill={colors.accent} opacity={0.25} />
        </FadeIn>
      )}

      {(style === "line" || style === "area") && (
        <DrawOnPath
          d={linePath}
          disabled={disableAnimations}
          fill="none"
          stroke={colors.accent}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}

      {(style === "line" || style === "area") &&
        showPoints &&
        safePoints.map((p, i) => (
          <FadeIn key={p.date} delay={disableAnimations ? 0 : 1.0 + i * 0.01} disabled={disableAnimations}>
            <circle cx={xFor(i)} cy={yFor(p.count)} r={2.5} fill={colors.accent} />
          </FadeIn>
        ))}

      {labelIndices.map((i) => (
        <RtlMirror key={safePoints[i].date} x={xFor(i)} rtl={rtl}>
          <text
            x={xFor(i)}
            y={height - 10}
            textAnchor="middle"
            fill={colors.text}
            fontFamily={FONT}
            fontSize={10}
            opacity={0.8}
          >
            {labelFor(safePoints[i].date, granularity, locale)}
          </text>
        </RtlMirror>
      ))}
    </Card>
  );
}
