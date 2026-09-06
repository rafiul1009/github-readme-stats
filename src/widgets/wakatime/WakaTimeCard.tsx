import { Card, FadeIn, FadeInKeyframes, RtlMirror } from "@/components/card";
import { resolveThemeSlots, type ThemeDefinition } from "@/lib/themes";
import { normalizeOverrideColor, parseColorValue } from "@/lib/color";
import { getLanguageColor } from "@/lib/languageColors";
import { t, isRtlLocale } from "@/lib/i18n";
import type { RawWakaTimeData } from "@/lib/wakatime";

export interface WakaTimeCardOverrides {
  background?: string;
  border?: string;
  title?: string;
  text?: string;
}

export interface WakaTimeCardProps {
  data: RawWakaTimeData;
  username: string;
  layout: "default" | "compact";
  displayFormat: "time" | "percent";
  langsCount: number;
  hideProgress: boolean;
  customTitle?: string;
  theme: ThemeDefinition;
  overrides?: WakaTimeCardOverrides;
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

export function WakaTimeCard({
  data,
  username,
  layout,
  displayFormat,
  langsCount,
  hideProgress,
  customTitle,
  theme,
  overrides = {},
  locale = "en",
  disableAnimations = false,
  hideBorder = false,
  hideTitle = false,
  borderRadius = 4.5,
  borderWidth = 1,
  width = 350,
}: WakaTimeCardProps) {
  const colors = resolveThemeSlots(theme, ["background", "border", "title", "text"] as const, {
    border: normalizeOverrideColor(overrides.border),
    title: normalizeOverrideColor(overrides.title),
    text: normalizeOverrideColor(overrides.text),
  });
  const background = overrides.background ? parseColorValue(overrides.background) : colors.background;
  const rtl = isRtlLocale(locale);

  const title = customTitle || t(locale, "wakatimeTitle", { username });
  const subtitle = t(locale, "totalTimeThisWeek", { total: data.totalText });
  const shown = data.languages.slice(0, langsCount).map((lang) => ({
    ...lang,
    color: lang.color ?? getLanguageColor(lang.name),
  }));
  const contentTop = hideTitle ? MARGIN + 10 : 62;

  let body: React.ReactNode;
  let height: number;

  if (shown.length === 0) {
    body = (
      <RtlMirror x={MARGIN} rtl={rtl}>
        <text x={MARGIN} y={contentTop + 10} fill={colors.text} fontFamily={FONT} fontSize={13}>
          {t(locale, "noWakaTimeData")}
        </text>
      </RtlMirror>
    );
    height = contentTop + 40;
  } else if (layout === "compact") {
    const barWidth = width - MARGIN * 2;
    const barHeight = 8;
    const columns = 2;
    const legendRowHeight = 20;
    const legendRows = Math.ceil(shown.length / columns);
    const columnWidth = barWidth / columns;

    let cumulative = 0;
    const segments = shown.map((lang) => {
      const x = (cumulative / 100) * barWidth;
      cumulative += lang.percent;
      return { lang, x, w: (lang.percent / 100) * barWidth };
    });

    body = (
      <>
        <FadeIn delay={0.1} disabled={disableAnimations}>
          <g transform={`translate(${MARGIN}, ${contentTop})`}>
            <rect width={barWidth} height={barHeight} rx={barHeight / 2} fill={colors.border} />
            {segments.map(({ lang, x, w }) => (
              <rect key={lang.name} x={x} width={Math.max(w, 0)} height={barHeight} fill={lang.color} />
            ))}
          </g>
        </FadeIn>
        {shown.map((lang, i) => {
          const col = i % columns;
          const row = Math.floor(i / columns);
          const x = MARGIN + col * columnWidth;
          const y = contentTop + barHeight + 20 + row * legendRowHeight;
          const amount = displayFormat === "percent" ? `${lang.percent.toFixed(1)}%` : lang.text;
          return (
            <FadeIn key={lang.name} delay={0.15 + i * 0.04} disabled={disableAnimations}>
              <g>
                <RtlMirror x={x + 4} rtl={rtl}>
                  <circle cx={x + 4} cy={y - 4} r={4} fill={lang.color} />
                </RtlMirror>
                <RtlMirror x={x + 14} rtl={rtl}>
                  <text x={x + 14} y={y} fill={colors.text} fontFamily={FONT} fontSize={11}>
                    {lang.name} {amount}
                  </text>
                </RtlMirror>
              </g>
            </FadeIn>
          );
        })}
      </>
    );
    height = contentTop + barHeight + 20 + legendRows * legendRowHeight + 10;
  } else {
    const rowHeight = hideProgress ? 22 : 40;
    const barWidth = width - MARGIN * 2;

    body = (
      <>
        {shown.map((lang, i) => {
          const y = contentTop + i * rowHeight;
          const amount = displayFormat === "percent" ? `${lang.percent.toFixed(1)}%` : lang.text;
          return (
            <FadeIn key={lang.name} delay={0.1 + i * 0.05} disabled={disableAnimations}>
              <g>
                <RtlMirror x={MARGIN} rtl={rtl}>
                  <text x={MARGIN} y={y} fill={colors.text} fontFamily={FONT} fontSize={12}>
                    {lang.name}
                  </text>
                </RtlMirror>
                <RtlMirror x={width - MARGIN} rtl={rtl}>
                  <text x={width - MARGIN} y={y} textAnchor="end" fill={colors.text} fontFamily={FONT} fontSize={12}>
                    {amount}
                  </text>
                </RtlMirror>
                {!hideProgress && (
                  <g transform={`translate(${MARGIN}, ${y + 6})`}>
                    <rect width={barWidth} height={6} rx={3} fill={colors.border} />
                    <rect width={(barWidth * lang.percent) / 100} height={6} rx={3} fill={lang.color} />
                  </g>
                )}
              </g>
            </FadeIn>
          );
        })}
      </>
    );
    height = contentTop + shown.length * rowHeight + 15;
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
      idPrefix="wakatime"
      rtl={rtl}
    >
      <FadeInKeyframes />
      {!hideTitle && (
        <FadeIn delay={0} disabled={disableAnimations}>
          <RtlMirror x={MARGIN} rtl={rtl}>
            <text x={MARGIN} y={26} fill={colors.title} fontFamily={FONT} fontWeight={700} fontSize={15}>
              {title}
            </text>
          </RtlMirror>
          <RtlMirror x={MARGIN} rtl={rtl}>
            <text x={MARGIN} y={44} fill={colors.text} fontFamily={FONT} fontSize={11} opacity={0.75}>
              {subtitle}
            </text>
          </RtlMirror>
        </FadeIn>
      )}
      {body}
    </Card>
  );
}
