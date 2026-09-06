import { NextRequest } from "next/server";
import "@/widgets"; // registers all widgets
import { handleWidgetRequest } from "@/widgets/handler";
import { getClientIp } from "@/lib/rateLimit";

/**
 * Back-compat alias for existing README embeds (docs/TODOS.md 0.14).
 * Delegates to the same dispatcher as /api/widget/streak.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return handleWidgetRequest("streak", searchParams, getClientIp(request.headers));
}
