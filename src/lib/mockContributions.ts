import type { FullContributionData } from "@/lib/github";

const MS_PER_DAY = 86400000;

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Deterministic, "today"-relative sample contribution history for widgets
 * that need a long, visually-varied history (activity graph, heatmap) but
 * not the specific streak/slump shape the streak widget's own mock.ts
 * builds (kept separate rather than shared, since tuning one would risk
 * breaking the other's carefully-shaped preview).
 *
 * Uses a smooth seasonal wave (more active in some months than others) plus
 * a deterministic pseudo-random jitter, so both the activity graph's line
 * and the heatmap's grid have believable peaks/valleys instead of uniform
 * noise or a flat line.
 */
export function generateMockContributionDays(totalDays: number): FullContributionData {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const days: { contributionCount: number; date: string }[] = [];

  for (let daysAgo = totalDays - 1; daysAgo >= 0; daysAgo -= 1) {
    const date = new Date(today.getTime() - daysAgo * MS_PER_DAY);

    // Deterministic pseudo-random jitter in [0, 1) from the day index alone.
    const seed = Math.sin(daysAgo * 12.9898) * 43758.5453;
    const jitter = seed - Math.floor(seed);

    // Slow seasonal wave over ~90 days, plus a weekly dip on weekends.
    const wave = (Math.sin((daysAgo / 90) * Math.PI * 2) + 1) / 2; // 0..1
    const isWeekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
    const weekendFactor = isWeekend ? 0.4 : 1;

    const base = wave * 8 * weekendFactor;
    const count = jitter < 0.15 ? 0 : Math.round(base * (0.4 + jitter));

    days.push({ contributionCount: Math.max(0, count), date: dateKey(date) });
  }

  const totalContributions = days.reduce((sum, day) => sum + day.contributionCount, 0);

  return {
    createdAt: dateKey(new Date(today.getTime() - (totalDays + 300) * MS_PER_DAY)),
    totalContributions,
    contributionDays: days,
  };
}
