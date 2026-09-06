import { Card, FadeIn, FadeInKeyframes, RtlMirror } from "@/components/card";
import { resolveThemeSlots, type ThemeDefinition } from "@/lib/themes";
import { normalizeOverrideColor, parseColorValue } from "@/lib/color";
import { t, isRtlLocale, weekdayShortLabel } from "@/lib/i18n";
import type { ProductiveTimeResult } from "@/lib/productiveTime";

export interface ProductiveTimeCardOverrides {
  background?: string;
  border?: string;
  title?: string;
  text?: string;
  accent?: string;
}

export interface ProductiveTimeCardProps {
  data: ProductiveTimeResult;
  hideHourOfDay: boolean;
  hideDayOfWeek: boolean;
  customTitle?: string;
  theme: ThemeDefinition;
  overrides?: ProductiveTimeCardOverrides;
  locale?: string;
  disableAnimations?: boolean;
  hideBorder?: boolean;
  hideTitle?: boolean;
  borderRadius?: number;
  borderWidth?: number;
  width?: number;
}

const FONT = "Inter, Ubuntu, sans-serif";
const MARGIN = 25;
const CHART_HEIGHT = 60;
const SECTION_GAP = 34;

/** 2023-01-01 was a Sunday, so offsetting from it maps weekday index 0-6 directly onto Sun-Sat. */
const WEEKDAY_REFERENCE = new Date("2023-01-01T00:00:00Z");

function barChart(
  values: number[],
  labels: string[],
  top: number,
  width: number,
  colors: { text: string; border: string; accent: string },
  rtl: boolean,
  delayBase: number,
  disableAnimations: boolean
) {
  const maxValue = Math.max(...values, 1);
  const chartWidth = width - MARGIN * 2;
  const barGap = 2;
  const barWidth = chartWidth / values.length - barGap;

  return (
    <>
      {values.map((value, i) => {
        const x = MARGIN + i * (barWidth + barGap);
        const barHeight = (value / maxValue) * CHART_HEIGHT;
        const y = top + CHART_HEIGHT - barHeight;
        return (
          <FadeIn key={i} delay={disableAnimations ? 0 : delayBase + i * 0.01} disabled={disableAnimations}>
            <rect x={x} y={y} width={Math.max(barWidth, 1)} height={Math.max(barHeight, 1)} rx={1.5} fill={colors.accent} />
          </FadeIn>
        );
      })}
      {labels.map((label, i) => {
        const x = MARGIN + i * (barWidth + barGap) + barWidth / 2;
        return (
          <RtlMirror key={label + i} x={x} rtl={rtl}>
            <text x={x} y={top + CHART_HEIGHT + 14} textAnchor="middle" fill={colors.text} fontFamily={FONT} fontSize={9} opacity={0.75}>
              {label}
            </text>
          </RtlMirror>
        );
      })}
    </>
  );
}

export function ProductiveTimeCard({
  data,
  hideHourOfDay,
  hideDayOfWeek,
  customTitle,
  theme,
  overrides = {},
  locale = "en",
  disableAnimations = false,
  hideBorder = false,
  hideTitle = false,
  borderRadius = 4.5,
  borderWidth = 1,
  width = 480,
}: ProductiveTimeCardProps) {
  const colors = resolveThemeSlots(theme, ["background", "border", "title", "text", "accent"] as const, {
    border: normalizeOverrideColor(overrides.border),
    title: normalizeOverrideColor(overrides.title),
    text: normalizeOverrideColor(overrides.text),
    accent: normalizeOverrideColor(overrides.accent),
  });
  const background = overrides.background ? parseColorValue(overrides.background) : colors.background;
  const rtl = isRtlLocale(locale);

  const title = customTitle || t(locale, "productiveTimeTitle");
  const titleY = 30;
  let top = hideTitle ? MARGIN : 55;

  const sections: React.ReactNode[] = [];

  if (!hideHourOfDay) {
    const hourLabels = data.byHour.map((_, h) => (h % 3 === 0 ? String(h) : ""));
    sections.push(
      <g key="hour">
        <RtlMirror x={MARGIN} rtl={rtl}>
          <text x={MARGIN} y={top - 6} fill={colors.text} fontFamily={FONT} fontWeight={600} fontSize={11} opacity={0.85}>
            {t(locale, "hourOfDay")}
          </text>
        </RtlMirror>
        {barChart(data.byHour, hourLabels, top, width, colors, rtl, 0.1, disableAnimations)}
      </g>
    );
    top += CHART_HEIGHT + SECTION_GAP;
  }

  if (!hideDayOfWeek) {
    const weekdayLabels = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(WEEKDAY_REFERENCE.getTime() + i * 86400000);
      return weekdayShortLabel(date, locale);
    });
    sections.push(
      <g key="weekday">
        <RtlMirror x={MARGIN} rtl={rtl}>
          <text x={MARGIN} y={top - 6} fill={colors.text} fontFamily={FONT} fontWeight={600} fontSize={11} opacity={0.85}>
            {t(locale, "dayOfWeek")}
          </text>
        </RtlMirror>
        {barChart(data.byWeekday, weekdayLabels, top, width, colors, rtl, 0.3, disableAnimations)}
      </g>
    );
    top += CHART_HEIGHT + SECTION_GAP;
  }

  const height = top - SECTION_GAP + 20;

  return (
    <Card
      width={width}
      height={height}
      background={background}
      border={colors.border}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      hideBorder={hideBorder}
      idPrefix="productive-time"
      rtl={rtl}
    >
      <FadeInKeyframes />
      {!hideTitle && (
        <FadeIn delay={0} disabled={disableAnimations}>
          <RtlMirror x={MARGIN} rtl={rtl}>
            <text x={MARGIN} y={titleY} fill={colors.title} fontFamily={FONT} fontWeight={700} fontSize={16}>
              {title}
            </text>
          </RtlMirror>
        </FadeIn>
      )}
      {sections}
    </Card>
  );
}
