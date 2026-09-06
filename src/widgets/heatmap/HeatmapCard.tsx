import { Card, FadeIn, FadeInKeyframes, RtlMirror } from "@/components/card";
import { resolveThemeSlots, type ThemeDefinition } from "@/lib/themes";
import { normalizeOverrideColor, parseColorValue } from "@/lib/color";
import { t, isRtlLocale } from "@/lib/i18n";
import { buildHeatmapGrid } from "@/lib/heatmap";

export interface HeatmapCardOverrides {
  background?: string;
  border?: string;
  title?: string;
  text?: string;
  accent?: string;
}

export interface HeatmapCardProps {
  contributionDays: { date: string; contributionCount: number }[];
  weeks: number;
  customTitle?: string;
  theme: ThemeDefinition;
  overrides?: HeatmapCardOverrides;
  locale?: string;
  hideMonthLabels?: boolean;
  hideWeekdayLabels?: boolean;
  hideLegend?: boolean;
  disableAnimations?: boolean;
  hideBorder?: boolean;
  hideTitle?: boolean;
  borderRadius?: number;
  borderWidth?: number;
  width?: number;
}

const BASE_WIDTH = 720;
const FONT = "Inter, Ubuntu, sans-serif";
const CELL_GAP = 3;
const MIN_CELL = 6;
const MAX_CELL = 14;

/** Quantized-level fill, layered as increasing-opacity tints of the theme's accent slot over its background. */
function levelColor(level: 0 | 1 | 2 | 3 | 4, accent: string, border: string): string {
  if (level === 0) return border;
  const opacity = [0, 0.35, 0.55, 0.75, 1][level];
  return withOpacity(accent, opacity);
}

function withOpacity(hex: string, opacity: number): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${alpha}`;
}

/** GitHub-style contribution heatmap (task 6.2): a Sun-Sat calendar grid, quantized into a 5-shade color scale. */
export function HeatmapCard({
  contributionDays,
  weeks,
  customTitle,
  theme,
  overrides = {},
  locale = "en",
  hideMonthLabels = false,
  hideWeekdayLabels = false,
  hideLegend = false,
  disableAnimations = false,
  hideBorder = false,
  hideTitle = false,
  borderRadius = 4.5,
  borderWidth = 1,
  width = BASE_WIDTH,
}: HeatmapCardProps) {
  const colors = resolveThemeSlots(theme, ["background", "border", "title", "text", "accent", "stroke"] as const, {
    border: normalizeOverrideColor(overrides.border),
    title: normalizeOverrideColor(overrides.title),
    text: normalizeOverrideColor(overrides.text),
    accent: normalizeOverrideColor(overrides.accent),
  });
  const background = overrides.background ? parseColorValue(overrides.background) : colors.background;
  const rtl = isRtlLocale(locale);

  const title = customTitle || t(locale, "heatmapTitle");
  const grid = buildHeatmapGrid(contributionDays, weeks, locale);

  const weekdayLabelWidth = hideWeekdayLabels ? 0 : 26;
  const gridAreaWidth = width - weekdayLabelWidth - 12;
  const cellSize = Math.min(MAX_CELL, Math.max(MIN_CELL, (gridAreaWidth - (grid.weekCount - 1) * CELL_GAP) / grid.weekCount));
  const cellStride = cellSize + CELL_GAP;

  const titleY = 22;
  const monthLabelY = hideTitle ? 14 : titleY + 22;
  const gridTop = (hideTitle ? 0 : titleY + 10) + (hideMonthLabels ? 8 : 24);
  const gridLeft = weekdayLabelWidth + 6;
  const gridHeight = 7 * cellStride - CELL_GAP;
  const legendHeight = hideLegend ? 0 : 22;
  const height = Math.round(gridTop + gridHeight + legendHeight + 10);

  const weekdayLabels: Record<number, string> = { 1: "Mon", 3: "Wed", 5: "Fri" };

  return (
    <Card
      width={width}
      height={height}
      background={background}
      border={colors.border}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      hideBorder={hideBorder}
      idPrefix="heatmap"
      rtl={rtl}
    >
      <FadeInKeyframes />

      {!hideTitle && (
        <FadeIn delay={0} disabled={disableAnimations}>
          <RtlMirror x={12} rtl={rtl}>
            <text x={12} y={titleY} fill={colors.title} fontFamily={FONT} fontWeight={700} fontSize={16}>
              {title}
            </text>
          </RtlMirror>
        </FadeIn>
      )}

      {!hideMonthLabels &&
        grid.monthLabels.map(({ weekIndex, label }) => {
          const x = gridLeft + weekIndex * cellStride;
          return (
            <RtlMirror key={weekIndex} x={x} rtl={rtl}>
              <text x={x} y={monthLabelY} fill={colors.text} fontFamily={FONT} fontSize={10} opacity={0.8}>
                {label}
              </text>
            </RtlMirror>
          );
        })}

      {!hideWeekdayLabels &&
        Object.entries(weekdayLabels).map(([weekday, label]) => {
          const y = gridTop + Number(weekday) * cellStride + cellSize;
          return (
            <RtlMirror key={weekday} x={0} rtl={rtl}>
              <text x={0} y={y} fill={colors.text} fontFamily={FONT} fontSize={9} opacity={0.8}>
                {label}
              </text>
            </RtlMirror>
          );
        })}

      {grid.cells.map((cell, i) => {
        const x = gridLeft + cell.weekIndex * cellStride;
        const y = gridTop + cell.weekday * cellStride;
        return (
          <FadeIn key={cell.date} delay={disableAnimations ? 0 : Math.min(i * 0.002, 1)} disabled={disableAnimations}>
            <rect
              x={x}
              y={y}
              width={cellSize}
              height={cellSize}
              rx={2}
              fill={levelColor(cell.level, colors.accent, colors.border)}
            >
              <title>{`${cell.count} contribution${cell.count === 1 ? "" : "s"} on ${cell.date}`}</title>
            </rect>
          </FadeIn>
        );
      })}

      {!hideLegend && (
        <RtlMirror x={gridLeft} rtl={rtl}>
          <g transform={`translate(${gridLeft}, ${gridTop + gridHeight + 16})`}>
            <text x={0} y={0} fill={colors.text} fontFamily={FONT} fontSize={9} opacity={0.8}>
              {t(locale, "less")}
            </text>
            {([0, 1, 2, 3, 4] as const).map((level, i) => (
              <rect
                key={level}
                x={36 + i * (cellSize + CELL_GAP)}
                y={-cellSize + 2}
                width={cellSize}
                height={cellSize}
                rx={2}
                fill={levelColor(level, colors.accent, colors.border)}
              />
            ))}
            <text x={36 + 5 * (cellSize + CELL_GAP) + 6} y={0} fill={colors.text} fontFamily={FONT} fontSize={9} opacity={0.8}>
              {t(locale, "more")}
            </text>
          </g>
        </RtlMirror>
      )}
    </Card>
  );
}
