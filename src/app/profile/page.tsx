import { redirect } from "next/navigation";
import { buildSearch } from "../_redirect/searchParams";

/** `/profile` is now the dashboard's README mode (docs/TODOS.md 12.22). */
export default async function ProfileRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  redirect(`/${buildSearch(await searchParams, { mode: "readme" })}`);
}
