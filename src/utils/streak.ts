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

export interface StreakCalcOptions {
  /** 'daily' (default) requires a contribution every day; 'weekly' requires at least one per Sun-Sat week. */
  mode?: "daily" | "weekly";
  /** Weekday abbreviations ('Sun'..'Sat') that neither break nor count toward the streak. */
  excludeDays?: string[];
  /** IANA timezone used to determine "today"'s calendar date. Defaults to UTC. */
  timezone?: string;
  /** Only consider contributions from this year onward (must be 2005 or later). */
  startingYear?: number;
}

const MS_PER_DAY = 86400000;
const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

// GitHub's contribution calendar dates are calendar-day keys ("2026-09-04").
// All arithmetic here stays in that same day-key space (via Date.UTC, which
// just encodes Y/M/D with no timezone meaning of its own) so it never drifts
// against a real-world "today" computed in a different timezone.
function dateKeyToDayNumber(dateKey: string): number {
  const [year, month, day] = dateKey.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

function dayNumberToDateKey(dayNumber: number): string {
  return new Date(dayNumber * MS_PER_DAY).toISOString().slice(0, 10);
}

function dayNumberToWeekday(dayNumber: number): number {
  return new Date(dayNumber * MS_PER_DAY).getUTCDay(); // 0 = Sun ... 6 = Sat
}

function weekStartDayNumber(dayNumber: number): number {
  return dayNumber - dayNumberToWeekday(dayNumber);
}

/** Today's calendar date, as a "YYYY-MM-DD" key, in the given IANA timezone (UTC if omitted). */
function todayDateKey(timezone?: string): string {
  if (!timezone) return new Date().toISOString().slice(0, 10);
  // en-CA formats as YYYY-MM-DD, which is exactly the day-key format used everywhere else here.
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date());
}

function isExcludedDay(dayNumber: number, excludeDays: Set<string>): boolean {
  if (excludeDays.size === 0) return false;
  return excludeDays.has(WEEKDAY_NAMES[dayNumberToWeekday(dayNumber)]);
}

function calculateDailyStreaks(
  sortedDays: ContributionDay[],
  excludeDays: Set<string>,
  timezone: string | undefined
): { longestStreak: number; longestStreakStart: string; longestStreakEnd: string; currentStreak: number; currentStreakStart: string; currentStreakEnd: string } {
  if (sortedDays.length === 0) {
    return {
      longestStreak: 0,
      longestStreakStart: "",
      longestStreakEnd: "",
      currentStreak: 0,
      currentStreakStart: "",
      currentStreakEnd: "",
    };
  }

  const byDate = new Map(sortedDays.map((day) => [day.date.slice(0, 10), day.contributionCount]));
  const minDayNumber = dateKeyToDayNumber(sortedDays[0].date);
  const maxDayNumber = dateKeyToDayNumber(sortedDays[sortedDays.length - 1].date);

  // Longest streak: walk every calendar day in range (not just the entries
  // present in the input). A contribution always extends the run — being on
  // an "excluded" weekday never discards it. An excluded day with NO
  // contribution is a transparent gap (neither extends nor breaks the run);
  // a non-excluded day with no contribution breaks it, as normal.
  let longestStreak = 0;
  let longestStreakStart = "";
  let longestStreakEnd = "";
  let runStreak = 0;
  let runStart = "";

  for (let dayNumber = minDayNumber; dayNumber <= maxDayNumber; dayNumber += 1) {
    const dateKey = dayNumberToDateKey(dayNumber);
    const count = byDate.get(dateKey) ?? 0;

    if (count > 0) {
      if (runStreak === 0) runStart = dateKey;
      runStreak += 1;
      if (runStreak > longestStreak) {
        longestStreak = runStreak;
        longestStreakStart = runStart;
        longestStreakEnd = dateKey;
      }
    } else if (isExcludedDay(dayNumber, excludeDays)) {
      // transparent gap: leave runStreak/runStart untouched
    } else {
      runStreak = 0;
      runStart = "";
    }
  }

  // Current streak: walk backwards from today (or yesterday, if today has no
  // contribution yet and today itself isn't an excluded free pass) while
  // contributions continue, treating a no-contribution excluded day the same
  // transparent way as above.
  let cursor = dateKeyToDayNumber(todayDateKey(timezone));
  const todayHasContribution = !!byDate.get(dayNumberToDateKey(cursor));

  if (!todayHasContribution && !isExcludedDay(cursor, excludeDays)) {
    cursor -= 1;
  }

  let currentStreak = 0;
  let currentStreakEnd = "";

  while (cursor >= minDayNumber - 1) {
    const dateKey = dayNumberToDateKey(cursor);
    const count = byDate.get(dateKey) ?? 0;

    if (count > 0) {
      if (currentStreak === 0) currentStreakEnd = dateKey;
      currentStreak += 1;
      cursor -= 1;
    } else if (isExcludedDay(cursor, excludeDays)) {
      cursor -= 1;
    } else {
      break;
    }
  }

  const currentStreakStart =
    currentStreak > 0
      ? dayNumberToDateKey(dateKeyToDayNumber(currentStreakEnd) - (currentStreak - 1))
      : "";

  return { longestStreak, longestStreakStart, longestStreakEnd, currentStreak, currentStreakStart, currentStreakEnd };
}

