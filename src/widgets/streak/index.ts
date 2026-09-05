import { fetchContributionData } from "@/lib/github";
import { calculateStreak, type StreakInfo } from "@/utils/streak";
import { generateStreakCard } from "@/components/svg";
import { COMMON_OPTIONS, mergeSchemas, type InferOptions } from "@/lib/options";
import { registerWidget } from "@/widgets/registry";

/**
 * Streak widget: registered against the new dispatcher so `/api/streak-svg`
 * and `/api/streak` (docs/TODOS.md 0.14) run through the shared cache and
 * option-parsing pipeline. Rendering still delegates to the legacy
 * generateStreakCard template-literal renderer, which only understands a
 * 'light' | 'dark' theme — its TSX port onto the full theme registry is
 * docs/TODOS.md Phase 1, tasks 1.1-1.2, not part of the Phase 0 platform work.
 */
const STREAK_SCHEMA = mergeSchemas(COMMON_OPTIONS, {
  font: {
    type: "string",
    description: "Font family used in the card text.",
    default: "Inter",
  },
} as const);

export type StreakOptions = InferOptions<typeof STREAK_SCHEMA>;

async function fetchStreakData(options: StreakOptions): Promise<StreakInfo> {
  const contributionData = await fetchContributionData(options.username);
  return calculateStreak(
    contributionData.contributionDays,
    contributionData.totalContributions,
    contributionData.createdAt
  );
}

function renderStreakSvg(data: StreakInfo, options: StreakOptions): string {
  // Back-compat shim: the legacy renderer only recognizes 'light'/'dark'.
  // Any other theme name (now valid ecosystem-wide) falls back to 'light'
  // here rather than erroring, which is strictly more permissive than the
  // pre-existing behavior it replaces.
  const mode: "light" | "dark" = options.theme === "dark" ? "dark" : "light";
  return generateStreakCard({ ...data, theme: mode, font: options.font });
}

function streakToJson(data: StreakInfo): unknown {
  return data;
}

registerWidget({
  type: "streak",
  schema: STREAK_SCHEMA,
  cacheSecondsDefault: 3600,
  fetchData: fetchStreakData,
  renderSvg: renderStreakSvg,
  toJson: streakToJson,
});
