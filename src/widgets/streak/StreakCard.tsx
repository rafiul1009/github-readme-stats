import { Card, Divider, FadeIn, FadeInKeyframes, Ring, RtlMirror } from "@/components/card";
import { formatNumber } from "@/lib/format";
import { resolveThemeSlots, type ThemeDefinition } from "@/lib/themes";
import { normalizeOverrideColor, parseColorValue } from "@/lib/color";
import { t, isRtlLocale, formatDatePattern, DEFAULT_DATE_FORMAT } from "@/lib/i18n";

export interface StreakCardOverrides {
  /** Raw bg_color query value: solid hex/CSS-name, or an "angle,c1,c2,..." gradient. */
  background?: string;
  border?: string;
  /** Maps to the card's accent-ish slots (ring, fire icon). */
  icon?: string;
  /** Maps to the card's emphasized big-number slots. */
  title?: string;
  /** Maps to the card's body/label slots. */
  text?: string;
}

export interface StreakCardProps {
  totalContributions: number;
  firstContributionDate: string;
  currentStreak: number;
  currentStreakStart: string;
  currentStreakEnd: string;
  longestStreak: number;
  longestStreakStart: string;
  longestStreakEnd: string;
  mode: "daily" | "weekly";
  theme: ThemeDefinition;
  overrides?: StreakCardOverrides;
  font?: string;
  numberFormat?: "short" | "long";
  locale?: string;
  dateFormat?: string;
  hideTotalContributions?: boolean;
  hideCurrentStreak?: boolean;
  hideLongestStreak?: boolean;
  disableAnimations?: boolean;
  hideBorder?: boolean;
  borderRadius?: number;
  borderWidth?: number;
  width?: number;
  height?: number;
}

const BASE_WIDTH = 495;
const BASE_HEIGHT = 195;

function formatDate(dateStr: string, pattern: string, locale: string): string {
  if (!dateStr) return "";
  return formatDatePattern(new Date(dateStr), pattern, locale, new Date().getUTCFullYear());
}

function dateRangeLabel(
  start: string,
  end: string,
  isCurrent: boolean,
  pattern: string,
  locale: string
): string {
  if (!start) return t(locale, "noStreak");
  const startLabel = formatDate(start, pattern, locale);
  const endLabel = isCurrent ? t(locale, "present") : formatDate(end, pattern, locale);
  return `${startLabel} - ${endLabel}`;
}

interface Section {
  key: "total" | "current" | "longest";
  visible: boolean;
}

/**
 * TSX/SVG port of the streak card (docs/TODOS.md Phase 1, task 1.1), replacing
 * the earlier hand-written template-literal renderer. Uses real SVG elements
 * (D1) rather than Satori, and the shared theme-slot/cache/option pipeline
 * built in Phase 0.
 */
