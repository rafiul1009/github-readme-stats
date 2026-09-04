interface StreakInfo {
  currentStreak: number;
  lastContributionDate: string;
}

export function calculateStreak(contributionDays: { contributionCount: number; date: string }[]): StreakInfo {
  let currentStreak = 0;
  let lastContributionDate = '';

  // Sort contributions by date in descending order
  const sortedDays = [...contributionDays].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const day of sortedDays) {
    const contributionDate = new Date(day.date);
    contributionDate.setHours(0, 0, 0, 0);

    // Break if we find a day with no contributions
    if (day.contributionCount === 0) {
      break;
    }

    // Check if this contribution is part of the current streak
    const dayDifference = Math.floor(
      (today.getTime() - contributionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (dayDifference <= currentStreak + 1) {
      currentStreak = dayDifference === 0 ? 1 : dayDifference;
      lastContributionDate = day.date;
    } else {
      break;
    }
  }

  return {
    currentStreak,
    lastContributionDate
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
    timestamp: Date.now()
  });
}