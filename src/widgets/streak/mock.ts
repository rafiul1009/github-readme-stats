import type { FullContributionData } from "@/lib/github";

const MS_PER_DAY = 86400000;

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Deterministic, "today"-relative sample contribution history used to power
 * the builder's live preview (docs/TODOS.md Phase 1, task 1.6) without ever
 * calling the GitHub API. Shaped so every region of the card has something
 * to show: an unbroken recent run (current streak), a slump, and a longer
 * unbroken historical run (longest streak).
 */
export function getMockContributionData(): FullContributionData {
  const today = new Date();
  const totalDays = 420;
  const days: { contributionCount: number; date: string }[] = [];

  for (let daysAgo = totalDays - 1; daysAgo >= 0; daysAgo -= 1) {
    const date = new Date(today.getTime() - daysAgo * MS_PER_DAY);

    let count: number;
    if (daysAgo < 50) {
      // Last ~50 days: unbroken, for a healthy current streak.
      count = 2 + (daysAgo % 5);
    } else if (daysAgo < 140) {
      // A slump: sparse, occasional contributions.
      count = daysAgo % 4 === 0 ? 1 : 0;
    } else if (daysAgo >= 200 && daysAgo < 290) {
      // A long unbroken historical run, to be the "longest streak".
      count = 1 + (daysAgo % 3);
    } else {
      // Ordinary noisy activity elsewhere.
      count = daysAgo % 3 === 0 ? 0 : 1 + (daysAgo % 4);
    }

    days.push({ contributionCount: count, date: dateKey(date) });
  }

  const totalContributions = days.reduce((sum, day) => sum + day.contributionCount, 0);

  return {
    createdAt: dateKey(new Date(today.getTime() - (totalDays + 300) * MS_PER_DAY)),
    totalContributions,
    contributionDays: days,
  };
}
