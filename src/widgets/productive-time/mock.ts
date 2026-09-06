import type { RawProductiveTimeData } from "@/lib/githubStats";

/** Deterministic sample commit timestamps — a "night owl, weekday-heavy" pattern — for the builder's live preview. */
export function getMockProductiveTimeData(): RawProductiveTimeData {
  const commitDates: string[] = [];
  const base = new Date("2024-01-01T00:00:00Z");

  for (let day = 0; day < 90; day += 1) {
    const date = new Date(base.getTime() + day * 86400000);
    const weekday = date.getUTCDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const commitsToday = isWeekend ? 1 : 3 + (day % 3);

    for (let c = 0; c < commitsToday; c += 1) {
      // Concentrated in the evening (UTC 18-23), a handful in the morning.
      const hour = c % 4 === 0 ? 9 + (c % 3) : 18 + (c % 6);
      const commitDate = new Date(date.getTime());
      commitDate.setUTCHours(hour % 24, (c * 13) % 60, 0, 0);
      commitDates.push(commitDate.toISOString());
    }
  }

  return { commitDates };
}
