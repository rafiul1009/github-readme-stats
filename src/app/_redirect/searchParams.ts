/**
 * Shared by the legacy-route redirect stubs (docs/TODOS.md 12.22). Lives
 * outside a `page.tsx` because Next only permits its own known exports there.
 */
export function buildSearch(
  params: Record<string, string | string[] | undefined>,
  extra?: Record<string, string>
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") search.set(key, value);
    else if (Array.isArray(value) && value[0] !== undefined) search.set(key, value[0]);
  }
  for (const [key, value] of Object.entries(extra ?? {})) search.set(key, value);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