export function StreakCard({
  totalContributions,
  firstContributionDate,
  currentStreak,
  currentStreakStart,
  currentStreakEnd,
  longestStreak,
  longestStreakStart,
  longestStreakEnd,
  mode,
  theme,
  overrides = {},
  font = "Inter",
  numberFormat = "short",
  locale = "en",
  dateFormat = DEFAULT_DATE_FORMAT,
  hideTotalContributions = false,
  hideCurrentStreak = false,
  hideLongestStreak = false,
  disableAnimations = false,
  hideBorder = false,
  borderRadius = 4.5,
  borderWidth = 1,
  width = BASE_WIDTH,
  height = BASE_HEIGHT,
}: StreakCardProps) {
  const colors = resolveThemeSlots(
    theme,
    ["background", "border", "stroke", "ring", "fire", "currStreakNum", "sideNums", "currStreakLabel", "sideLabels", "dates"] as const,
    {
      border: normalizeOverrideColor(overrides.border),
      ring: normalizeOverrideColor(overrides.icon),
      fire: normalizeOverrideColor(overrides.icon),
      currStreakNum: normalizeOverrideColor(overrides.title),
      sideNums: normalizeOverrideColor(overrides.title),
      currStreakLabel: normalizeOverrideColor(overrides.text),
      sideLabels: normalizeOverrideColor(overrides.text),
      dates: normalizeOverrideColor(overrides.text),
    }
  );

  // bg_color supports gradients, which don't fit the plain-string slot model
  // above, so it's resolved separately and handed to <Card> as a ColorValue.
  const background = overrides.background ? parseColorValue(overrides.background) : colors.background;

  const fontFamily = `${font}, Ubuntu, sans-serif`;
  const streakUnitLabel = mode === "weekly" ? "Weeks" : "Days";
  const rtl = isRtlLocale(locale);

  const sections: Section[] = [
    { key: "total", visible: !hideTotalContributions },
    { key: "current", visible: !hideCurrentStreak },
    { key: "longest", visible: !hideLongestStreak },
  ];
  const visibleSections = sections.filter((s) => s.visible);
  const columnCount = Math.max(visibleSections.length, 1);
  const centerXFor = (index: number) => (width * (index + 0.5)) / columnCount;

  // Vertical layout constants below are proportions of the original 495x195
  // design, scaled to the requested card_width/card_height so the layout
  // remains coherent at other sizes rather than clipping or floating.
  const dividerTopY = (height * 28) / BASE_HEIGHT;
  const dividerBottomY = (height * 170) / BASE_HEIGHT;
  const bigNumberY = (height * 80) / BASE_HEIGHT;
  const labelY = (height * 116) / BASE_HEIGHT;
  const rangeY = (height * 146) / BASE_HEIGHT;
  const currentLabelY = (height * 140) / BASE_HEIGHT;
  const currentRangeY = (height * 166) / BASE_HEIGHT;
  const ringCy = (height * 71) / BASE_HEIGHT;
  const ringRadius = (Math.min(width, height) * 40) / Math.min(BASE_WIDTH, BASE_HEIGHT);

  const totalRangeLabel = `${formatDate(firstContributionDate, "M j, Y", locale)} - ${t(locale, "present")}`;
  const currentRangeLabel = dateRangeLabel(currentStreakStart, currentStreakEnd, true, dateFormat, locale);
  const longestRangeLabel = dateRangeLabel(longestStreakStart, longestStreakEnd, false, dateFormat, locale);

  return (
    <Card
      width={width}
      height={height}
      background={background}
      border={colors.border}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      hideBorder={hideBorder}
      idPrefix="streak"
      rtl={rtl}
    >
      <FadeInKeyframes />
      <style>{`
        @keyframes currstreak {
          0% { font-size: 3px; opacity: 0.2; }
          80% { font-size: 34px; opacity: 1; }
          100% { font-size: 28px; opacity: 1; }
        }
      `}</style>

      {visibleSections.slice(1).map((_, i) => {
        const dividerX = (width * (i + 1)) / columnCount;
        return <Divider key={dividerX} x={dividerX} y1={dividerTopY} y2={dividerBottomY} color={colors.stroke} />;
      })}

      {visibleSections.map((section, index) => {
        const cx = centerXFor(index);

        if (section.key === "total") {
          return (
            <g key="total">
              <FadeIn delay={0.6} disabled={disableAnimations}>
                <RtlMirror x={cx} rtl={rtl}>
                  <text x={cx} y={bigNumberY} textAnchor="middle" fill={colors.sideNums} fontFamily={fontFamily} fontWeight={700} fontSize={28}>
                    {formatNumber(totalContributions, numberFormat, locale)}
                  </text>
                </RtlMirror>
              </FadeIn>
              <FadeIn delay={0.7} disabled={disableAnimations}>
                <RtlMirror x={cx} rtl={rtl}>
                  <text x={cx} y={labelY} textAnchor="middle" fill={colors.sideNums} fontFamily={fontFamily} fontWeight={400} fontSize={14}>
                    {t(locale, "totalContributions")}
                  </text>
                </RtlMirror>
              </FadeIn>
              <FadeIn delay={0.8} disabled={disableAnimations}>
                <RtlMirror x={cx} rtl={rtl}>
                  <text x={cx} y={rangeY} textAnchor="middle" fill={colors.dates} fontFamily={fontFamily} fontWeight={400} fontSize={12}>
                    {totalRangeLabel}
                  </text>
                </RtlMirror>
              </FadeIn>
            </g>
          );
        }

        if (section.key === "longest") {
          return (
            <g key="longest">
              <FadeIn delay={1.2} disabled={disableAnimations}>
                <RtlMirror x={cx} rtl={rtl}>
                  <text x={cx} y={bigNumberY} textAnchor="middle" fill={colors.sideNums} fontFamily={fontFamily} fontWeight={700} fontSize={28}>
                    {formatNumber(longestStreak, numberFormat, locale)}
                  </text>
                </RtlMirror>
              </FadeIn>
              <FadeIn delay={1.3} disabled={disableAnimations}>
                <RtlMirror x={cx} rtl={rtl}>
                  <text x={cx} y={labelY} textAnchor="middle" fill={colors.sideNums} fontFamily={fontFamily} fontWeight={400} fontSize={14}>
                    {t(locale, "longestStreak")}
                  </text>
                </RtlMirror>
              </FadeIn>
              <FadeIn delay={1.4} disabled={disableAnimations}>
                <RtlMirror x={cx} rtl={rtl}>
                  <text x={cx} y={rangeY} textAnchor="middle" fill={colors.dates} fontFamily={fontFamily} fontWeight={400} fontSize={12}>
                    {longestRangeLabel}
                  </text>
                </RtlMirror>
              </FadeIn>
            </g>
          );
        }

        // "current"
        const maskId = "streak-mask-ring-fire";
        return (
          <g key="current">
            <defs>
              <mask id={maskId}>
                <rect width={width} height={height} fill="white" />
                <ellipse cx={cx} cy={ringCy - 39} rx={13} ry={18} fill="black" />
              </mask>
            </defs>

            <FadeIn delay={0.9} disabled={disableAnimations}>
              <RtlMirror x={cx} rtl={rtl}>
                <text x={cx} y={currentLabelY} textAnchor="middle" fill={colors.ring} fontFamily={fontFamily} fontWeight={700} fontSize={14}>
                  {t(locale, "currentStreak")}
                </text>
              </RtlMirror>
            </FadeIn>
            <FadeIn delay={0.9} disabled={disableAnimations}>
              <RtlMirror x={cx} rtl={rtl}>
                <text x={cx} y={currentRangeY} textAnchor="middle" fill={colors.dates} fontFamily={fontFamily} fontWeight={400} fontSize={12}>
                  {currentRangeLabel}
                </text>
              </RtlMirror>
            </FadeIn>

            <g mask={`url(#${maskId})`}>
              <FadeIn delay={0.4} disabled={disableAnimations}>
                <Ring cx={cx} cy={ringCy} radius={ringRadius} color={colors.fire} strokeWidth={5} />
              </FadeIn>
            </g>

            <FadeIn delay={0.6} disabled={disableAnimations}>
              <RtlMirror x={cx - 12} rtl={rtl}>
                <g transform={`translate(${cx - 12}, ${ringCy - 51})`}>
                  <path
                    d="M 13.5 0.67 C 13.5 0.67 14.24 3.32 14.24 5.47 C 14.24 7.53 12.89 9.2 10.83 9.2 C 8.77 9.2 7.21 7.53 7.21 5.47 L 7.24 5.11 C 5.22 7.51 4 10.62 4 13.99 C 4 18.41 7.58 22 12 22 C 16.42 22 20 18.41 20 13.99 C 20 8.6 17.41 3.79 13.5 0.67 Z M 11.71 19 C 9.93 19 8.49 17.6 8.49 15.86 C 8.49 14.24 9.54 13.1 11.3 12.74 C 13.07 12.38 14.9 11.53 15.92 10.16 C 16.31 11.45 16.51 12.81 16.51 14.2 C 16.51 16.85 14.36 19 11.71 19 Z"
                    fill={colors.fire}
                  />
                </g>
              </RtlMirror>
            </FadeIn>

            <g style={disableAnimations ? undefined : { animation: "currstreak 0.6s linear forwards" }}>
              <RtlMirror x={cx} rtl={rtl}>
                <text x={cx} y={bigNumberY} textAnchor="middle" fill={colors.ring} fontFamily={fontFamily} fontWeight={700} fontSize={28}>
                  {formatNumber(currentStreak, numberFormat, locale)}
                </text>
              </RtlMirror>
            </g>
          </g>
        );
      })}

      {/* Screen-reader-only unit hint; visual label text intentionally omits it to match the original design. */}
      <title>{`${streakUnitLabel} streak`}</title>
    </Card>
  );
}
