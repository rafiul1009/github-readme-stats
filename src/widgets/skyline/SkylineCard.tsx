import { Card, FadeIn, FadeInKeyframes, RtlMirror } from "@/components/card";
import { resolveThemeSlots, type ThemeDefinition } from "@/lib/themes";
import { normalizeOverrideColor, parseColorValue } from "@/lib/color";
import { t, isRtlLocale } from "@/lib/i18n";
import { buildHeatmapGrid } from "@/lib/heatmap";
import { buildSkylineLayout, shadeHex } from "@/lib/skyline";

export interface SkylineCardOverrides {
  background?: string;
  border?: string;
  title?: string;
  text?: string;
  accent?: string;
}

export interface SkylineCardProps {
  contributionDays: { date: string; contributionCount: number }[];
  weeks: number;
  customTitle?: string;
  theme: ThemeDefinition;
  overrides?: SkylineCardOverrides;
  locale?: string;
  disableAnimations?: boolean;
  hideBorder?: boolean;
  hideTitle?: boolean;
  borderRadius?: number;
  borderWidth?: number;
  width?: number;
}

const BASE_WIDTH = 720;
const FONT = "Inter, Ubuntu, sans-serif";
const MARGIN_SIDE = 20;
const MIN_TILE_HALF_WIDTH = 3;
const MAX_TILE_HALF_WIDTH = 9;

/**
 * Isometric contribution "skyline" (docs/TODOS.md 11.1). The originally
 * scoped 3D contribution graph needed a fundamentally different renderer
 * (WebGL/three.js) plus a GitHub Action pipeline to pre-render a static
 * image, since neither is available inside a live SVG request — that's
 * exactly why it stayed deferred. This delivers the same "extruded
 * contribution skyline" idea within the constraint that made it hard: pure
 * SVG, real-time-renderable, no build pipeline, by projecting the same
 * `HeatmapCell` grid the flat heatmap uses through a standard 2:1
 * isometric transform (`src/lib/skyline.ts`) instead of a literal 3D scene.
 * A deliberately scoped one-style delivery, not the originally-imagined
 * "10 style variants."
 */
export function SkylineCard({
  contributionDays,
  weeks,
  customTitle,
  theme,
  overrides = {},
  locale = "en",
  disableAnimations = false,
  hideBorder = false,
  hideTitle = false,
  borderRadius = 4.5,
  borderWidth = 1,
  width = BASE_WIDTH,
}: SkylineCardProps) {
  const colors = resolveThemeSlots(theme, ["background", "border", "title", "text", "accent"] as const, {
    border: normalizeOverrideColor(overrides.border),
    title: normalizeOverrideColor(overrides.title),
    text: normalizeOverrideColor(overrides.text),
    accent: normalizeOverrideColor(overrides.accent),
  });
  const background = overrides.background ? parseColorValue(overrides.background) : colors.background;
  const rtl = isRtlLocale(locale);

  const title = customTitle || t(locale, "skylineTitle");
  const grid = buildHeatmapGrid(contributionDays, weeks, locale);

  const availableWidth = width - MARGIN_SIDE * 2;
  const tileHalfWidth = Math.min(
    MAX_TILE_HALF_WIDTH,
    Math.max(MIN_TILE_HALF_WIDTH, availableWidth / (grid.weekCount + 7))
  );
  const levelHeight = tileHalfWidth * 0.9;
  const layout = buildSkylineLayout(grid.cells, tileHalfWidth, levelHeight);

  const titleAreaHeight = hideTitle ? 12 : 46;
  const gridLeft = MARGIN_SIDE + Math.max(0, (availableWidth - layout.width) / 2);
  const gridTop = titleAreaHeight;
  const height = Math.round(gridTop + layout.height + 16);

  const topFill = colors.accent;
  const leftFill = shadeHex(colors.accent, 0.62);
  const rightFill = shadeHex(colors.accent, 0.8);
  const flatFill = colors.border;

  const toPathD = (points: readonly [number, number][], offsetX: number, offsetY: number): string =>
    points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x + offsetX} ${y + offsetY}`).join(" ") + " Z";

  return (
    <Card
      width={width}
      height={height}
      background={background}
      border={colors.border}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      hideBorder={hideBorder}
      idPrefix="skyline"
      rtl={rtl}
    >
      <FadeInKeyframes />

      {!hideTitle && (
        <FadeIn delay={0} disabled={disableAnimations}>
          <RtlMirror x={12} rtl={rtl}>
            <text x={12} y={22} fill={colors.title} fontFamily={FONT} fontWeight={700} fontSize={16}>
              {title}
            </text>
          </RtlMirror>
        </FadeIn>
      )}

      {layout.tiles.map((tile) => (
        <FadeIn
          key={tile.date}
          delay={disableAnimations ? 0 : Math.min(tile.depth * 0.006, 1)}
          disabled={disableAnimations}
        >
          <g>
            {tile.left && <path d={toPathD(tile.left, gridLeft, gridTop)} fill={leftFill} />}
            {tile.right && <path d={toPathD(tile.right, gridLeft, gridTop)} fill={rightFill} />}
            <path d={toPathD(tile.top, gridLeft, gridTop)} fill={tile.level === 0 ? flatFill : topFill}>
              <title>{`${tile.count} contribution${tile.count === 1 ? "" : "s"} on ${tile.date}`}</title>
            </path>
          </g>
        </FadeIn>
      ))}
    </Card>
  );
}
