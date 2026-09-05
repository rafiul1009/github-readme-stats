import { NextRequest, NextResponse } from "next/server";
import "@/widgets"; // registers all widgets
import { getWidget } from "@/widgets/registry";
import { getOrSetAsync, githubDataCache } from "@/lib/cache";

const DATA_CACHE_TTL_MS = 30 * 60 * 1000;

/**
 * Back-compat alias for the JSON streak endpoint (docs/TODOS.md 0.14).
 * Preserves the exact response shapes existing consumers depend on, while
 * sharing the same data cache key ("streak:<username>") as /api/streak-svg
 * and /api/widget/streak so all three never double-fetch from GitHub.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username parameter is required" }, { status: 400 });
    }

    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json({ error: "GitHub token is not configured" }, { status: 500 });
    }

    const widget = getWidget("streak");
    if (!widget) {
      throw new Error("streak widget is not registered");
    }

    const options: Record<string, unknown> = { username };
    const raw = await getOrSetAsync(githubDataCache, `streak:${username}`, DATA_CACHE_TTL_MS, () =>
      widget.fetchRawData(options)
    );
    const data = widget.computeData(raw, options);

    return NextResponse.json(widget.toJson(data, options));
  } catch (error) {
    console.error("Error fetching streak data:", error);
    return NextResponse.json({ error: "Failed to fetch streak data" }, { status: 500 });
  }
}
