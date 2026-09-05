import { fetchUserStats, type RawUserStats } from "@/lib/githubStats";
import { getTheme } from "@/lib/themes";
import { registerWidget } from "@/widgets/registry";
import { renderJsxToSvg } from "@/lib/render/svg";
import { StatsCard } from "./StatsCard";
import { getMockUserStats } from "./mock";
import { STATS_SCHEMA, type StatsOptions } from "./schema";

// include_all_commits changes what's fetched (a second, more expensive
// query), so — unlike the streak widget's mode/exclude_days/etc., which
// only affect derivation — it needs its own data-cache key suffix (below)
// rather than living in computeData.
async function fetchStatsRawData(options: StatsOptions): Promise<RawUserStats> {
  return fetchUserStats(options.username, options.include_all_commits);
}

function statsDataCacheKeySuffix(options: StatsOptions): string {
  return options.include_all_commits ? "all-commits" : "year-commits";
}

function computeStatsData(raw: RawUserStats): RawUserStats {
  return raw;
}

function renderStatsSvg(data: RawUserStats, options: StatsOptions): string {
  return renderJsxToSvg(
    StatsCard({
      stats: data,
      hide: options.hide,
      show: options.show,
      showIcons: options.show_icons,
      hideRank: options.hide_rank,
      rankIcon: options.rank_icon,
      includeAllCommits: options.include_all_commits,
      lineHeight: options.line_height,
      textBold: options.text_bold,
      customTitle: options.custom_title,
      theme: getTheme(options.theme),
      overrides: {
        background: options.bg_color,
        border: options.border_color,
        icon: options.icon_color,
        title: options.title_color,
        text: options.text_color,
        ring: options.ring_color,
      },
      numberFormat: options.number_format,
      disableAnimations: options.disable_animations,
      hideBorder: options.hide_border,
      hideTitle: options.hide_title,
      borderRadius: options.border_radius,
      borderWidth: options.border_width,
      width: options.card_width,
    })
  );
}

function statsToJson(data: RawUserStats): unknown {
  return data;
}

registerWidget({
  type: "stats",
  schema: STATS_SCHEMA,
  cacheSecondsDefault: 3600,
  fetchRawData: fetchStatsRawData,
  dataCacheKeySuffix: statsDataCacheKeySuffix,
  computeData: computeStatsData,
  renderSvg: renderStatsSvg,
  toJson: statsToJson,
  mockRawData: () => getMockUserStats(),
});

export type { StatsOptions } from "./schema";
