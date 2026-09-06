import { generateMockContributionDays } from "@/lib/mockContributions";
import type { FullContributionData } from "@/lib/github";

/** Sample data for the builder's live preview (task 6.5) — enough history for the default 53-week grid. */
export function getMockHeatmapData(): FullContributionData {
  return generateMockContributionDays(260 * 7);
}
