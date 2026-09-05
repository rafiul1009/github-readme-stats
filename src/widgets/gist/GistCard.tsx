import { Card, FadeIn, FadeInKeyframes } from "@/components/card";
import { resolveThemeSlots, type ThemeDefinition } from "@/lib/themes";
import { normalizeOverrideColor, parseColorValue } from "@/lib/color";
import { wrapText } from "@/lib/text";
import { getLanguageColor } from "@/lib/languageColors";
import type { RawGistData } from "@/lib/githubRepo";
import { RepoIcon } from "@/widgets/pin/icons";

export interface GistCardOverrides {
  background?: string;
  border?: string;
  title?: string;
  text?: string;
  icon?: string;
}

export interface GistCardProps {
  gist: RawGistData;
  showOwner: boolean;
  theme: ThemeDefinition;
  overrides?: GistCardOverrides;
  disableAnimations?: boolean;
  hideBorder?: boolean;
  borderRadius?: number;
  borderWidth?: number;
  width?: number;
}

const BASE_WIDTH = 400;
const FONT = "Inter, Ubuntu, sans-serif";
const MAX_FILES_SHOWN = 4;

export function GistCard({
  gist,
  showOwner,
  theme,
  overrides = {},
  disableAnimations = false,
  hideBorder = false,
  borderRadius = 4.5,
  borderWidth = 1,
  width = BASE_WIDTH,
}: GistCardProps) {
  const colors = resolveThemeSlots(theme, ["background", "border", "title", "text", "icon", "accent"] as const, {
    border: normalizeOverrideColor(overrides.border),
    title: normalizeOverrideColor(overrides.title),
    text: normalizeOverrideColor(overrides.text),
    icon: normalizeOverrideColor(overrides.icon),
  });
  const background = overrides.background ? parseColorValue(overrides.background) : colors.background;

  const primaryName = gist.description || gist.files[0]?.filename || "Untitled Gist";
  const title = showOwner ? `${gist.owner}/${primaryName}` : primaryName;
  const maxChars = Math.max(Math.floor((width - 50) / 7.1), 10);
  const titleLines = wrapText(title, maxChars, 2);

  const shownFiles = gist.files.slice(0, MAX_FILES_SHOWN);
  const extraCount = gist.files.length - shownFiles.length;

  const height = 30 + titleLines.length * 20 + shownFiles.length * 20 + (extraCount > 0 ? 18 : 0) + 20;

  return (
    <Card
      width={width}
      height={height}
      background={background}
      border={colors.border}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      hideBorder={hideBorder}
      idPrefix="gist"
    >
      <FadeInKeyframes />

      <FadeIn delay={0} disabled={disableAnimations}>
        <g transform="translate(20, 22)">
          <RepoIcon color={colors.icon} />
          {titleLines.map((line, i) => (
            <text key={i} x={22} y={5 + i * 20} fill={colors.title} fontFamily={FONT} fontWeight={700} fontSize={15}>
              {line}
            </text>
          ))}
        </g>
      </FadeIn>

      {shownFiles.map((file, i) => {
        const y = 30 + titleLines.length * 20 + i * 20;
        return (
          <FadeIn key={file.filename} delay={0.1 + i * 0.05} disabled={disableAnimations}>
            <g>
              <circle cx={24} cy={y - 4} r={4} fill={getLanguageColor(file.language)} />
              <text x={34} y={y} fill={colors.text} fontFamily={FONT} fontSize={12}>
                {file.filename}
              </text>
            </g>
          </FadeIn>
        );
      })}

      {extraCount > 0 && (
        <FadeIn delay={0.3} disabled={disableAnimations}>
          <text
            x={20}
            y={30 + titleLines.length * 20 + shownFiles.length * 20}
            fill={colors.text}
            fontFamily={FONT}
            fontSize={11}
            opacity={0.7}
          >
            +{extraCount} more file{extraCount === 1 ? "" : "s"}
          </text>
        </FadeIn>
      )}
    </Card>
  );
}
