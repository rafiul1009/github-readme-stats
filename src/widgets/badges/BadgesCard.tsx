import { Card, FadeIn, FadeInKeyframes, RtlMirror } from "@/components/card";
import { resolveThemeSlots, type ThemeDefinition } from "@/lib/themes";
import { normalizeOverrideColor, parseColorValue } from "@/lib/color";
import { estimateTextWidthPx } from "@/lib/textWidth";
import { t, isRtlLocale } from "@/lib/i18n";
import type { BadgeValue } from "@/lib/badges";

export interface BadgesCardOverrides {
  background?: string;
  border?: string;
  title?: string;
}

export interface BadgesCardProps {
  badges: BadgeValue[];
  themes: ThemeDefinition[];
  column: number;
  size: number;
  gap: number;
  glow: boolean;
  wave: boolean;
  customTitle?: string;
  overrides?: BadgesCardOverrides;
  locale?: string;
  disableAnimations?: boolean;
  hideBorder?: boolean;
  hideTitle?: boolean;
  borderRadius?: number;
  borderWidth?: number;
}

const FONT = "Inter, Ubuntu, sans-serif";
const PADDING = 16;

interface LaidOutBadge {
  badge: BadgeValue;
  x: number;
  y: number;
  labelWidth: number;
  valueWidth: number;
  theme: ThemeDefinition;
}

export function BadgesCard({
  badges,
  themes,
  column,
  size,
  gap,
  glow,
  wave,
  customTitle,
  overrides = {},
  locale = "en",
  disableAnimations = false,
  hideBorder = false,
  hideTitle = false,
  borderRadius = 4.5,
  borderWidth = 1,
}: BadgesCardProps) {
  const rtl = isRtlLocale(locale);
  const fontSize = Math.round(size * 0.4);
  const padX = Math.round(size * 0.32);

  const laidOut: LaidOutBadge[] = [];
  const rowWidths: number[] = [];
  let cursorX = PADDING;
  let cursorRowWidth = 0;
  let row = 0;

  badges.forEach((badge, i) => {
    if (i > 0 && i % column === 0) {
      rowWidths.push(cursorRowWidth);
      row += 1;
      cursorX = PADDING;
      cursorRowWidth = 0;
    }

    const theme = themes[i % themes.length];
    const label = t(locale, badge.labelKey);
    const labelWidth = estimateTextWidthPx(label, fontSize) + padX * 2;
    const valueWidth = estimateTextWidthPx(badge.value, fontSize) + padX * 2;
    const badgeWidth = labelWidth + valueWidth;

    laidOut.push({ badge, x: cursorX, y: PADDING + (hideTitle ? 0 : 24) + row * (size + gap), labelWidth, valueWidth, theme });

    cursorX += badgeWidth + gap;
    cursorRowWidth = cursorX - gap - PADDING;
  });
  rowWidths.push(cursorRowWidth);

  const width = Math.ceil(Math.max(...rowWidths, badges.length === 0 ? 200 : 0)) + PADDING * 2;
  const titleAllowance = hideTitle ? 0 : 24;
  const rowCount = badges.length === 0 ? 1 : row + 1;
  const height = PADDING + titleAllowance + rowCount * size + row * gap + PADDING;

  const title = customTitle || t(locale, "badgesTitle");
  const globalColors = resolveThemeSlots(themes[0], ["background", "border", "title", "text"] as const, {
    border: normalizeOverrideColor(overrides.border),
    title: normalizeOverrideColor(overrides.title),
  });
  const background = overrides.background ? parseColorValue(overrides.background) : globalColors.background;

  return (
    <Card
      width={width}
      height={height}
      background={background}
      border={globalColors.border}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      hideBorder={hideBorder}
      idPrefix="badges"
      rtl={rtl}
    >
      <FadeInKeyframes />
      {glow && (
        <defs>
          <filter id="badges-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation={3.5} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}

      {!hideTitle && (
        <FadeIn delay={0} disabled={disableAnimations}>
          <RtlMirror x={PADDING} rtl={rtl}>
            <text x={PADDING} y={PADDING + 6} fill={globalColors.title} fontFamily={FONT} fontWeight={700} fontSize={14}>
              {title}
            </text>
          </RtlMirror>
        </FadeIn>
      )}

      {badges.length === 0 && (
        <RtlMirror x={PADDING} rtl={rtl}>
          <text x={PADDING} y={PADDING + titleAllowance + 14} fill={globalColors.text} fontFamily={FONT} fontSize={12}>
            {t(locale, "noBadgesData")}
          </text>
        </RtlMirror>
      )}

      {laidOut.map((item, i) => {
        const colors = resolveThemeSlots(item.theme, ["title", "background", "accent", "muted"] as const);
        const labelCenterX = item.x + item.labelWidth / 2;
        const valueCenterX = item.x + item.labelWidth + item.valueWidth / 2;
        const textY = item.y + size / 2 + fontSize * 0.35;
        const waveAnimation = wave && !disableAnimations && (
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,-3; 0,0"
            dur="2s"
            begin={`${(i % column) * 0.15}s`}
            repeatCount="indefinite"
          />
        );

        return (
          <FadeIn key={item.badge.key + i} delay={disableAnimations ? 0 : Math.min(0.05 + i * 0.03, 0.5)} disabled={disableAnimations}>
            {/* Pure Y-translation wrapper (the wave bob) — safe to nest above the per-text RtlMirrors below,
                since a Y-only transform doesn't interact with the X-axis reflection math those rely on. */}
            <g filter={glow ? "url(#badges-glow)" : undefined}>
              {waveAnimation}
              <rect x={item.x} y={item.y} width={item.labelWidth} height={size} rx={size / 2} fill={colors.muted} />
              <rect
                x={item.x + item.labelWidth - size / 2}
                y={item.y}
                width={item.valueWidth + size / 2}
                height={size}
                rx={size / 2}
                fill={colors.accent}
              />
              <RtlMirror x={labelCenterX} rtl={rtl}>
                <text x={labelCenterX} y={textY} textAnchor="middle" fill={colors.title} fontFamily={FONT} fontWeight={600} fontSize={fontSize}>
                  {t(locale, item.badge.labelKey)}
                </text>
              </RtlMirror>
              <RtlMirror x={valueCenterX} rtl={rtl}>
                <text
                  x={valueCenterX}
                  y={textY}
                  textAnchor="middle"
                  fill={colors.background}
                  fontFamily={FONT}
                  fontWeight={700}
                  fontSize={fontSize}
                >
                  {item.badge.value}
                </text>
              </RtlMirror>
            </g>
          </FadeIn>
        );
      })}
    </Card>
  );
}
