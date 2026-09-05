import { Card, FadeIn, FadeInKeyframes } from "@/components/card";
import { resolveThemeSlots, type ThemeDefinition } from "@/lib/themes";
import { normalizeOverrideColor, parseColorValue } from "@/lib/color";
import { describeDonutSlice, describePieSlice } from "@/lib/arc";
import type { LanguageStat } from "@/lib/languages";
import type { TOP_LANGS_LAYOUTS } from "./schema";

export type TopLangsLayout = (typeof TOP_LANGS_LAYOUTS)[number];

export interface TopLangsCardOverrides {
  background?: string;
  border?: string;
  title?: string;
  text?: string;
}

export interface TopLangsCardProps {
  languages: LanguageStat[];
  layout: TopLangsLayout;
  langsCount: number;
  hideProgress: boolean;
  customTitle?: string;
  theme: ThemeDefinition;
  overrides?: TopLangsCardOverrides;
  disableAnimations?: boolean;
  hideBorder?: boolean;
  hideTitle?: boolean;
  borderRadius?: number;
  borderWidth?: number;
  width?: number;
}

const BASE_WIDTH = 300;
const MARGIN = 25;

export function TopLangsCard({
  languages,
  layout,
  langsCount,
  hideProgress,
  customTitle,
  theme,
  overrides = {},
  disableAnimations = false,
  hideBorder = false,
  hideTitle = false,
  borderRadius = 4.5,
  borderWidth = 1,
  width = BASE_WIDTH,
}: TopLangsCardProps) {
  const colors = resolveThemeSlots(theme, ["background", "border", "title", "text"] as const, {
    border: normalizeOverrideColor(overrides.border),
    title: normalizeOverrideColor(overrides.title),
    text: normalizeOverrideColor(overrides.text),
  });
  const background = overrides.background ? parseColorValue(overrides.background) : colors.background;

  const shown = languages.slice(0, langsCount);
  const title = customTitle || "Most Used Languages";
  const titleY = 30;
  const contentTop = hideTitle ? MARGIN : 55;

  const effectiveLayout: TopLangsLayout = hideProgress && layout === "normal" ? "compact" : layout;

  let body: React.ReactNode;
  let height: number;

  if (shown.length === 0) {
    body = (
      <text x={MARGIN} y={contentTop + 10} fill={colors.text} fontFamily="Inter, Ubuntu, sans-serif" fontSize={13}>
        No language data available.
      </text>
    );
    height = contentTop + 40;
  } else if (effectiveLayout === "compact") {
    const result = renderCompact(shown, width, contentTop, colors, disableAnimations);
    body = result.body;
    height = result.height;
  } else if (effectiveLayout === "donut" || effectiveLayout === "donut-vertical") {
    const result = renderDonut(shown, width, contentTop, colors, disableAnimations, effectiveLayout === "donut-vertical", 0.55);
    body = result.body;
    height = result.height;
  } else if (effectiveLayout === "pie") {
    const result = renderDonut(shown, width, contentTop, colors, disableAnimations, false, 0);
    body = result.body;
    height = result.height;
  } else {
    const result = renderNormal(shown, width, contentTop, colors, hideProgress, disableAnimations);
    body = result.body;
    height = result.height;
  }

  return (
    <Card
      width={width}
      height={height}
      background={background}
      border={colors.border}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      hideBorder={hideBorder}
      idPrefix="top-langs"
    >
      <FadeInKeyframes />
      {!hideTitle && (
        <FadeIn delay={0} disabled={disableAnimations}>
          <text x={MARGIN} y={titleY} fill={colors.title} fontFamily="Inter, Ubuntu, sans-serif" fontWeight={700} fontSize={18}>
            {title}
          </text>
        </FadeIn>
      )}
      {body}
    </Card>
  );
}

type ThemeColors = { text: string; border: string };

function renderNormal(
  languages: LanguageStat[],
  width: number,
  top: number,
  colors: ThemeColors,
  hideProgress: boolean,
  disableAnimations: boolean
) {
  const rowHeight = hideProgress ? 22 : 40;
  const barWidth = width - MARGIN * 2;

  const body = (
    <>
      {languages.map((lang, i) => {
        const y = top + i * rowHeight;
        return (
          <FadeIn key={lang.name} delay={0.1 + i * 0.05} disabled={disableAnimations}>
            <g>
              <circle cx={MARGIN + 4} cy={y - 4} r={4} fill={lang.color} />
              <text x={MARGIN + 14} y={y} fill={colors.text} fontFamily="Inter, Ubuntu, sans-serif" fontSize={12}>
                {lang.name}
              </text>
              {!hideProgress && (
                <text
                  x={width - MARGIN}
                  y={y}
                  textAnchor="end"
                  fill={colors.text}
                  fontFamily="Inter, Ubuntu, sans-serif"
                  fontSize={12}
                >
                  {lang.percentage.toFixed(1)}%
                </text>
              )}
              {!hideProgress && (
                <g transform={`translate(${MARGIN}, ${y + 6})`}>
                  <rect width={barWidth} height={6} rx={3} fill={colors.border} />
                  <rect width={(barWidth * lang.percentage) / 100} height={6} rx={3} fill={lang.color} />
                </g>
              )}
            </g>
          </FadeIn>
        );
      })}
    </>
  );

  return { body, height: top + languages.length * rowHeight + 15 };
}

