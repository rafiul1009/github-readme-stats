import { Card, FadeIn, FadeInKeyframes, RtlMirror } from "@/components/card";
import { resolveThemeSlots, type ThemeDefinition } from "@/lib/themes";
import { normalizeOverrideColor, parseColorValue } from "@/lib/color";
import { formatNumber } from "@/lib/format";
import { t, isRtlLocale } from "@/lib/i18n";
import type { StackOverflowStats } from "@/lib/stackoverflow";

export interface StackOverflowCardOverrides {
  background?: string;
  border?: string;
  title?: string;
  text?: string;
}

export interface StackOverflowCardProps {
  stats: StackOverflowStats | null;
  customTitle?: string;
  theme: ThemeDefinition;
  overrides?: StackOverflowCardOverrides;
  locale?: string;
  numberFormat?: "short" | "long";
  disableAnimations?: boolean;
  hideBorder?: boolean;
  hideTitle?: boolean;
  borderRadius?: number;
  borderWidth?: number;
  width?: number;
}

const FONT = "Inter, Ubuntu, sans-serif";
const PADDING = 20;
const BODY_HEIGHT = 80;

const BADGE_COLORS = { gold: "#ffcc00", silver: "#b4b8bc", bronze: "#d1a684" };

export function StackOverflowCard({
  stats,
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
  width = 380,
}: StackOverflowCardProps) {
  const colors = resolveThemeSlots(theme, ["background", "border", "title", "text", "muted"] as const, {
    border: normalizeOverrideColor(overrides.border),
    title: normalizeOverrideColor(overrides.title),
    text: normalizeOverrideColor(overrides.text),
  });
  const background = overrides.background ? parseColorValue(overrides.background) : colors.background;
  const rtl = isRtlLocale(locale);

  const title = customTitle || t(locale, "stackoverflowTitle");
  const titleAllowance = hideTitle ? 12 : 40;
  const height = titleAllowance + BODY_HEIGHT;

  const badges = stats
    ? ([
        ["gold", stats.badgeCounts.gold],
        ["silver", stats.badgeCounts.silver],
        ["bronze", stats.badgeCounts.bronze],
      ] as const)
    : [];

  return (
    <Card
      width={width}
      height={height}
      background={background}
      border={colors.border}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      hideBorder={hideBorder}
      idPrefix="stackoverflow"
      rtl={rtl}
    >
      <FadeInKeyframes />

      {!hideTitle && (
        <FadeIn delay={0} disabled={disableAnimations}>
          <RtlMirror x={PADDING} rtl={rtl}>
            <text x={PADDING} y={26} fill={colors.title} fontFamily={FONT} fontWeight={700} fontSize={16}>
              {title}
            </text>
          </RtlMirror>
        </FadeIn>
      )}

      {!stats ? (
        <RtlMirror x={PADDING} rtl={rtl}>
          <text x={PADDING} y={titleAllowance + 16} fill={colors.text} fontFamily={FONT} fontSize={12}>
            {t(locale, "noStackOverflowData")}
          </text>
        </RtlMirror>
      ) : (
        <>
          <FadeIn delay={disableAnimations ? 0 : 0.1} disabled={disableAnimations}>
            <RtlMirror x={PADDING} rtl={rtl}>
              <text x={PADDING} y={titleAllowance + 20} fill={colors.title} fontFamily={FONT} fontWeight={700} fontSize={22}>
                {formatNumber(stats.reputation, numberFormat, locale)}
              </text>
            </RtlMirror>
            <RtlMirror x={PADDING} rtl={rtl}>
              <text x={PADDING} y={titleAllowance + 36} fill={colors.text} fontFamily={FONT} fontSize={11} opacity={0.8}>
                {stats.displayName}
              </text>
            </RtlMirror>
          </FadeIn>

          <FadeIn delay={disableAnimations ? 0 : 0.2} disabled={disableAnimations}>
            {badges.map(([kind, count], i) => {
              const x = PADDING + i * 90;
              const y = titleAllowance + 55;
              return (
                <RtlMirror key={kind} x={x + 40} rtl={rtl}>
                  <g transform={`translate(${x}, ${y})`}>
                    <circle cx={6} cy={-4} r={5} fill={BADGE_COLORS[kind]} />
                    <text x={16} y={0} fill={colors.text} fontFamily={FONT} fontSize={12} fontWeight={600}>
                      {formatNumber(count, numberFormat, locale)}
                    </text>
                  </g>
                </RtlMirror>
              );
            })}
          </FadeIn>
        </>
      )}
    </Card>
  );
}
