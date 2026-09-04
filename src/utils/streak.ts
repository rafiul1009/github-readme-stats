interface ContributionDay {
  contributionCount: number;
  date: string;
}

export interface StreakInfo {
  totalContributions: number;
  firstContributionDate: string;
  currentStreak: number;
  currentStreakStart: string;
  currentStreakEnd: string;
  longestStreak: number;
  longestStreakStart: string;
  longestStreakEnd: string;
}

const MS_PER_DAY = 86400000;

// GitHub's contribution calendar dates are UTC calendar days ("2026-09-04").
// All arithmetic here stays in that same UTC day-key space so it never drifts
// against local-timezone "today", which would silently shift the boundary.
function dateKeyToDayNumber(dateKey: string): number {
  const [year, month, day] = dateKey.slice(0, 10).split('-').map(Number);
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

function dayNumberToDateKey(dayNumber: number): string {
  return new Date(dayNumber * MS_PER_DAY).toISOString().slice(0, 10);
}

function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function calculateStreak(
  contributionDays: ContributionDay[],
  totalContributions: number,
  firstContributionDate: string
): StreakInfo {
  const sortedDays = [...contributionDays].sort(
    (a, b) => dateKeyToDayNumber(a.date) - dateKeyToDayNumber(b.date)
  );

  // Longest streak: scan forward, tracking the run of consecutive contributed days.
  let longestStreak = 0;
  let longestStreakStart = '';
  let longestStreakEnd = '';

  let runStreak = 0;
  let runStart = '';
  let previousDayNumber: number | null = null;

  for (const day of sortedDays) {
    const dayNumber = dateKeyToDayNumber(day.date);

    if (day.contributionCount === 0) {
      runStreak = 0;
      runStart = '';
      previousDayNumber = dayNumber;
      continue;
    }

    if (runStreak > 0 && previousDayNumber !== null && dayNumber - previousDayNumber === 1) {
      runStreak += 1;
    } else {
      runStreak = 1;
      runStart = day.date;
    }

    if (runStreak > longestStreak) {
      longestStreak = runStreak;
      longestStreakStart = runStart;
      longestStreakEnd = day.date;
    }

    previousDayNumber = dayNumber;
  }

  // Current streak: walk backwards from today (or yesterday, if today has no
  // contribution yet) while contributions continue uninterrupted.
  const byDate = new Map(sortedDays.map((day) => [day.date.slice(0, 10), day.contributionCount]));
  let cursor = dateKeyToDayNumber(todayDateKey());

  if (!byDate.get(dayNumberToDateKey(cursor))) {
    cursor -= 1;
  }

  let currentStreak = 0;
  let currentStreakEnd = '';

  while (byDate.get(dayNumberToDateKey(cursor))) {
    if (currentStreak === 0) {
      currentStreakEnd = dayNumberToDateKey(cursor);
    }
    currentStreak += 1;
    cursor -= 1;
  }

  const currentStreakStart =
    currentStreak > 0
      ? dayNumberToDateKey(dateKeyToDayNumber(currentStreakEnd) - (currentStreak - 1))
      : '';

  return {
    totalContributions,
    firstContributionDate,
    currentStreak,
    currentStreakStart,
    currentStreakEnd,
    longestStreak,
    longestStreakStart,
    longestStreakEnd,
  };
}

// Cache implementation
const cache = new Map<string, { data: StreakInfo; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

export function getCachedStreak(key: string): StreakInfo | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

export function setCachedStreak(key: string, data: StreakInfo): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}