function calculateWeeklyStreaks(
  sortedDays: ContributionDay[],
  timezone: string | undefined
): { longestStreak: number; longestStreakStart: string; longestStreakEnd: string; currentStreak: number; currentStreakStart: string; currentStreakEnd: string } {
  if (sortedDays.length === 0) {
    return {
      longestStreak: 0,
      longestStreakStart: "",
      longestStreakEnd: "",
      currentStreak: 0,
      currentStreakStart: "",
      currentStreakEnd: "",
    };
  }

  // exclude_days isn't meaningful in weekly mode (a week only needs *a*
  // contribution, regardless of which day) — every contribution counts
  // toward its week.
  const weeksWithContribution = new Set<number>();
  for (const day of sortedDays) {
    if (day.contributionCount > 0) {
      weeksWithContribution.add(weekStartDayNumber(dateKeyToDayNumber(day.date)));
    }
  }

  const minWeekStart = weekStartDayNumber(dateKeyToDayNumber(sortedDays[0].date));
  const maxWeekStart = weekStartDayNumber(dateKeyToDayNumber(sortedDays[sortedDays.length - 1].date));

  let longestStreak = 0;
  let longestStreakStart = "";
  let longestStreakEnd = "";
  let runStreak = 0;
  let runStart = "";

  for (let weekStart = minWeekStart; weekStart <= maxWeekStart; weekStart += 7) {
    if (weeksWithContribution.has(weekStart)) {
      if (runStreak === 0) runStart = dayNumberToDateKey(weekStart);
      runStreak += 1;
      if (runStreak > longestStreak) {
        longestStreak = runStreak;
        longestStreakStart = runStart;
        longestStreakEnd = dayNumberToDateKey(weekStart + 6);
      }
    } else {
      runStreak = 0;
      runStart = "";
    }
  }

  const todayWeekStart = weekStartDayNumber(dateKeyToDayNumber(todayDateKey(timezone)));
  let cursorWeek = weeksWithContribution.has(todayWeekStart) ? todayWeekStart : todayWeekStart - 7;

  let currentStreak = 0;
  let currentStreakEnd = "";

  while (cursorWeek >= minWeekStart && weeksWithContribution.has(cursorWeek)) {
    if (currentStreak === 0) currentStreakEnd = dayNumberToDateKey(cursorWeek + 6);
    currentStreak += 1;
    cursorWeek -= 7;
  }

  const currentStreakStart = currentStreak > 0 ? dayNumberToDateKey(cursorWeek + 7) : "";

  return { longestStreak, longestStreakStart, longestStreakEnd, currentStreak, currentStreakStart, currentStreakEnd };
}

export function calculateStreak(
  contributionDays: ContributionDay[],
  totalContributions: number,
  firstContributionDate: string,
  options: StreakCalcOptions = {}
): StreakInfo {
  const { mode = "daily", excludeDays = [], timezone, startingYear } = options;
  const excludeDaysSet = new Set(excludeDays);

  let effectiveFirstDate = firstContributionDate;
  let effectiveTotal = totalContributions;
  let filteredDays = contributionDays;

  if (startingYear) {
    const floorDateKey = `${startingYear}-01-01`;
    if (dateKeyToDayNumber(floorDateKey) > dateKeyToDayNumber(firstContributionDate)) {
      effectiveFirstDate = floorDateKey;
      filteredDays = contributionDays.filter((day) => day.date.slice(0, 10) >= floorDateKey);
      effectiveTotal = filteredDays.reduce((sum, day) => sum + day.contributionCount, 0);
    }
  }

  const sortedDays = [...filteredDays].sort(
    (a, b) => dateKeyToDayNumber(a.date) - dateKeyToDayNumber(b.date)
  );

  const streaks =
    mode === "weekly"
      ? calculateWeeklyStreaks(sortedDays, timezone)
      : calculateDailyStreaks(sortedDays, excludeDaysSet, timezone);

  return {
    totalContributions: effectiveTotal,
    firstContributionDate: effectiveFirstDate,
    ...streaks,
  };
}
