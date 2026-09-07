import { redirect } from "next/navigation";
import { buildSearch } from "../_redirect/searchParams";

/**
 * `/build` was the standalone widget builder; it is now a mode inside the
 * dashboard at `/` (docs/TODOS.md 12.22). The whole query string carries over
 * unchanged — the dashboard reads the same `_widget=` marker and option params
 * the old builder wrote, so existing deep links land pre-configured.
 */
export default async function BuildRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  redirect(`/${buildSearch(await searchParams)}`);
}
