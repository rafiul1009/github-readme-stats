import { redirect } from "next/navigation";
import { buildSearch } from "../_redirect/searchParams";

/** `/gallery` is now the dashboard's Gallery sidebar panel (docs/TODOS.md 12.22). */
export default async function GalleryRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  redirect(`/${buildSearch(await searchParams, { panel: "gallery" })}`);
}
