import { WIDGET_CATALOG, getWidgetCatalogEntry } from "@/widgets/catalog";
import { buildQueryString, type FormState, type FormValue } from "./query";
import { emptyProfileConfig, type ProfileConfig } from "./readme/types";

/** Which half of the product the dashboard is showing (docs/TODOS.md 12.6). */
export type Mode = "widget" | "readme";

/**
 * Where a render's data came from. There is no user-facing toggle for this
 * (docs/TODOS.md 12.43, superseding 12.8's Sample/Live switch) — it is
 * derived automatically from whether the widget's identifying field
 * (username/repo/gist id/...) is filled: filled -> the real GitHub-backed
 * endpoint; empty -> the bundled mock-data `/preview` endpoint. One button
 * (Generate), one rule, no mode to remember to flip.
 */
export type DataMode = "sample" | "live";

/** The right sidebar's active tab. `templates` only exists in README mode. */
export type Panel = "themes" | "gallery" | "templates";

export interface RenderedPreview {
  /** The URL the <img> is actually pointed at, including the render nonce. */
  src: string;
  dataMode: DataMode;
  widgetType: string;
}

export interface DashboardState {
  mode: Mode;
  panel: Panel;
  widgetType: string;
  form: FormState;
  profile: ProfileConfig;
  /**
   * True when the configuration has changed since the last render. This is
   * the whole point of D11: the canvas is allowed to be out of date, and the
   * UI says so rather than silently chasing every keystroke.
   */
  dirty: boolean;
  rendered: RenderedPreview | null;
  /** Bumped by every render so README mode's widget images refetch too. */
  renderNonce: number;
}

export type DashboardAction =
  | { type: "setMode"; mode: Mode }
  | { type: "setPanel"; panel: Panel }
  | { type: "selectWidget"; widgetType: string }
  | { type: "setField"; name: string; value: FormValue }
  | { type: "setTheme"; theme: string }
  | { type: "clearOptions" }
  | { type: "loadExample"; widgetType: string; params: Record<string, string> }
  | { type: "setProfile"; profile: ProfileConfig }
  | { type: "generate" };

/**
 * Colour overrides are relative to a theme, so picking a new theme has to
 * drop them — otherwise the new theme appears not to apply.
 */
const COLOR_OVERRIDE_KEYS = ["bg_color", "title_color", "text_color", "icon_color", "border_color"];

export const DEFAULT_WIDGET = WIDGET_CATALOG[0].type;

export function initialState(): DashboardState {
  return {
    mode: "widget",
    panel: "themes",
    widgetType: DEFAULT_WIDGET,
    form: {},
    profile: emptyProfileConfig(),
    dirty: false,
    rendered: null,
    renderNonce: 0,
  };
}

/** The value of the widget's identifying field (username / repo / gist id), if it has one. */
export function identifyingValue(state: DashboardState): string {
  const entry = getWidgetCatalogEntry(state.widgetType);
  if (!entry?.identifyingField) return "";
  const raw = state.form[entry.identifyingField];
  return typeof raw === "string" ? raw : "";
}

/**
 * The data source a render would use right now: `live` once the identifying
 * field is filled in, `sample` otherwise. A widget with no identifying field
 * at all (e.g. quote) has nothing to wait on, so it always renders live.
 */
export function resolveDataMode(state: DashboardState): DataMode {
  const entry = getWidgetCatalogEntry(state.widgetType);
  if (!entry?.identifyingField) return "live";
  return identifyingValue(state).trim().length > 0 ? "live" : "sample";
}

/** The embeddable URL for the current configuration — no nonce, no /preview. */
export function embedUrl(state: DashboardState, origin: string): string {
  const entry = getWidgetCatalogEntry(state.widgetType) ?? WIDGET_CATALOG[0];
  const qs = buildQueryString(entry.schema, state.form);
  return `${origin}/api/widget/${entry.type}${qs ? `?${qs}` : ""}`;
}

function renderNow(state: DashboardState, nonce: number): RenderedPreview {
  const entry = getWidgetCatalogEntry(state.widgetType) ?? WIDGET_CATALOG[0];
  const dataMode = resolveDataMode(state);
  const params = new URLSearchParams(buildQueryString(entry.schema, state.form));
  // A nonce so a repeat Generate always produces a visible change, even when
  // nothing in the query changed — otherwise the button would silently no-op
  // on a repeat press in live mode, where refetching is the point.
  params.set("_r", String(nonce));
  const base = dataMode === "sample" ? `/api/widget/${entry.type}/preview` : `/api/widget/${entry.type}`;
  return { src: `${base}?${params.toString()}`, dataMode, widgetType: entry.type };
}

