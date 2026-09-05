import { Card, FadeIn, FadeInKeyframes } from "@/components/card";
import { resolveThemeSlots, type ThemeDefinition } from "@/lib/themes";
import { normalizeOverrideColor, parseColorValue } from "@/lib/color";
import { wrapText } from "@/lib/text";
import { formatNumber } from "@/lib/format";
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

  const title = showOwner ? `${repo.owner}/${repo.name}` : repo.name;
  const maxChars = Math.max(Math.floor((width - 50) / CHAR_WIDTH_ESTIMATE), 10);
  const maxLines = descriptionLinesCount ?? 3;
  const descLines = repo.description ? wrapText(repo.description, maxChars, maxLines) : [];
  const reservedLines = descriptionLinesCount ?? Math.max(descLines.length, 1);

  const badges: string[] = [];
  if (repo.isArchived) badges.push("Archived");
  if (repo.isTemplate) badges.push("Template");
  if (repo.isFork) badges.push("Fork");

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
    >
      <FadeInKeyframes />

      <FadeIn delay={0} disabled={disableAnimations}>
        <g transform="translate(20, 22)">
          <RepoIcon color={colors.icon} />
          <text x={22} y={5} fill={colors.title} fontFamily={FONT} fontWeight={700} fontSize={15}>
            {title}
          </text>
        </g>
      </FadeIn>

      {badges.length > 0 && (
        <FadeIn delay={0.1} disabled={disableAnimations}>
          <text x={width - 20} y={18} textAnchor="end" fill={colors.text} fontFamily={FONT} fontSize={10} opacity={0.7}>
            {badges.join(" · ")}
          </text>
        </FadeIn>
      )}

      {descLines.map((line, i) => (
        <FadeIn key={i} delay={0.15 + i * 0.05} disabled={disableAnimations}>
          <text x={20} y={48 + i * 18} fill={colors.text} fontFamily={FONT} fontSize={12}>
            {line}
          </text>
        </FadeIn>
      ))}

      <FadeIn delay={0.3} disabled={disableAnimations}>
        <g transform={`translate(20, ${footerY})`}>
          {repo.language && (
            <g>
              <circle cx={5} cy={-4} r={5} fill={repo.language.color} />
              <text x={16} y={0} fill={colors.text} fontFamily={FONT} fontSize={11}>
                {repo.language.name}
              </text>
            </g>
          )}
          <g transform={`translate(${repo.language ? 120 : 0}, -8)`}>
            <StarIcon color={colors.text} />
          </g>
          <text x={(repo.language ? 120 : 0) + 18} y={0} fill={colors.text} fontFamily={FONT} fontSize={11}>
            {formatNumber(repo.stars, "short")}
          </text>
          <g transform={`translate(${(repo.language ? 120 : 0) + 60}, -8)`}>
            <ForkIcon color={colors.text} />
          </g>
          <text x={(repo.language ? 120 : 0) + 60 + 18} y={0} fill={colors.text} fontFamily={FONT} fontSize={11}>
            {formatNumber(repo.forks, "short")}
          </text>
        </g>
      </FadeIn>
    </Card>
  );
}
