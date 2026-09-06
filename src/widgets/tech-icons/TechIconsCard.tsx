import { Card, FadeIn, FadeInKeyframes, RtlMirror } from "@/components/card";
import { resolveThemeSlots, type ThemeDefinition } from "@/lib/themes";
import { normalizeOverrideColor, parseColorValue } from "@/lib/color";
import { t, isRtlLocale } from "@/lib/i18n";
import type { IconData } from "@/lib/icons";

export interface TechIconsCardOverrides {
  background?: string;
  border?: string;
  title?: string;
  text?: string;
}

export interface ResolvedIcon {
  icon: IconData | null;
  requestedSlug: string;
  color?: string;
}

export interface TechIconsCardProps {
  icons: ResolvedIcon[];
  columns: number;
  size: number;
  glow: boolean;
  wave: boolean;
  customTitle?: string;
  theme: ThemeDefinition;
  overrides?: TechIconsCardOverrides;
  locale?: string;
  disableAnimations?: boolean;
  hideBorder?: boolean;
  hideTitle?: boolean;
  borderRadius?: number;
  borderWidth?: number;
}

const FONT = "Inter, Ubuntu, sans-serif";
const PADDING = 16;
const GAP = 14;
/** simple-icons path data is drawn on a 24x24 viewBox. */
const ICON_VIEWBOX = 24;

export function TechIconsCard({
  icons,
  columns,
  size,
  glow,
  wave,
  customTitle,
  theme,
  overrides = {},
  locale = "en",
  disableAnimations = false,
  hideBorder = false,
  hideTitle = false,
  borderRadius = 4.5,
  borderWidth = 1,
}: TechIconsCardProps) {
  const colors = resolveThemeSlots(theme, ["background", "border", "title", "text", "muted"] as const, {
    border: normalizeOverrideColor(overrides.border),
    title: normalizeOverrideColor(overrides.title),
    text: normalizeOverrideColor(overrides.text),
  });
  const background = overrides.background ? parseColorValue(overrides.background) : colors.background;
  const rtl = isRtlLocale(locale);

  const title = customTitle || t(locale, "techIconsTitle");
  const titleAllowance = hideTitle ? 0 : 30;
  const cellStride = size + GAP;
  const cols = Math.min(columns, Math.max(icons.length, 1));
  const rows = icons.length === 0 ? 1 : Math.ceil(icons.length / columns);

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
      idPrefix="tech-icons"
      rtl={rtl}
    >
      <FadeInKeyframes />
      {glow && (
        <defs>
          <filter id="tech-icons-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation={4} result="blur" />
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
            <text x={PADDING} y={PADDING + 6} fill={colors.title} fontFamily={FONT} fontWeight={700} fontSize={14}>
              {title}
            </text>
          </RtlMirror>
        </FadeIn>
      )}

      {icons.length === 0 && (
        <RtlMirror x={PADDING} rtl={rtl}>
          <text x={PADDING} y={PADDING + titleAllowance + 14} fill={colors.text} fontFamily={FONT} fontSize={12}>
            {t(locale, "noTechIconsData")}
          </text>
        </RtlMirror>
      )}

      {icons.map((entry, i) => {
        const col = i % columns;
        const row = Math.floor(i / columns);
        const x = PADDING + col * cellStride;
        const y = PADDING + titleAllowance + row * cellStride;
        const scale = size / ICON_VIEWBOX;
        const fill = entry.color ?? (entry.icon ? `#${entry.icon.hex}` : colors.muted);
        const waveAnimation = wave && !disableAnimations && (
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,-4; 0,0"
            dur="2s"
            begin={`${col * 0.12}s`}
            repeatCount="indefinite"
          />
        );

        return (
          <FadeIn key={entry.requestedSlug + i} delay={disableAnimations ? 0 : Math.min(0.05 + i * 0.03, 0.6)} disabled={disableAnimations}>
            {/* Anchored at the tile's own visual CENTER (x + size/2), not its left edge — composing this with
                Card's card-wide mirror must reproduce the same span a symmetric shape would land at under that
                mirror alone ([x, x+size] -> [W-x-size, W-x]); anchoring at the left edge instead shifts the
                whole tile by one tile-width, since a single-point anchor only reproduces the correct span when
                that point is the span's own center (see docs/TODOS.md 8.1 note on this exact class of bug,
                first hit — and fixed the same way — in the badges widget's pill layout). */}
            <RtlMirror x={x + size / 2} rtl={rtl}>
              <g filter={glow ? "url(#tech-icons-glow)" : undefined}>
                {waveAnimation}
                {entry.icon ? (
                  <g transform={`translate(${x}, ${y}) scale(${scale})`} fill={fill}>
                    <path d={entry.icon.path} />
                  </g>
                ) : (
                  <g transform={`translate(${x}, ${y})`}>
                    <rect width={size} height={size} rx={6} fill="none" stroke={colors.border} strokeWidth={1} />
                    <text
                      x={size / 2}
                      y={size / 2 + 4}
                      textAnchor="middle"
                      fill={colors.text}
                      fontFamily={FONT}
                      fontSize={Math.max(size * 0.22, 8)}
                    >
                      ?
                    </text>
                  </g>
                )}
              </g>
            </RtlMirror>
          </FadeIn>
        );
      })}
    </Card>
  );
}
