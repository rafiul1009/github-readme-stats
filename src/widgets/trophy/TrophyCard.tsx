import { Card, FadeIn, FadeInKeyframes, RtlMirror } from "@/components/card";
import { StatIcon } from "@/widgets/stats/icons";
import { resolveThemeSlots, type ThemeDefinition } from "@/lib/themes";
import { normalizeOverrideColor, parseColorValue } from "@/lib/color";
import { formatNumber } from "@/lib/format";
import { t, isRtlLocale } from "@/lib/i18n";
import type { Trophy, TrophyRank } from "@/lib/trophies";

export interface TrophyCardOverrides {
  background?: string;
  border?: string;
  title?: string;
  text?: string;
  icon?: string;
}

export interface TrophyCardProps {
  trophies: Trophy[];
  column: number;
  row: number;
  marginW: number;
  marginH: number;
  noBg: boolean;
  noFrame: boolean;
  customTitle?: string;
  theme: ThemeDefinition;
  overrides?: TrophyCardOverrides;
  locale?: string;
  numberFormat?: "short" | "long";
  disableAnimations?: boolean;
  hideBorder?: boolean;
  hideTitle?: boolean;
  borderRadius?: number;
  borderWidth?: number;
}

const FONT = "Inter, Ubuntu, sans-serif";
const TILE_WIDTH = 110;
const TILE_HEIGHT = 100;
const PADDING = 16;

const RANK_TIER_GROUP: Record<TrophyRank, "top" | "mid" | "low" | "unknown" | "secret"> = {
  SSS: "top",
  SS: "top",
  S: "top",
  AAA: "mid",
  AA: "mid",
  A: "mid",
  B: "low",
  C: "low",
  UNKNOWN: "unknown",
  SECRET: "secret",
};

export function TrophyCard({
  trophies,
  column,
  row,
  marginW,
  marginH,
  noBg,
  noFrame,
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
}: TrophyCardProps) {
  const colors = resolveThemeSlots(
    theme,
    ["background", "border", "title", "text", "icon", "accent", "muted", "trophyFrame", "trophyProgress", "trophySecret"] as const,
    {
      border: normalizeOverrideColor(overrides.border),
      title: normalizeOverrideColor(overrides.title),
      text: normalizeOverrideColor(overrides.text),
      icon: normalizeOverrideColor(overrides.icon),
    }
  );
  const background = overrides.background ? parseColorValue(overrides.background) : colors.background;
  const rtl = isRtlLocale(locale);

  const title = customTitle || t(locale, "trophyGridTitle");
  const titleY = 22;
  const gridTop = hideTitle ? PADDING : titleY + 16;

  const shown = trophies.slice(0, column * row);
  const rowsUsed = shown.length === 0 ? 1 : Math.ceil(shown.length / column);
  const width = column * TILE_WIDTH + (column - 1) * marginW + PADDING * 2;
  const height = gridTop + rowsUsed * TILE_HEIGHT + (rowsUsed - 1) * marginH + PADDING;

  function rankColor(rank: TrophyRank): string {
    switch (RANK_TIER_GROUP[rank]) {
      case "top":
        return colors.accent;
      case "mid":
        return colors.title;
      case "secret":
        return colors.trophySecret;
      case "low":
      case "unknown":
      default:
        return colors.muted;
    }
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
      idPrefix="trophy"
      rtl={rtl}
    >
      <FadeInKeyframes />

      {!hideTitle && (
        <FadeIn delay={0} disabled={disableAnimations}>
          <RtlMirror x={PADDING} rtl={rtl}>
            <text x={PADDING} y={titleY} fill={colors.title} fontFamily={FONT} fontWeight={700} fontSize={16}>
              {title}
            </text>
          </RtlMirror>
        </FadeIn>
      )}

      {shown.length === 0 && (
        <RtlMirror x={PADDING} rtl={rtl}>
          <text x={PADDING} y={gridTop + 20} fill={colors.text} fontFamily={FONT} fontSize={13}>
            {t(locale, "noTrophiesData")}
          </text>
        </RtlMirror>
      )}

      {shown.map((trophy, i) => {
        const col = i % column;
        const rowIndex = Math.floor(i / column);
        const tileX = PADDING + col * (TILE_WIDTH + marginW);
        const tileY = gridTop + rowIndex * (TILE_HEIGHT + marginH);
        const tileCenterX = tileX + TILE_WIDTH / 2;
        const color = rankColor(trophy.rank);

        return (
          <FadeIn key={trophy.key} delay={disableAnimations ? 0 : Math.min(0.05 + i * 0.04, 0.6)} disabled={disableAnimations}>
            <g>
              {!noBg && (
                <rect x={tileX} y={tileY} width={TILE_WIDTH} height={TILE_HEIGHT} rx={8} fill={colors.border} opacity={0.15} />
              )}
              {!noFrame && (
                <rect
                  x={tileX}
                  y={tileY}
                  width={TILE_WIDTH}
                  height={TILE_HEIGHT}
                  rx={8}
                  fill="none"
                  stroke={colors.trophyFrame}
                  strokeWidth={1}
                />
              )}

              <RtlMirror x={tileCenterX - 8} rtl={rtl}>
                <StatIcon name={trophy.icon} x={tileCenterX - 8} y={tileY + 12} size={16} color={colors.icon} />
              </RtlMirror>

              <RtlMirror x={tileCenterX} rtl={rtl}>
                <text x={tileCenterX} y={tileY + 52} textAnchor="middle" fill={color} fontFamily={FONT} fontWeight={700} fontSize={20}>
                  {trophy.rank}
                </text>
              </RtlMirror>

              <RtlMirror x={tileCenterX} rtl={rtl}>
                <text
                  x={tileCenterX}
                  y={tileY + 68}
                  textAnchor="middle"
                  fill={colors.text}
                  fontFamily={FONT}
                  fontWeight={600}
                  fontSize={10}
                >
                  {t(locale, trophy.titleKey)}
                </text>
              </RtlMirror>

              <RtlMirror x={tileCenterX} rtl={rtl}>
                <text x={tileCenterX} y={tileY + 82} textAnchor="middle" fill={colors.text} fontFamily={FONT} fontSize={10} opacity={0.75}>
                  {formatNumber(trophy.value, numberFormat, locale)}
                </text>
              </RtlMirror>

              {trophy.progressToNext !== undefined && (
                <g>
                  <rect x={tileX + 14} y={tileY + 88} width={TILE_WIDTH - 28} height={4} rx={2} fill={colors.border} />
                  <rect
                    x={tileX + 14}
                    y={tileY + 88}
                    width={(TILE_WIDTH - 28) * trophy.progressToNext}
                    height={4}
                    rx={2}
                    fill={colors.trophyProgress}
                  />
                </g>
              )}
            </g>
          </FadeIn>
        );
      })}
    </Card>
  );
}
