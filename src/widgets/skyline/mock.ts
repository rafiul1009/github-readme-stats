import { generateMockContributionDays } from "@/lib/mockContributions";
import type { FullContributionData } from "@/lib/github";

/** Sample data for the builder's live preview — enough history for the default 26-week grid. */
export function getMockSkylineData(): FullContributionData {
  return generateMockContributionDays(52 * 7);
}