/**
 * Applies `patch`, then renders immediately instead of just marking the
 * canvas dirty — for changes that are navigation/presentation, not a data
 * edit (docs/TODOS.md 12.50): picking a different widget, or picking a
 * different theme. A theme swap re-requests the same identifying value under
 * a new `theme=`, which is a raw-data cache *hit* server-side (the ~30 min
 * `githubDataCache` is keyed by widget type + username, not by theme) — so
 * this never re-hits the GitHub API on its own, only re-renders already-
 * fetched data with a different palette, which is cheap enough to not make
 * the user ask for it explicitly. Genuine data edits (typing into an option,
 * clearing the form) still just set `dirty` and wait for Generate.
 */
function renderImmediately(state: DashboardState, patch: Partial<DashboardState>): DashboardState {
  const next: DashboardState = { ...state, ...patch };
  const nonce = state.renderNonce + 1;
  return { ...next, dirty: false, renderNonce: nonce, rendered: renderNow(next, nonce) };
}

export function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case "setMode":
      return {
        ...state,
        mode: action.mode,
        // `templates` is README-only; fall back rather than showing an empty tab.
        panel: action.mode === "widget" && state.panel === "templates" ? "themes" : state.panel,
      };

    case "setPanel":
      return { ...state, panel: action.panel };

    case "selectWidget": {
      if (action.widgetType === state.widgetType) return state;
      const prevEntry = getWidgetCatalogEntry(state.widgetType);
      const nextEntry = getWidgetCatalogEntry(action.widgetType);

      // Options are widget-specific (even the identifying field differs), so
      // only two things survive a switch: the theme, and the identifying
      // value when both widgets identify by the same field name (almost
      // always "username" — 14 of 22 widgets). That is what lets picking a
      // new widget immediately show *your* data instead of resetting to a
      // blank form (docs/TODOS.md 12.44).
      const form: FormState = {};
      if (state.form.theme !== undefined) form.theme = state.form.theme;
      if (
        nextEntry?.identifyingField &&
        nextEntry.identifyingField === prevEntry?.identifyingField &&
        state.form[nextEntry.identifyingField] !== undefined
      ) {
        form[nextEntry.identifyingField] = state.form[nextEntry.identifyingField];
      }

      // Auto-render immediately on switch: live if the carried-over
      // identifying value survived, sample otherwise — never leaves the
      // canvas showing the *previous* widget's card under the new widget's
      // selected name in the sidebar.
      return renderImmediately(state, { widgetType: action.widgetType, form });
    }

    case "setField":
      return { ...state, form: { ...state.form, [action.name]: action.value }, dirty: true };

    case "setTheme": {
      const form: FormState = { ...state.form, theme: action.theme };
      for (const key of COLOR_OVERRIDE_KEYS) delete form[key];
      // Auto-render immediately (docs/TODOS.md 12.50): a theme is a palette,
      // not a data change, so it should not need a manual Generate — see
      // renderImmediately's comment for why this can't turn into unwanted
      // GitHub API traffic.
      return renderImmediately(state, { form, profile: { ...state.profile, theme: action.theme } });
    }

    case "clearOptions":
      return { ...state, form: {}, dirty: true };

    case "loadExample": {
      const form: FormState = {};
      const schema = getWidgetCatalogEntry(action.widgetType)?.schema ?? {};
      for (const [key, raw] of Object.entries(action.params)) {
        const def = schema[key];
        if (!def) continue;
        if (def.type === "boolean") form[key] = raw === "true";
        else if (def.type === "commaList") form[key] = raw.split(",").filter(Boolean);
        else form[key] = raw;
      }
      return { ...state, widgetType: action.widgetType, form, dirty: true };
    }

    case "setProfile":
      return { ...state, profile: action.profile, dirty: true };

    case "generate": {
      const nonce = state.renderNonce + 1;
      return { ...state, dirty: false, renderNonce: nonce, rendered: renderNow(state, nonce) };
    }

    default:
      return state;
  }
}
