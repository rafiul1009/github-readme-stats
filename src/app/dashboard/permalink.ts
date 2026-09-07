import { getWidgetCatalogEntry } from "@/widgets/catalog";
import { WIDGET_CATALOG } from "@/widgets/catalog";
import { buildQueryString } from "./query";
import type { DashboardState } from "./state";

/** The marker the old `/build` page wrote, kept so its deep links still work. */
export const WIDGET_QUERY_KEY = "_widget";

/**
 * Mirrors the dashboard's structural state into the page's own query string
 * (docs/TODOS.md 12.12). Written on generate and on mode/widget/panel switches
 * — never per keystroke, which is the whole point of D11.
 */
export function syncPermalink(state: DashboardState): void {
  if (typeof window === "undefined") return;

  const entry = getWidgetCatalogEntry(state.widgetType) ?? WIDGET_CATALOG[0];
  const params = new URLSearchParams(buildQueryString(entry.schema, state.form));
  params.set(WIDGET_QUERY_KEY, entry.type);
  if (state.mode !== "widget") params.set("mode", state.mode);
  if (state.panel !== "themes") params.set("panel", state.panel);

  const url = new URL(window.location.href);
  url.search = params.toString();
  if (url.toString() !== window.location.href) {
    window.history.replaceState(null, "", url.toString());
  }
}

/**
 * Seeds dashboard state from the URL on load, absorbing the old
 * `/build?_widget=…` and `/profile` formats the redirect stubs forward.
 */
export function stateFromSearchParams(search: URLSearchParams): Partial<DashboardState> {
  const widgetType = search.get(WIDGET_QUERY_KEY) ?? undefined;
  const entry = widgetType ? getWidgetCatalogEntry(widgetType) : undefined;
  const schema = entry?.schema ?? WIDGET_CATALOG[0].schema;

  const form: DashboardState["form"] = {};
  for (const [key, def] of Object.entries(schema)) {
    const raw = search.get(key);
    if (raw === null) continue;
    if (def.type === "boolean") form[key] = raw === "true";
    else if (def.type === "commaList") form[key] = raw.split(",").filter(Boolean);
    else if (def.type === "number") {
      if (Number.isFinite(Number(raw))) form[key] = raw;
    } else form[key] = raw;
  }

  const mode = search.get("mode");
  const panel = search.get("panel");
  // A stray legacy `data=` param from a pre-12.43 link is silently ignored —
  // data mode is derived automatically now, not restorable state.

  return {
    ...(entry ? { widgetType: entry.type } : {}),
    form,
    ...(mode === "readme" ? { mode: "readme" as const } : {}),
    ...(panel === "gallery" || panel === "templates" || panel === "themes"
      ? { panel: panel as DashboardState["panel"] }
      : {}),
    // A URL that already carries options describes a configuration nobody has
    // rendered yet, so the canvas starts stale rather than pretending otherwise.
    dirty: Object.keys(form).length > 0,
  };
}
