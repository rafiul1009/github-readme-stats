import { NextRequest } from 'next/server';
import { fetchContributionData } from '@/lib/github';
import { calculateStreak, getCachedStreak, setCachedStreak } from '@/utils/streak';
import { generateStreakCard } from '@/components/svg';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const theme = (searchParams.get('theme') || 'light') as 'light' | 'dark';
    const font = searchParams.get('font') || 'Inter';

    if (!username) {
      return new Response('Username parameter is required', { status: 400 });
    }

    if (!process.env.GITHUB_TOKEN) {
      return new Response('GitHub token is not configured', { status: 500 });
    }

    // Check cache first
    const cachedData = getCachedStreak(username);
    const streakInfo = cachedData ?? (await (async () => {
      const contributionData = await fetchContributionData(username);
      const info = calculateStreak(
        contributionData.contributionDays,
        contributionData.totalContributions,
        contributionData.createdAt
      );
      setCachedStreak(username, info);
      return info;
    })());

    // Generate SVG
    const svg = generateStreakCard({
      totalContributions: streakInfo.totalContributions,
      firstContributionDate: streakInfo.firstContributionDate,
      currentStreak: streakInfo.currentStreak,
      currentStreakStart: streakInfo.currentStreakStart,
      currentStreakEnd: streakInfo.currentStreakEnd,
      longestStreak: streakInfo.longestStreak,
      longestStreakStart: streakInfo.longestStreakStart,
      longestStreakEnd: streakInfo.longestStreakEnd,
      theme,
      font
    });

    // Return SVG with proper content type
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Error generating streak SVG:', error);
    return new Response('Failed to generate streak SVG', { status: 500 });
  }
}
