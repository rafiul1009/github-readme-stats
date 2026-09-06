import { Card, FadeIn, FadeInKeyframes, RtlMirror, Stat } from "@/components/card";
import { resolveThemeSlots, type ThemeDefinition } from "@/lib/themes";
import { normalizeOverrideColor, parseColorValue } from "@/lib/color";
import { formatNumber } from "@/lib/format";
import { t, isRtlLocale } from "@/lib/i18n";
import type { RawUserStats } from "@/lib/githubStats";

export interface ProfileSummaryCardOverrides {
  background?: string;
  border?: string;
  title?: string;
  text?: string;
  accent?: string;
}

export interface ProfileSummaryCardProps {
  stats: RawUserStats;
  avatarDataUri: string;
  photoResize: number;
  revert: boolean;
  customTitle?: string;
  theme: ThemeDefinition;
  overrides?: ProfileSummaryCardOverrides;
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
const HEIGHT = 190;
const PADDING = 24;

export function ProfileSummaryCard({
  stats,
  avatarDataUri,
  photoResize,
  revert,
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
  width = 480,
}: ProfileSummaryCardProps) {
  const colors = resolveThemeSlots(theme, ["background", "border", "title", "text", "accent", "muted"] as const, {
    border: normalizeOverrideColor(overrides.border),
    title: normalizeOverrideColor(overrides.title),
    text: normalizeOverrideColor(overrides.text),
    accent: normalizeOverrideColor(overrides.accent),
  });
  const background = overrides.background ? parseColorValue(overrides.background) : colors.background;
  const rtl = isRtlLocale(locale);

  const displayName = stats.name || stats.login;
  const title = (customTitle || t(locale, "profileSummaryTitle"))
    .replace(/\{name\}/g, displayName)
    .replace(/\{username\}/g, stats.login);

  const r = photoResize / 2;
  const avatarCx = revert ? width - PADDING - r : PADDING + r;
  const avatarCy = hideTitle ? HEIGHT / 2 : HEIGHT / 2 + 6;
  const textBlockX = revert ? PADDING : PADDING + photoResize + 24;
  const textBlockRight = revert ? width - PADDING - photoResize - 24 : width - PADDING;
  const textAnchorSide: "start" | "end" = revert ? "end" : "start";
  const textX = revert ? textBlockRight : textBlockX;

  const commits = stats.allTimeCommits ?? stats.currentYearCommits;
  const statColumns = [
    { value: stats.totalStars, label: t(locale, "totalStars") },
    { value: commits, label: t(locale, "totalCommits") },
    { value: stats.totalRepos, label: t(locale, "trophyRepos") },
    { value: stats.followers, label: t(locale, "followers") },
  ];
  const statsAreaLeft = revert ? PADDING : textBlockX;
  const statsAreaRight = revert ? textBlockRight : width - PADDING;
  const statsAreaWidth = statsAreaRight - statsAreaLeft;
  const statY = HEIGHT - 34;

  return (
    <Card
      width={width}
      height={HEIGHT}
      background={background}
      border={colors.border}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      hideBorder={hideBorder}
      idPrefix="profile-summary"
      rtl={rtl}
    >
      <FadeInKeyframes />
      <defs>
        <pattern id="profile-summary-avatar" patternUnits="userSpaceOnUse" width={photoResize} height={photoResize}>
          <image href={avatarDataUri} x={0} y={0} width={photoResize} height={photoResize} preserveAspectRatio="xMidYMid slice" />
        </pattern>
      </defs>

      <RtlMirror x={avatarCx} rtl={rtl}>
        <FadeIn delay={0} disabled={disableAnimations}>
          <circle cx={avatarCx} cy={avatarCy} r={r} fill="url(#profile-summary-avatar)" stroke={colors.border} strokeWidth={1} />
        </FadeIn>
      </RtlMirror>

      {!hideTitle && (
        <RtlMirror x={textX} rtl={rtl}>
          <FadeIn delay={0.05} disabled={disableAnimations}>
            <text
              x={textX}
              y={HEIGHT / 2 - 14}
              textAnchor={textAnchorSide}
              fill={colors.title}
              fontFamily={FONT}
              fontWeight={700}
              fontSize={18}
            >
              {title}
            </text>
          </FadeIn>
        </RtlMirror>
      )}

      <RtlMirror x={textX} rtl={rtl}>
        <FadeIn delay={0.1} disabled={disableAnimations}>
          <text x={textX} y={HEIGHT / 2 + 8} textAnchor={textAnchorSide} fill={colors.text} fontFamily={FONT} fontSize={13} opacity={0.85}>
            @{stats.login}
          </text>
        </FadeIn>
      </RtlMirror>

      <RtlMirror x={textX} rtl={rtl}>
        <FadeIn delay={0.15} disabled={disableAnimations}>
          <text x={textX} y={HEIGHT / 2 + 26} textAnchor={textAnchorSide} fill={colors.muted} fontFamily={FONT} fontSize={11}>
            {t(locale, "joined", { year: new Date(stats.createdAt).getUTCFullYear() })} · {formatNumber(stats.following, numberFormat, locale)} {t(locale, "following")}
          </text>
        </FadeIn>
      </RtlMirror>

      {statColumns.map((col, i) => {
        const x = statsAreaLeft + statsAreaWidth * ((i + 0.5) / statColumns.length);
        return (
          <RtlMirror key={col.label} x={x} rtl={rtl}>
            <FadeIn delay={0.2 + i * 0.05} disabled={disableAnimations}>
              <Stat
                x={x}
                y={statY - 30}
                value={formatNumber(col.value, numberFormat, locale)}
                label={col.label}
                valueColor={colors.accent}
                labelColor={colors.muted}
                fontFamily={FONT}
                valueFontSize={18}
                labelFontSize={10}
              />
            </FadeIn>
          </RtlMirror>
        );
      })}
    </Card>
  );
}
