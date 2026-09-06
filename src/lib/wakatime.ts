import { WidgetRenderError } from "@/widgets/errors";

export interface RawWakaTimeLanguage {
  name: string;
  percent: number;
  text: string;
  color: string | null;
}

export interface RawWakaTimeData {
  languages: RawWakaTimeLanguage[];
  totalText: string;
}

interface WakaTimeApiResponse {
  data?: {
    languages?: { name: string; percent: number; text: string; color?: string | null }[];
    human_readable_total?: string;
    human_readable_total_including_other_language?: string;
  };
  error?: string;
}

/**
 * WakaTime card (docs/TODOS.md 9.2): fetches a user's public coding-activity
 * stats. No API key is used or accepted — this project has no per-viewer
 * auth story, so it relies on the same unauthenticated public-stats
 * endpoint WakaTime itself serves when a user opts their profile into
 * public sharing (Settings → "Display code time publicly" on wakatime.com)
 * — the same tradeoff GitHub's own public contribution graph makes.
 * `apiDomain` lets self-hosted API-compatible services (Wakapi, Hakatime)
 * be used instead of wakatime.com, since they mirror this same response
 * shape at their own domain.
 */
export async function fetchWakaTimeStats(username: string, apiDomain: string): Promise<RawWakaTimeData> {
  const url = `https://${apiDomain}/api/v1/users/${encodeURIComponent(username)}/stats/last_7_days?is_including_today=true`;

  let response: Response;
  try {
    response = await fetch(url, { headers: { accept: "application/json" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new WidgetRenderError(`Failed to fetch WakaTime stats: ${message}`, 502);
  }

  if (response.status === 404) {
    throw new WidgetRenderError(`WakaTime user "${username}" not found`, 404);
  }
  if (response.status === 401 || response.status === 403) {
    throw new WidgetRenderError(`WakaTime profile for "${username}" is not public`, 403);
  }
  if (!response.ok) {
    throw new WidgetRenderError(`Failed to fetch WakaTime stats: upstream returned ${response.status}`, 502);
  }

  const body = (await response.json()) as WakaTimeApiResponse;
  if (!body.data) {
    throw new WidgetRenderError(`WakaTime returned no data for "${username}" — is their profile public?`, 502);
  }

  return {
    languages: (body.data.languages ?? []).map((lang) => ({
      name: lang.name,
      percent: lang.percent,
      text: lang.text,
      color: lang.color ?? null,
    })),
    totalText: body.data.human_readable_total ?? body.data.human_readable_total_including_other_language ?? "0 mins",
  };
}
