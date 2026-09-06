import { generateMockContributionDays } from "@/lib/mockContributions";
import type { FullContributionData } from "@/lib/github";

/** Sample data for the builder's live preview (task 6.5) — a full year so every granularity has something to show. */
export function getMockActivityData(): FullContributionData {
  return generateMockContributionDays(400);
}
