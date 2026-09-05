import { Card, FadeIn, FadeInKeyframes, Ring } from "@/components/card";
import { formatNumber } from "@/lib/format";
import { resolveThemeSlots, type ThemeDefinition } from "@/lib/themes";
import { normalizeOverrideColor, parseColorValue } from "@/lib/color";
import { calculateRank } from "@/lib/rank";
import { StatIcon, type StatIconName } from "./icons";
import type { RawUserStats } from "@/lib/githubStats";

export interface StatsCardOverrides {
  background?: string;
  border?: string;
  icon?: string;
  title?: string;
  text?: string;
  ring?: string;
}

export interface StatsCardProps {
  stats: RawUserStats;
  hide: string[];
  show: string[];
  showIcons: boolean;
  hideRank: boolean;
  rankIcon: "default" | "github" | "percentile";
  includeAllCommits: boolean;
  lineHeight: number;
  textBold: boolean;
  customTitle?: string;
  theme: ThemeDefinition;
  overrides?: StatsCardOverrides;
  font?: string;
  numberFormat?: "short" | "long";
  disableAnimations?: boolean;
  hideBorder?: boolean;
  hideTitle?: boolean;
  borderRadius?: number;
  borderWidth?: number;
  width?: number;
}

const BASE_WIDTH = 450;
const PADDING_TOP = 55;
const PADDING_BOTTOM = 25;
const RANK_AREA_WIDTH = 150;
const ROW_X = 25;

interface Row {
  key: string;
  icon: StatIconName;
  label: string;
  value: string;
}

