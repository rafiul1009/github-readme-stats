import { fetchUserStats, type RawUserStats } from "@/lib/githubStats";
import { computeTrophies, type Trophy } from "@/lib/trophies";
import { getTheme } from "@/lib/themes";
import { registerWidget } from "@/widgets/registry";
import { renderJsxToSvg } from "@/lib/render/svg";
import { TrophyCard } from "./TrophyCard";
import { getMockTrophyStats } from "./mock";
import { TROPHY_SCHEMA, type TrophyOptions } from "./schema";

/**
 * Trophies need a full commit history, not just the current year, for the
 * rank thresholds (up to 4000 commits) to mean anything — so this widget
 * always requests the more expensive all-time-commits query rather than
 * gating it behind include_all_commits like the stats widget does.
 */
async function fetchTrophyRawData(options: TrophyOptions): Promise<RawUserStats> {
  return fetchUserStats(options.username, true);
}

function filterTrophies(trophies: Trophy[], options: TrophyOptions): Trophy[] {
  let result = trophies;

  if (options.title.length > 0) {
    const wanted = new Set(options.title.map((t) => t.toLowerCase()));
    result = result.filter((trophy) => wanted.has(trophy.key.toLowerCase()));
  }

  if (options.rank.length > 0) {
    const wanted = new Set(options.rank.map((r) => r.toUpperCase()));
    result = result.filter((trophy) => wanted.has(trophy.rank));
  }

  return result;
}

function computeTrophyData(raw: RawUserStats, options: TrophyOptions): Trophy[] {
  const trophies = computeTrophies({
    stars: raw.totalStars,
    commits: raw.allTimeCommits ?? raw.currentYearCommits,
    followers: raw.followers,
    issues: raw.totalIssues,
    prs: raw.totalPRs,
    repos: raw.totalRepos,
    languageCount: raw.languageCount,
    organizationsCount: raw.organizationsCount,
    createdAt: raw.createdAt,
  });

  return filterTrophies(trophies, options);
}

function renderTrophySvg(data: Trophy[], options: TrophyOptions): string {
  return renderJsxToSvg(
    TrophyCard({
      trophies: data,
      column: options.column,
      row: options.row,
      marginW: options.margin_w,
      marginH: options.margin_h,
      noBg: options.no_bg,
      noFrame: options.no_frame,
      customTitle: options.custom_title,
      theme: getTheme(options.theme),
      overrides: {
        background: options.bg_color,
        border: options.border_color,
        icon: options.icon_color,
        title: options.title_color,
        text: options.text_color,
      },
      locale: options.locale,
      numberFormat: options.number_format,
      disableAnimations: options.disable_animations,
      hideBorder: options.hide_border,
      hideTitle: options.hide_title,
      borderRadius: options.border_radius,
      borderWidth: options.border_width,
    })
  );
}

function trophyToJson(data: Trophy[]): unknown {
  return { trophies: data };
}

registerWidget({
  type: "trophy",
  schema: TROPHY_SCHEMA,
  cacheSecondsDefault: 3600,
  fetchRawData: fetchTrophyRawData,
  computeData: computeTrophyData,
  renderSvg: renderTrophySvg,
  toJson: trophyToJson,
  mockRawData: () => getMockTrophyStats(),
});

export type { TrophyOptions } from "./schema";
