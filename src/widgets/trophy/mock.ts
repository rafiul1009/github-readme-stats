import { getMockUserStats } from "@/widgets/stats/mock";
import type { RawUserStats } from "@/lib/githubStats";

/** Reuses the stats widget's sample user (docs/TODOS.md 7.8) — same shape, same demo account. */
export function getMockTrophyStats(): RawUserStats {
  return getMockUserStats();
}
