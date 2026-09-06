export interface ActivityPoint {
  /** UTC bucket-start date, "YYYY-MM-DD". */
  date: string;
  count: number;
}

export type ActivityGranularity = "day" | "week" | "month";

export interface AggregateActivityOptions {
  /** How many past days (including today) to include. */
  days: number;
  /** Overrides the auto-chosen granularity (task 6.1's configurable range/style). */
  granularity?: ActivityGranularity | "auto";
}

/**
 * Picks a bucket size that keeps the point count readable: daily for short
 * ranges, weekly for a few months to a year, monthly beyond that — the same
 * reasoning GitHub's own contribution graph uses (weekly columns instead of
 * ~365 individual days).
 */
export function chooseGranularity(days: number): ActivityGranularity {
  if (days <= 60) return "day";
  if (days <= 400) return "week";
  return "month";
}

function bucketKey(date: Date, granularity: ActivityGranularity): string {
  if (granularity === "month") {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-01`;
  }
  if (granularity === "week") {
    // Align to the Sunday starting this date's week, matching GitHub's own
    // contribution calendar convention (also used by heatmap.ts).
    const aligned = new Date(date);
    aligned.setUTCDate(aligned.getUTCDate() - aligned.getUTCDay());
    return aligned.toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

/**
 * Aggregates raw per-day contribution counts into evenly-bucketed points
 * for the activity graph widget. Every day in range contributes to some
 * bucket (even at 0), so buckets with no activity still appear as a
 * genuine dip rather than a gap in the line.
 */
export function aggregateActivity(
  contributionDays: { date: string; contributionCount: number }[],
  options: AggregateActivityOptions
): ActivityPoint[] {
  const granularity =
    !options.granularity || options.granularity === "auto" ? chooseGranularity(options.days) : options.granularity;

  const cutoff = new Date();
  cutoff.setUTCHours(0, 0, 0, 0);
  cutoff.setUTCDate(cutoff.getUTCDate() - (options.days - 1));

  const buckets = new Map<string, number>();
  for (const day of contributionDays) {
    const date = new Date(`${day.date}T00:00:00Z`);
    if (date < cutoff) continue;
    const key = bucketKey(date, granularity);
    buckets.set(key, (buckets.get(key) ?? 0) + day.contributionCount);
  }

  return Array.from(buckets.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}
