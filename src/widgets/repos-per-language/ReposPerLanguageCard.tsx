import { Card, FadeIn, FadeInKeyframes, RtlMirror } from "@/components/card";
import { resolveThemeSlots, type ThemeDefinition } from "@/lib/themes";
import { normalizeOverrideColor, parseColorValue } from "@/lib/color";
import { t, isRtlLocale } from "@/lib/i18n";
import type { LanguageStat } from "@/lib/languages";

export interface ReposPerLanguageCardOverrides {
  background?: string;
  border?: string;
  title?: string;
  text?: string;
}

export interface ReposPerLanguageCardProps {
  languages: LanguageStat[];
  customTitle?: string;
  theme: ThemeDefinition;
  overrides?: ReposPerLanguageCardOverrides;
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
const ROW_HEIGHT = 34;

export function ReposPerLanguageCard({
  languages,
  customTitle,
  theme,
  overrides = {},
  locale = "en",
  disableAnimations = false,
  hideBorder = false,
  hideTitle = false,
  borderRadius = 4.5,
  borderWidth = 1,
  width = 320,
}: ReposPerLanguageCardProps) {
  const colors = resolveThemeSlots(theme, ["background", "border", "title", "text"] as const, {
    border: normalizeOverrideColor(overrides.border),
    title: normalizeOverrideColor(overrides.title),
    text: normalizeOverrideColor(overrides.text),
  });
  const background = overrides.background ? parseColorValue(overrides.background) : colors.background;
  const rtl = isRtlLocale(locale);

  const title = customTitle || t(locale, "reposPerLanguageTitle");
  const contentTop = hideTitle ? MARGIN : 55;
  const barWidth = width - MARGIN * 2 - 60;
  const maxCount = Math.max(...languages.map((l) => l.repoCount), 1);
  const height = languages.length === 0 ? contentTop + 40 : contentTop + languages.length * ROW_HEIGHT + 10;

  return (
    <Card
      width={width}
      height={height}
      background={background}
      border={colors.border}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      hideBorder={hideBorder}
      idPrefix="repos-per-language"
      rtl={rtl}
    >
      <FadeInKeyframes />
      {!hideTitle && (
        <FadeIn delay={0} disabled={disableAnimations}>
          <RtlMirror x={MARGIN} rtl={rtl}>
            <text x={MARGIN} y={30} fill={colors.title} fontFamily={FONT} fontWeight={700} fontSize={18}>
              {title}
            </text>
          </RtlMirror>
        </FadeIn>
      )}

      {languages.length === 0 && (
        <RtlMirror x={MARGIN} rtl={rtl}>
          <text x={MARGIN} y={contentTop + 10} fill={colors.text} fontFamily={FONT} fontSize={13}>
            {t(locale, "noLanguageData")}
          </text>
        </RtlMirror>
      )}

      {languages.map((lang, i) => {
        const y = contentTop + i * ROW_HEIGHT;
        return (
          <FadeIn key={lang.name} delay={0.1 + i * 0.05} disabled={disableAnimations}>
            <g>
              <RtlMirror x={MARGIN + 4} rtl={rtl}>
                <circle cx={MARGIN + 4} cy={y - 4} r={4} fill={lang.color} />
              </RtlMirror>
              <RtlMirror x={MARGIN + 14} rtl={rtl}>
                <text x={MARGIN + 14} y={y} fill={colors.text} fontFamily={FONT} fontSize={12}>
                  {lang.name}
                </text>
              </RtlMirror>
              <RtlMirror x={width - MARGIN} rtl={rtl}>
                <text x={width - MARGIN} y={y} textAnchor="end" fill={colors.text} fontFamily={FONT} fontSize={12}>
                  {lang.repoCount}
                </text>
              </RtlMirror>
              <g transform={`translate(${MARGIN}, ${y + 6})`}>
                <rect width={barWidth} height={6} rx={3} fill={colors.border} />
                <rect width={(barWidth * lang.repoCount) / maxCount} height={6} rx={3} fill={lang.color} />
              </g>
            </g>
          </FadeIn>
        );
      })}
    </Card>
  );
}