export function StatsCard({
  stats,
  hide,
  show,
  showIcons,
  hideRank,
  rankIcon,
  includeAllCommits,
  lineHeight,
  textBold,
  customTitle,
  theme,
  overrides = {},
  font = "Inter",
  numberFormat = "short",
  disableAnimations = false,
  hideBorder = false,
  hideTitle = false,
  borderRadius = 4.5,
  borderWidth = 1,
  width = BASE_WIDTH,
}: StatsCardProps) {
  const colors = resolveThemeSlots(theme, ["background", "border", "title", "text", "icon", "accent"] as const, {
    border: normalizeOverrideColor(overrides.border),
    title: normalizeOverrideColor(overrides.title),
    text: normalizeOverrideColor(overrides.text),
    icon: normalizeOverrideColor(overrides.icon),
  });
  const ringColor = normalizeOverrideColor(overrides.ring) ?? colors.accent;
  const background = overrides.background ? parseColorValue(overrides.background) : colors.background;

  const fontFamily = `${font}, Ubuntu, sans-serif`;
  const fontWeight = textBold ? 700 : 400;
  const hideSet = new Set(hide.map((h) => h.toLowerCase()));

  const commitCount = includeAllCommits ? stats.allTimeCommits ?? stats.currentYearCommits : stats.currentYearCommits;
  const commitLabel = includeAllCommits ? "Total Commits" : "Total Commits (Current Year)";

  // Typed as a standalone Row[] (rather than inline before .filter()) so the
  // object literals below are contextually typed against Row — chaining
  // .filter() directly on the literal would widen `icon` to `string` first.
  const baseRowDefs: Row[] = [
    { key: "stars", icon: "star", label: "Total Stars", value: formatNumber(stats.totalStars, numberFormat) },
    { key: "commits", icon: "commit", label: commitLabel, value: formatNumber(commitCount, numberFormat) },
    { key: "prs", icon: "pr", label: "Total PRs", value: formatNumber(stats.totalPRs, numberFormat) },
    { key: "issues", icon: "issue", label: "Total Issues", value: formatNumber(stats.totalIssues, numberFormat) },
    {
      key: "contribs",
      icon: "contrib",
      label: "Contributed to",
      value: formatNumber(stats.contributedTo, numberFormat),
    },
  ];
  const baseRows = baseRowDefs.filter((row) => !hideSet.has(row.key));

  const extraRowDefs: Record<string, Row> = {
    reviews: { key: "reviews", icon: "review", label: "PR Reviews", value: formatNumber(stats.reviews, numberFormat) },
    discussions_started: {
      key: "discussions_started",
      icon: "discussion",
      label: "Discussions Started",
      value: formatNumber(stats.discussionsStarted, numberFormat),
    },
    discussions_answered: {
      key: "discussions_answered",
      icon: "discussion",
      label: "Discussions Answered",
      value: formatNumber(stats.discussionsAnswered, numberFormat),
    },
    prs_merged: {
      key: "prs_merged",
      icon: "pr",
      label: "PRs Merged",
      value: formatNumber(stats.mergedPRs, numberFormat),
    },
    prs_merged_percentage: {
      key: "prs_merged_percentage",
      icon: "pr",
      label: "PRs Merged %",
      value: stats.totalPRs > 0 ? `${((stats.mergedPRs / stats.totalPRs) * 100).toFixed(1)}%` : "0%",
    },
  };
  const extraRows = show.map((k) => extraRowDefs[k.toLowerCase()]).filter((r): r is Row => Boolean(r));

  const rows = [...baseRows, ...extraRows];
  const height = PADDING_TOP + rows.length * lineHeight + PADDING_BOTTOM;

  const rank = calculateRank({
    commits: commitCount,
    prs: stats.totalPRs,
    issues: stats.totalIssues,
    reviews: stats.reviews,
    stars: stats.totalStars,
    followers: stats.followers,
  });

  const rowsAreaWidth = hideRank ? width - 40 : width - RANK_AREA_WIDTH;
  const title = (customTitle || "{name}'s GitHub Stats")
    .replace(/\{name\}/g, stats.name || stats.login)
    .replace(/\{username\}/g, stats.login);

  return (
    <Card
      width={width}
      height={height}
      background={background}
      border={colors.border}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      hideBorder={hideBorder}
      idPrefix="stats"
    >
      <FadeInKeyframes />

      {!hideTitle && (
        <FadeIn delay={0} disabled={disableAnimations}>
          <text x={ROW_X} y={35} fill={colors.title} fontFamily={fontFamily} fontWeight={700} fontSize={18}>
            {title}
          </text>
        </FadeIn>
      )}

      {rows.map((row, index) => {
        const y = PADDING_TOP + index * lineHeight;
        const textX = showIcons ? ROW_X + 24 : ROW_X;
        return (
          <FadeIn key={row.key} delay={0.1 + index * 0.05} disabled={disableAnimations}>
            <g>
              {showIcons && <StatIcon name={row.icon} x={ROW_X} y={y - 12} color={colors.icon} />}
              <text x={textX} y={y} fill={colors.text} fontFamily={fontFamily} fontWeight={fontWeight} fontSize={14}>
                {row.label}:
              </text>
              <text
                x={rowsAreaWidth}
                y={y}
                textAnchor="end"
                fill={colors.text}
                fontFamily={fontFamily}
                fontWeight={fontWeight}
                fontSize={14}
              >
                {row.value}
              </text>
            </g>
          </FadeIn>
        );
      })}

      {!hideRank && (
        <FadeIn delay={0.3} disabled={disableAnimations}>
          <g transform={`translate(${width - RANK_AREA_WIDTH / 2}, ${height / 2})`}>
            <Ring cx={0} cy={0} radius={40} color={ringColor} strokeWidth={6} progress={1 - rank.percentile / 100} trackColor={colors.border} />
            <text
              x={0}
              y={6}
              textAnchor="middle"
              fill={colors.title}
              fontFamily={fontFamily}
              fontWeight={700}
              fontSize={rankIcon === "percentile" ? 16 : 22}
            >
              {rankIcon === "percentile" ? `${rank.percentile.toFixed(1)}%` : rank.level}
            </text>
          </g>
        </FadeIn>
      )}
    </Card>
  );
}
