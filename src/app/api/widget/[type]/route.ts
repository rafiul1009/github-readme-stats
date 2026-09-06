import { NextRequest } from "next/server";
import "@/widgets"; // registers all widgets
import { handleWidgetRequest } from "@/widgets/handler";
import { getClientIp } from "@/lib/rateLimit";

export async function GET(request: NextRequest, context: { params: Promise<{ type: string }> }) {
  const { type } = await context.params;
  const { searchParams } = new URL(request.url);
  return handleWidgetRequest(type, searchParams, getClientIp(request.headers));
}
