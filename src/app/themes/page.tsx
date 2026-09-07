import { redirect } from "next/navigation";
import { buildSearch } from "../_redirect/searchParams";

/** `/themes` is now the dashboard's Themes sidebar panel (docs/TODOS.md 12.22). */
export default async function ThemesRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  redirect(`/${buildSearch(await searchParams, { panel: "themes" })}`);
}
