import { Card, FadeIn, FadeInKeyframes, RtlMirror } from "@/components/card";
import { resolveThemeSlots, type ThemeDefinition } from "@/lib/themes";
import { normalizeOverrideColor, parseColorValue } from "@/lib/color";
import { formatDatePattern, t, isRtlLocale } from "@/lib/i18n";
import { wrapText } from "@/lib/text";
import type { MediumPost } from "@/lib/medium";

export interface MediumCardOverrides {
  background?: string;
  border?: string;
  title?: string;
  text?: string;
  accent?: string;
}

export interface MediumCardProps {
  posts: MediumPost[];
  customTitle?: string;
  theme: ThemeDefinition;
  overrides?: MediumCardOverrides;
  locale?: string;
  disableAnimations?: boolean;
  hideBorder?: boolean;
  hideTitle?: boolean;
  borderRadius?: number;
  borderWidth?: number;
  width?: number;
}

const FONT = "Inter, Ubuntu, sans-serif";
const PADDING = 18;
const ROW_HEIGHT = 34;

export function MediumCard({
  posts,
  customTitle,
  theme,
  overrides = {},
  locale = "en",
  disableAnimations = false,
  hideBorder = false,
  hideTitle = false,
  borderRadius = 4.5,
  borderWidth = 1,
  width = 400,
}: MediumCardProps) {
  const colors = resolveThemeSlots(theme, ["background", "border", "title", "text", "accent", "muted"] as const, {
    border: normalizeOverrideColor(overrides.border),
    title: normalizeOverrideColor(overrides.title),
    text: normalizeOverrideColor(overrides.text),
    accent: normalizeOverrideColor(overrides.accent),
  });
  const background = overrides.background ? parseColorValue(overrides.background) : colors.background;
  const rtl = isRtlLocale(locale);

  const title = customTitle || t(locale, "mediumTitle");
  const titleAllowance = hideTitle ? 12 : 40;
  const maxChars = Math.max(20, Math.floor((width - PADDING * 2) / 6.2));

  const bodyHeight = posts.length === 0 ? ROW_HEIGHT : posts.length * ROW_HEIGHT;
  const height = Math.round(titleAllowance + bodyHeight + PADDING);

  return (
    <Card
      width={width}
      height={height}
      background={background}
      border={colors.border}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      hideBorder={hideBorder}
      idPrefix="medium"
      rtl={rtl}
    >
      <FadeInKeyframes />

      {!hideTitle && (
        <FadeIn delay={0} disabled={disableAnimations}>
          <RtlMirror x={PADDING} rtl={rtl}>
            <text x={PADDING} y={26} fill={colors.title} fontFamily={FONT} fontWeight={700} fontSize={16}>
              {title}
            </text>
          </RtlMirror>
        </FadeIn>
      )}

      {posts.length === 0 && (
        <RtlMirror x={PADDING} rtl={rtl}>
          <text x={PADDING} y={titleAllowance + 16} fill={colors.text} fontFamily={FONT} fontSize={12}>
            {t(locale, "noMediumData")}
          </text>
        </RtlMirror>
      )}

      {posts.map((post, i) => {
        const y = titleAllowance + i * ROW_HEIGHT;
        const dateLabel = post.pubDate
          ? formatDatePattern(new Date(post.pubDate), "M j, Y", locale, new Date().getUTCFullYear())
          : "";

        return (
          <FadeIn key={post.link} delay={disableAnimations ? 0 : Math.min(0.05 + i * 0.08, 0.6)} disabled={disableAnimations}>
            <RtlMirror x={PADDING} rtl={rtl}>
              <a href={post.link} target="_blank" rel="noopener noreferrer">
                <text x={PADDING} y={y + 14} fill={colors.accent} fontFamily={FONT} fontWeight={600} fontSize={12}>
                  {wrapText(post.title, maxChars, 1)[0] ?? ""}
                </text>
              </a>
            </RtlMirror>
            <RtlMirror x={PADDING} rtl={rtl}>
              <text x={PADDING} y={y + 28} fill={colors.muted} fontFamily={FONT} fontSize={10} opacity={0.8}>
                {dateLabel}
              </text>
            </RtlMirror>
          </FadeIn>
        );
      })}
    </Card>
  );
}
