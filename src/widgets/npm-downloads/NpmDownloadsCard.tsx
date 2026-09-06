import { Card, FadeIn, FadeInKeyframes, RtlMirror } from "@/components/card";
import { resolveThemeSlots, type ThemeDefinition } from "@/lib/themes";
import { normalizeOverrideColor, parseColorValue } from "@/lib/color";
import { formatNumber } from "@/lib/format";
import { t, isRtlLocale } from "@/lib/i18n";
import type { NpmPackageStats } from "@/lib/npmStats";

export interface NpmDownloadsCardOverrides {
  background?: string;
  border?: string;
  title?: string;
  text?: string;
  accent?: string;
}

export interface NpmDownloadsCardProps {
  stats: NpmPackageStats;
  customTitle?: string;
  theme: ThemeDefinition;
  overrides?: NpmDownloadsCardOverrides;
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

export function NpmDownloadsCard({
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
  width = 340,
}: NpmDownloadsCardProps) {
  const colors = resolveThemeSlots(theme, ["background", "border", "title", "text", "accent", "muted"] as const, {
    border: normalizeOverrideColor(overrides.border),
    title: normalizeOverrideColor(overrides.title),
    text: normalizeOverrideColor(overrides.text),
    accent: normalizeOverrideColor(overrides.accent),
  });
  const background = overrides.background ? parseColorValue(overrides.background) : colors.background;
  const rtl = isRtlLocale(locale);

  const title = customTitle || t(locale, "npmDownloadsTitle");
  const titleAllowance = hideTitle ? 12 : 36;
  const height = titleAllowance + 70;

  return (
    <Card
      width={width}
      height={height}
      background={background}
      border={colors.border}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      hideBorder={hideBorder}
      idPrefix="npm-downloads"
      rtl={rtl}
    >
      <FadeInKeyframes />

      {!hideTitle && (
        <FadeIn delay={0} disabled={disableAnimations}>
          <RtlMirror x={PADDING} rtl={rtl}>
            <text x={PADDING} y={24} fill={colors.title} fontFamily={FONT} fontWeight={700} fontSize={16}>
              {title}
            </text>
          </RtlMirror>
        </FadeIn>
      )}

      <FadeIn delay={disableAnimations ? 0 : 0.1} disabled={disableAnimations}>
        <RtlMirror x={PADDING} rtl={rtl}>
          <text x={PADDING} y={titleAllowance + 24} fill={colors.accent} fontFamily={FONT} fontWeight={700} fontSize={22}>
            {formatNumber(stats.weeklyDownloads, numberFormat, locale)}
          </text>
        </RtlMirror>
        <RtlMirror x={PADDING} rtl={rtl}>
          <text x={PADDING} y={titleAllowance + 42} fill={colors.text} fontFamily={FONT} fontSize={11} opacity={0.8}>
            {t(locale, "downloadsLastWeek")}
          </text>
        </RtlMirror>
        <RtlMirror x={PADDING} rtl={rtl}>
          <text x={PADDING} y={titleAllowance + 58} fill={colors.muted} fontFamily={FONT} fontSize={10} opacity={0.7}>
            {`${stats.name}@${stats.version}`}
          </text>
        </RtlMirror>
      </FadeIn>
    </Card>
  );
}
