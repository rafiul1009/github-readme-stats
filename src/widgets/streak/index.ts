import { fetchContributionData, type FullContributionData } from "@/lib/github";
import { calculateStreak, type StreakInfo } from "@/utils/streak";
import { getTheme } from "@/lib/themes";
import { registerWidget } from "@/widgets/registry";
import { renderJsxToSvg } from "@/lib/render/svg";
import { StreakCard } from "./StreakCard";
import { getMockContributionData } from "./mock";
import { STREAK_SCHEMA, type StreakOptions } from "./schema";

// Fetches only what depends on username, so this is safe to cache under
// `streak:<username>` regardless of mode/exclude_days/timezone/starting_year
// — those affect computeStreakData below, which is never cached.
async function fetchStreakRawData(options: StreakOptions): Promise<FullContributionData> {
  return fetchContributionData(options.username);
}

function computeStreakData(raw: FullContributionData, options: StreakOptions): StreakInfo {
  return calculateStreak(raw.contributionDays, raw.totalContributions, raw.createdAt, {
    mode: options.mode,
    excludeDays: options.exclude_days,
    timezone: options.timezone || undefined,
    startingYear: options.starting_year || undefined,
  });
}

function renderStreakSvg(data: StreakInfo, options: StreakOptions): string {
  return renderJsxToSvg(
    StreakCard({
      ...data,
      mode: options.mode,
      theme: getTheme(options.theme),
      overrides: {
        background: options.bg_color,
        border: options.border_color,
        icon: options.icon_color,
        title: options.title_color,
        text: options.text_color,
      },
      font: options.font,
      numberFormat: options.number_format,
      locale: options.locale,
      dateFormat: options.date_format,
      hideTotalContributions: options.hide_total_contributions,
      hideCurrentStreak: options.hide_current_streak,
      hideLongestStreak: options.hide_longest_streak,
      disableAnimations: options.disable_animations,
      hideBorder: options.hide_border,
      borderRadius: options.border_radius,
      borderWidth: options.border_width,
      width: options.card_width,
      height: options.card_height,
    })
  );
}

function streakToJson(data: StreakInfo): unknown {
  return data;
}

registerWidget({
  type: "streak",
  schema: STREAK_SCHEMA,
  cacheSecondsDefault: 3600,
  fetchRawData: fetchStreakRawData,
  computeData: computeStreakData,
  renderSvg: renderStreakSvg,
  toJson: streakToJson,
  mockRawData: () => getMockContributionData(),
});

export type { StreakOptions } from "./schema";
