import { WidgetRenderError } from "@/widgets/errors";

/**
 * Stack Exchange's public API (docs/TODOS.md 11.3) — `/users/{id}` is
 * readable with no authentication at all, at a 300-requests/day-per-IP
 * anonymous quota. `STACKEXCHANGE_KEY` (optional, server-side only — never
 * accepted as a request query param, the same policy as the WakaTime
 * widget's API key: a hosted multi-tenant deployment has no way to keep a
 * per-viewer secret out of a public embed URL) raises that quota for a
 * busier self-hosted deployment.
 */

export interface StackOverflowStats {
  displayName: string;
  reputation: number;
  badgeCounts: { bronze: number; silver: number; gold: number };
  profileUrl: string;
}

interface StackExchangeUserResponse {
  items: {
    display_name: string;
    reputation: number;
    badge_counts: { bronze: number; silver: number; gold: number };
    link: string;
  }[];
}

export async function fetchStackOverflowStats(userId: string): Promise<StackOverflowStats> {
  const url = new URL(`https://api.stackexchange.com/2.3/users/${encodeURIComponent(userId)}`);
  url.searchParams.set("site", "stackoverflow");
  if (process.env.STACKEXCHANGE_KEY) url.searchParams.set("key", process.env.STACKEXCHANGE_KEY);

  let response: Response;
  try {
    response = await fetch(url.toString());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new WidgetRenderError(`Failed to fetch Stack Overflow stats: ${message}`, 502);
  }

  if (response.status === 429) {
    throw new WidgetRenderError("Stack Exchange API quota exceeded — please try again later.", 429);
  }
  if (!response.ok) {
    throw new WidgetRenderError(`Failed to fetch Stack Overflow stats: API returned ${response.status}`, 502);
  }

  const body = (await response.json()) as StackExchangeUserResponse;
  const user = body.items[0];
  if (!user) {
    throw new WidgetRenderError(`Stack Overflow user "${userId}" not found`, 404);
  }

  return {
    displayName: user.display_name,
    reputation: user.reputation,
    badgeCounts: user.badge_counts,
    profileUrl: user.link,
  };
}
