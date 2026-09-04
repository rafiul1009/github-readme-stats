import { NextRequest, NextResponse } from 'next/server';
import { fetchContributionData } from '@/lib/github';
import { calculateStreak, getCachedStreak, setCachedStreak } from '@/utils/streak';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username parameter is required' },
        { status: 400 }
      );
    }

    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json(
        { error: 'GitHub token is not configured' },
        { status: 500 }
      );
    }

    // Check cache first
    const cachedData = getCachedStreak(username);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Fetch new data if not in cache
    const contributionData = await fetchContributionData(username);
    const streakInfo = calculateStreak(
      contributionData.contributionDays,
      contributionData.totalContributions,
      contributionData.createdAt
    );

    // Cache the result
    setCachedStreak(username, streakInfo);

    return NextResponse.json(streakInfo);
  } catch (error) {
    console.error('Error fetching streak data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streak data' },
      { status: 500 }
    );
  }
}
