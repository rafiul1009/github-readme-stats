import { getMockUserStats } from "@/widgets/stats/mock";
import type { RawUserStats } from "@/lib/githubStats";

export interface RawProfileSummaryData {
  stats: RawUserStats;
  avatarDataUri: string;
}

/** A tiny inline placeholder avatar (an initial-letter circle), generated synchronously — no network fetch for previews. */
function placeholderAvatar(initial: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#586069"/><text x="100" y="130" font-family="Inter, Ubuntu, sans-serif" font-size="110" fill="#fff" text-anchor="middle">${initial}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export function getMockProfileSummaryData(): RawProfileSummaryData {
  const stats = getMockUserStats();
  return { stats, avatarDataUri: placeholderAvatar(stats.login[0]?.toUpperCase() ?? "?") };
}
