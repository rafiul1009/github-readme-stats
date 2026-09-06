import { Card, FadeIn, FadeInKeyframes, RtlMirror } from "@/components/card";
import { resolveThemeSlots, type ThemeDefinition } from "@/lib/themes";
import { normalizeOverrideColor, parseColorValue } from "@/lib/color";
import { wrapText } from "@/lib/text";
import { isRtlLocale } from "@/lib/i18n";
import type { Quote } from "@/lib/quotes";

export interface QuoteCardOverrides {
  background?: string;
  border?: string;
  title?: string;
  text?: string;
  accent?: string;
}

export interface QuoteCardProps {
  quote: Quote;
  theme: ThemeDefinition;
  overrides?: QuoteCardOverrides;
  locale?: string;
  disableAnimations?: boolean;
  hideBorder?: boolean;
  borderRadius?: number;
  borderWidth?: number;
  width?: number;
}

const FONT = "Inter, Ubuntu, sans-serif";
const MARGIN = 28;
const LINE_HEIGHT = 22;

export function QuoteCard({
  quote,
  theme,
  overrides = {},
  locale = "en",
  disableAnimations = false,
  hideBorder = false,
  borderRadius = 4.5,
  borderWidth = 1,
  width = 480,
}: QuoteCardProps) {
  const colors = resolveThemeSlots(theme, ["background", "border", "title", "text", "accent"] as const, {
    border: normalizeOverrideColor(overrides.border),
    title: normalizeOverrideColor(overrides.title),
    text: normalizeOverrideColor(overrides.text),
    accent: normalizeOverrideColor(overrides.accent),
  });
  const background = overrides.background ? parseColorValue(overrides.background) : colors.background;
  const rtl = isRtlLocale(locale);

  const maxCharsPerLine = Math.floor((width - MARGIN * 2 - 20) / 7.2);
  const lines = wrapText(quote.text, maxCharsPerLine, 5);
  const quoteTop = 40;
  const authorY = quoteTop + lines.length * LINE_HEIGHT + 14;
  const height = authorY + 24;

  return (
    <Card
      width={width}
      height={height}
      background={background}
      border={colors.border}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      hideBorder={hideBorder}
      idPrefix="quote"
      rtl={rtl}
    >
      <FadeInKeyframes />
      <RtlMirror x={MARGIN - 18} rtl={rtl}>
        <text x={MARGIN - 18} y={30} fill={colors.accent} fontFamily="Georgia, serif" fontWeight={700} fontSize={40} opacity={0.5}>
          &#8220;
        </text>
      </RtlMirror>
      {lines.map((line, i) => (
        <FadeIn key={i} delay={disableAnimations ? 0 : 0.08 + i * 0.08} disabled={disableAnimations}>
          <RtlMirror x={MARGIN} rtl={rtl}>
            <text x={MARGIN} y={quoteTop + i * LINE_HEIGHT} fill={colors.title} fontFamily={FONT} fontStyle="italic" fontSize={15}>
              {line}
            </text>
          </RtlMirror>
        </FadeIn>
      ))}
      <FadeIn delay={disableAnimations ? 0 : 0.1 + lines.length * 0.08} disabled={disableAnimations}>
        <RtlMirror x={width - MARGIN} rtl={rtl}>
          <text x={width - MARGIN} y={authorY} textAnchor="end" fill={colors.text} fontFamily={FONT} fontSize={13} opacity={0.8}>
            — {quote.author}
          </text>
        </RtlMirror>
      </FadeIn>
    </Card>
  );
}
