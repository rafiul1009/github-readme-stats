import { WIDGET_CATALOG, getWidgetCatalogEntry } from "@/widgets/catalog";
import { buildQueryString, type FormState, type FormValue } from "./query";
import { emptyProfileConfig, type ProfileConfig } from "./readme/types";

/** Which half of the product the dashboard is showing (docs/TODOS.md 12.6). */
export type Mode = "widget" | "readme";

/**
 * Where a render's data comes from (D11 / task 12.8). `sample` uses the
 * bundled mock data behind `/preview` — instant, no username, no rate-limit
 * cost. `live` hits the real GitHub-backed endpoint.
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
  dataMode: DataMode;
  profile: ProfileConfig;
  /**
   * True when the configuration has changed since the last Generate. This is
   * the whole point of D11: the canvas is allowed to be out of date, and the
   * UI says so rather than silently chasing every keystroke.
   */
  dirty: boolean;
  rendered: RenderedPreview | null;
  /** Bumped by every generate so README mode's widget images refetch too. */
  renderNonce: number;
}

export type DashboardAction =
  | { type: "setMode"; mode: Mode }
  | { type: "setPanel"; panel: Panel }
  | { type: "selectWidget"; widgetType: string }
  | { type: "setField"; name: string; value: FormValue }
  | { type: "setTheme"; theme: string }
  | { type: "clearOptions" }
  | { type: "setDataMode"; dataMode: DataMode }
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
    dataMode: "sample",
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
 * Live mode needs something to look up. Widgets with no identifying field
 * (e.g. quote) are always allowed.
 */
export function canRenderLive(state: DashboardState): boolean {
  const entry = getWidgetCatalogEntry(state.widgetType);
  if (!entry?.identifyingField) return true;
  return identifyingValue(state).trim().length > 0;
}

/** The embeddable URL for the current configuration — no nonce, no /preview. */
export function embedUrl(state: DashboardState, origin: string): string {
  const entry = getWidgetCatalogEntry(state.widgetType) ?? WIDGET_CATALOG[0];
  const qs = buildQueryString(entry.schema, state.form);
  return `${origin}/api/widget/${entry.type}${qs ? `?${qs}` : ""}`;
}

function previewSrc(state: DashboardState, nonce: number): string {
  const entry = getWidgetCatalogEntry(state.widgetType) ?? WIDGET_CATALOG[0];
  const params = new URLSearchParams(buildQueryString(entry.schema, state.form));
  // A nonce so pressing Generate always produces a visible render, even when
  // nothing in the query changed — otherwise the button would silently no-op
  // on a repeat press in live mode, where refetching is the point.
  params.set("_r", String(nonce));
  const base =
    state.dataMode === "sample"
      ? `/api/widget/${entry.type}/preview`
      : `/api/widget/${entry.type}`;
  return `${base}?${params.toString()}`;
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
      // Options are widget-specific (even the identifying field differs), so
      // only the theme — a concept every widget shares — survives a switch.
      const theme = state.form.theme;
      return {
        ...state,
        widgetType: action.widgetType,
        form: theme === undefined ? {} : { theme },
        dirty: true,
      };
    }

    case "setField":
      return { ...state, form: { ...state.form, [action.name]: action.value }, dirty: true };

    case "setTheme": {
      const form: FormState = { ...state.form, theme: action.theme };
      for (const key of COLOR_OVERRIDE_KEYS) delete form[key];
      return { ...state, form, dirty: true, profile: { ...state.profile, theme: action.theme } };
    }

    case "clearOptions":
      return { ...state, form: {}, dirty: true };

    case "setDataMode":
      if (action.dataMode === state.dataMode) return state;
      return { ...state, dataMode: action.dataMode, dirty: true };

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
      return {
        ...state,
        dirty: false,
        renderNonce: nonce,
        rendered: {
          src: previewSrc(state, nonce),
          dataMode: state.dataMode,
          widgetType: state.widgetType,
        },
      };
    }

    default:
      return state;
  }
}
