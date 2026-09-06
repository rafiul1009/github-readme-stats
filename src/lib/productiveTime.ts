const WEEKDAY_ORDER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface ProductiveTimeResult {
  /** Commit counts for hours 0-23, in the requested timezone. */
  byHour: number[];
  /** Commit counts for Sun(0)-Sat(6), in the requested timezone. */
  byWeekday: number[];
  sampleSize: number;
}

function hourInTimezone(date: Date, timezone: string): number {
  try {
    return parseInt(new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hourCycle: "h23" }).format(date), 10);
  } catch {
    return date.getUTCHours();
  }
}

function weekdayInTimezone(date: Date, timezone: string): number {
  try {
    const label = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short" }).format(date);
    const index = WEEKDAY_ORDER.indexOf(label);
    return index === -1 ? date.getUTCDay() : index;
  } catch {
    return date.getUTCDay();
  }
}

/**
 * Buckets a sample of commit timestamps into hour-of-day and day-of-week
 * histograms (docs/TODOS.md 7.7), in the given IANA timezone (UTC if
 * omitted) — same timezone-handling approach as the streak card's
 * "today" calculation (src/utils/streak.ts).
 */
export function computeProductiveTime(commitDates: string[], timezone = "UTC"): ProductiveTimeResult {
  const byHour = new Array(24).fill(0);
  const byWeekday = new Array(7).fill(0);

  for (const iso of commitDates) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) continue;
    byHour[hourInTimezone(date, timezone)] += 1;
    byWeekday[weekdayInTimezone(date, timezone)] += 1;
  }

  return { byHour, byWeekday, sampleSize: commitDates.length };
}
