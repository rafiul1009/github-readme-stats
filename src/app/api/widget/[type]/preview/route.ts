import { NextRequest } from "next/server";
import "@/widgets"; // registers all widgets
import { handlePreviewRequest } from "@/widgets/handler";

export async function GET(request: NextRequest, context: { params: Promise<{ type: string }> }) {
  const { type } = await context.params;
  const { searchParams } = new URL(request.url);
  return handlePreviewRequest(type, searchParams);
}
