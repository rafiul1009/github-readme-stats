import { Card, FadeIn, FadeInKeyframes, RtlMirror } from "@/components/card";
import { resolveThemeSlots, type ThemeDefinition } from "@/lib/themes";
import { normalizeOverrideColor, parseColorValue } from "@/lib/color";
import { formatNumber } from "@/lib/format";
import { t, isRtlLocale } from "@/lib/i18n";
import type { RosterKind } from "@/lib/githubRepo";

export interface RosterAvatar {
  login: string;
  dataUri: string;
}

export interface RosterCardOverrides {
  background?: string;
  border?: string;
  title?: string;
  text?: string;
}

export interface RosterCardProps {
  avatars: RosterAvatar[];
  totalCount: number;
  kind: RosterKind;
  columns: number;
  size: number;
  customTitle?: string;
  theme: ThemeDefinition;
  overrides?: RosterCardOverrides;
  locale?: string;
  numberFormat?: "short" | "long";
  disableAnimations?: boolean;
  hideBorder?: boolean;
  hideTitle?: boolean;
  borderRadius?: number;
  borderWidth?: number;
}

const FONT = "Inter, Ubuntu, sans-serif";
const PADDING = 16;
const GAP = 10;

/** Bounded stargazer/forker avatar grid (docs/TODOS.md 11.4). */
export function RosterCard({
  avatars,
  totalCount,
  kind,
  columns,
  size,
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
}: RosterCardProps) {
  const colors = resolveThemeSlots(theme, ["background", "border", "title", "text", "muted"] as const, {
    border: normalizeOverrideColor(overrides.border),
    title: normalizeOverrideColor(overrides.title),
    text: normalizeOverrideColor(overrides.text),
  });
  const background = overrides.background ? parseColorValue(overrides.background) : colors.background;
  const rtl = isRtlLocale(locale);

  const title = customTitle || (kind === "forks" ? "Forks" : t(locale, "rosterTitle"));
  const subtitle = `${formatNumber(totalCount, numberFormat, locale)} total${
    avatars.length < totalCount ? ` — showing ${avatars.length}` : ""
  }`;

  const titleAllowance = hideTitle ? 0 : 44;
  const cellStride = size + GAP;
  const cols = Math.min(columns, Math.max(avatars.length, 1));
  const rows = avatars.length === 0 ? 1 : Math.ceil(avatars.length / columns);

  const width = cols * cellStride - GAP + PADDING * 2;
  const height = PADDING + titleAllowance + rows * cellStride - GAP + PADDING;

  return (
    <Card
      width={width}
      height={height}
      background={background}
      border={colors.border}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      hideBorder={hideBorder}
      idPrefix="roster"
      rtl={rtl}
    >
      <FadeInKeyframes />
      <defs>
        <clipPath id="roster-avatar-clip">
          <circle cx={size / 2} cy={size / 2} r={size / 2} />
        </clipPath>
      </defs>

      {!hideTitle && (
        <FadeIn delay={0} disabled={disableAnimations}>
          <RtlMirror x={PADDING} rtl={rtl}>
            <text x={PADDING} y={PADDING + 6} fill={colors.title} fontFamily={FONT} fontWeight={700} fontSize={14}>
              {title}
            </text>
          </RtlMirror>
          <RtlMirror x={PADDING} rtl={rtl}>
            <text x={PADDING} y={PADDING + 24} fill={colors.text} fontFamily={FONT} fontSize={11} opacity={0.8}>
              {subtitle}
            </text>
          </RtlMirror>
        </FadeIn>
      )}

      {avatars.length === 0 && (
        <RtlMirror x={PADDING} rtl={rtl}>
          <text x={PADDING} y={PADDING + titleAllowance + 14} fill={colors.text} fontFamily={FONT} fontSize={12}>
            {t(locale, "noRosterData")}
          </text>
        </RtlMirror>
      )}

      {avatars.map((avatar, i) => {
        const col = i % columns;
        const row = Math.floor(i / columns);
        const x = PADDING + col * cellStride;
        const y = PADDING + titleAllowance + row * cellStride;

        return (
          <FadeIn key={avatar.login} delay={disableAnimations ? 0 : Math.min(0.03 + i * 0.02, 0.6)} disabled={disableAnimations}>
            {/* Anchored at the tile's own center (x + size/2), not its left edge — see the identical fix
                (and the matrix-algebra reasoning behind it) in tech-icons/TechIconsCard.tsx. */}
            <RtlMirror x={x + size / 2} rtl={rtl}>
              <g transform={`translate(${x}, ${y})`}>
                <image href={avatar.dataUri} width={size} height={size} clipPath="url(#roster-avatar-clip)" />
                <title>{avatar.login}</title>
              </g>
            </RtlMirror>
          </FadeIn>
        );
      })}
    </Card>
  );
}