function renderCompact(
  languages: LanguageStat[],
  width: number,
  top: number,
  colors: ThemeColors,
  disableAnimations: boolean
) {
  const barWidth = width - MARGIN * 2;
  const barHeight = 8;
  const columns = 2;
  const legendRowHeight = 20;
  const legendRows = Math.ceil(languages.length / columns);
  const columnWidth = barWidth / columns;

  let cumulative = 0;
  const segments = languages.map((lang) => {
    const x = (cumulative / 100) * barWidth;
    cumulative += lang.percentage;
    return { lang, x, w: (lang.percentage / 100) * barWidth };
  });

  const body = (
    <>
      <FadeIn delay={0.1} disabled={disableAnimations}>
        <g transform={`translate(${MARGIN}, ${top})`}>
          <rect width={barWidth} height={barHeight} rx={barHeight / 2} fill={colors.border} />
          {segments.map(({ lang, x, w }) => (
            <rect key={lang.name} x={x} width={Math.max(w, 0)} height={barHeight} fill={lang.color} />
          ))}
        </g>
      </FadeIn>
      {languages.map((lang, i) => {
        const col = i % columns;
        const row = Math.floor(i / columns);
        const x = MARGIN + col * columnWidth;
        const y = top + barHeight + 20 + row * legendRowHeight;
        return (
          <FadeIn key={lang.name} delay={0.15 + i * 0.04} disabled={disableAnimations}>
            <g>
              <circle cx={x + 4} cy={y - 4} r={4} fill={lang.color} />
              <text x={x + 14} y={y} fill={colors.text} fontFamily="Inter, Ubuntu, sans-serif" fontSize={11}>
                {lang.name} {lang.percentage.toFixed(1)}%
              </text>
            </g>
          </FadeIn>
        );
      })}
    </>
  );

  return { body, height: top + barHeight + 20 + legendRows * legendRowHeight + 10 };
}

function renderDonut(
  languages: LanguageStat[],
  width: number,
  top: number,
  colors: ThemeColors,
  disableAnimations: boolean,
  legendBelow: boolean,
  innerRadiusRatio: number
) {
  const outerR = 45;
  const innerR = outerR * innerRadiusRatio;
  const shownTotal = languages.reduce((sum, l) => sum + l.percentage, 0) || 1;

  const chartCx = legendBelow ? width / 2 : MARGIN + outerR;
  const chartCy = top + outerR;

  let angle = 0;
  const slices = languages.map((lang) => {
    const sweep = (lang.percentage / shownTotal) * 360;
    const startAngle = angle;
    const endAngle = angle + sweep;
    angle = endAngle;
    const path =
      innerR > 0
        ? describeDonutSlice(chartCx, chartCy, outerR, innerR, startAngle, endAngle)
        : describePieSlice(chartCx, chartCy, outerR, startAngle, endAngle);
    return { lang, path };
  });

  const chartBottom = top + outerR * 2;
  const legendRowHeight = 18;

  const legend = legendBelow ? (
    <g transform={`translate(${MARGIN}, ${chartBottom + 15})`}>
      {languages.map((lang, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = col * ((width - MARGIN * 2) / 2);
        const y = row * legendRowHeight;
        return (
          <FadeIn key={lang.name} delay={0.2 + i * 0.04} disabled={disableAnimations}>
            <g>
              <circle cx={x + 4} cy={y - 4} r={4} fill={lang.color} />
              <text x={x + 14} y={y} fill={colors.text} fontFamily="Inter, Ubuntu, sans-serif" fontSize={11}>
                {lang.name} {lang.percentage.toFixed(1)}%
              </text>
            </g>
          </FadeIn>
        );
      })}
    </g>
  ) : (
    <g transform={`translate(${chartCx + outerR + 20}, ${top})`}>
      {languages.map((lang, i) => {
        const y = i * legendRowHeight + 4;
        return (
          <FadeIn key={lang.name} delay={0.2 + i * 0.04} disabled={disableAnimations}>
            <g>
              <circle cx={4} cy={y - 4} r={4} fill={lang.color} />
              <text x={14} y={y} fill={colors.text} fontFamily="Inter, Ubuntu, sans-serif" fontSize={11}>
                {lang.name} {lang.percentage.toFixed(1)}%
              </text>
            </g>
          </FadeIn>
        );
      })}
    </g>
  );

  const legendHeight = languages.length * legendRowHeight;
  const height = legendBelow
    ? chartBottom + 15 + Math.ceil(languages.length / 2) * legendRowHeight + 10
    : Math.max(chartBottom, top + legendHeight) + 15;

  const body = (
    <>
      {slices.map(({ lang, path }, i) => (
        <FadeIn key={lang.name} delay={0.1 + i * 0.05} disabled={disableAnimations}>
          <path d={path} fill={lang.color} />
        </FadeIn>
      ))}
      {legend}
    </>
  );

  return { body, height };
}
