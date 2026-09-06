import { Card, FadeIn, FadeInKeyframes, RtlMirror } from "@/components/card";
import { resolveThemeSlots, type ThemeDefinition } from "@/lib/themes";
import { normalizeOverrideColor, parseColorValue } from "@/lib/color";
import { wrapText } from "@/lib/text";
import { formatNumber } from "@/lib/format";
import { t, isRtlLocale } from "@/lib/i18n";
import type { RawRepoData } from "@/lib/githubRepo";
import { RepoIcon, StarIcon, ForkIcon } from "./icons";

export interface PinCardOverrides {
  background?: string;
  border?: string;
  title?: string;
  text?: string;
  icon?: string;
}

export interface PinCardProps {
  repo: RawRepoData;
  showOwner: boolean;
  descriptionLinesCount?: number;
  theme: ThemeDefinition;
  overrides?: PinCardOverrides;
  locale?: string;
  disableAnimations?: boolean;
  hideBorder?: boolean;
  borderRadius?: number;
  borderWidth?: number;
  width?: number;
}

const BASE_WIDTH = 400;
const FONT = "Inter, Ubuntu, sans-serif";
// Rough monospace-ish average glyph width at 12px — good enough to size the
// wrap column without measuring actual text (no canvas/DOM in this render path).
const CHAR_WIDTH_ESTIMATE = 7.1;

export function PinCard({
  repo,
  showOwner,
  descriptionLinesCount,
  theme,
  overrides = {},
  locale = "en",
  disableAnimations = false,
  hideBorder = false,
  borderRadius = 4.5,
  borderWidth = 1,
  width = BASE_WIDTH,
}: PinCardProps) {
  const colors = resolveThemeSlots(theme, ["background", "border", "title", "text", "icon", "accent"] as const, {
    border: normalizeOverrideColor(overrides.border),
    title: normalizeOverrideColor(overrides.title),
    text: normalizeOverrideColor(overrides.text),
    icon: normalizeOverrideColor(overrides.icon),
  });
  const background = overrides.background ? parseColorValue(overrides.background) : colors.background;
  const rtl = isRtlLocale(locale);

  const title = showOwner ? `${repo.owner}/${repo.name}` : repo.name;
  const maxChars = Math.max(Math.floor((width - 50) / CHAR_WIDTH_ESTIMATE), 10);
  const maxLines = descriptionLinesCount ?? 3;
  const descLines = repo.description ? wrapText(repo.description, maxChars, maxLines) : [];
  const reservedLines = descriptionLinesCount ?? Math.max(descLines.length, 1);

  const badges: string[] = [];
  if (repo.isArchived) badges.push(t(locale, "archived"));
  if (repo.isTemplate) badges.push(t(locale, "template"));
  if (repo.isFork) badges.push(t(locale, "fork"));

  const height = 45 + reservedLines * 18 + 45;
  const footerY = height - 22;

  return (
    <Card
      width={width}
      height={height}
      background={background}
      border={colors.border}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      hideBorder={hideBorder}
      idPrefix="pin"
      rtl={rtl}
    >
      <FadeInKeyframes />

      <FadeIn delay={0} disabled={disableAnimations}>
        <RtlMirror x={20} rtl={rtl}>
          <g transform="translate(20, 22)">
            <RepoIcon color={colors.icon} />
            <text x={22} y={5} fill={colors.title} fontFamily={FONT} fontWeight={700} fontSize={15}>
              {title}
            </text>
          </g>
        </RtlMirror>
      </FadeIn>

      {badges.length > 0 && (
        <FadeIn delay={0.1} disabled={disableAnimations}>
          <RtlMirror x={width - 20} rtl={rtl}>
            <text x={width - 20} y={18} textAnchor="end" fill={colors.text} fontFamily={FONT} fontSize={10} opacity={0.7}>
              {badges.join(" · ")}
            </text>
          </RtlMirror>
        </FadeIn>
      )}

      {descLines.map((line, i) => (
        <FadeIn key={i} delay={0.15 + i * 0.05} disabled={disableAnimations}>
          <RtlMirror x={20} rtl={rtl}>
            <text x={20} y={48 + i * 18} fill={colors.text} fontFamily={FONT} fontSize={12}>
              {line}
            </text>
          </RtlMirror>
        </FadeIn>
      ))}

      <FadeIn delay={0.3} disabled={disableAnimations}>
        <g transform={`translate(20, ${footerY})`}>
          {repo.language && (
            <>
              <RtlMirror x={5} rtl={rtl}>
                <circle cx={5} cy={-4} r={5} fill={repo.language.color} />
              </RtlMirror>
              <RtlMirror x={16} rtl={rtl}>
                <text x={16} y={0} fill={colors.text} fontFamily={FONT} fontSize={11}>
                  {repo.language.name}
                </text>
              </RtlMirror>
            </>
          )}
          <RtlMirror x={repo.language ? 120 : 0} rtl={rtl}>
            <g transform={`translate(${repo.language ? 120 : 0}, -8)`}>
              <StarIcon color={colors.text} />
            </g>
          </RtlMirror>
          <RtlMirror x={(repo.language ? 120 : 0) + 18} rtl={rtl}>
            <text x={(repo.language ? 120 : 0) + 18} y={0} fill={colors.text} fontFamily={FONT} fontSize={11}>
              {formatNumber(repo.stars, "short", locale)}
            </text>
          </RtlMirror>
          <RtlMirror x={(repo.language ? 120 : 0) + 60} rtl={rtl}>
            <g transform={`translate(${(repo.language ? 120 : 0) + 60}, -8)`}>
              <ForkIcon color={colors.text} />
            </g>
          </RtlMirror>
          <RtlMirror x={(repo.language ? 120 : 0) + 60 + 18} rtl={rtl}>
            <text x={(repo.language ? 120 : 0) + 60 + 18} y={0} fill={colors.text} fontFamily={FONT} fontSize={11}>
              {formatNumber(repo.forks, "short", locale)}
            </text>
          </RtlMirror>
        </g>
      </FadeIn>
    </Card>
  );
}
