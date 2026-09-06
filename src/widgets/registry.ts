import type { InferOptions, OptionSchema } from "@/lib/options";

export interface WidgetDefinition<S extends OptionSchema = OptionSchema, TData = unknown, TRaw = unknown> {
  type: string;
  schema: S;
  /** Default Cache-Control max-age, in seconds, unless overridden by the cache_seconds option. */
  cacheSecondsDefault: number;
  /**
   * Fetches upstream data. Cached under `${type}:${username}[:suffix]` — see
   * `dataCacheKeySuffix` below. Any option NOT reflected in that key must
   * have no effect on what this function fetches, or requests differing
   * only in that option will incorrectly receive each other's cached
   * result (this exact bug hit the streak widget's mode/exclude_days/
   * timezone/starting_year options during Phase 1 — they were fixed by
   * moving them out of fetchRawData into computeData instead, which is
   * the preferred fix whenever the option only changes *derivation*, not
   * *what's fetched*).
   */
  fetchRawData: (options: InferOptions<S>) => Promise<TRaw>;
  /**
   * Extends the data cache key beyond `${type}:${username}` for widgets
   * where some option genuinely changes what fetchRawData requests from
   * GitHub (e.g. the stats widget's include_all_commits, which triggers an
   * extra, more expensive query). Most widgets don't need this — prefer
   * keeping options out of fetchRawData entirely (via computeData) when
   * possible, and reach for this only when the option truly changes the
   * upstream request itself.
   */
  dataCacheKeySuffix?: (options: InferOptions<S>) => string;
  /** Cheap, pure derivation from raw data + the full option set. Never cached — recomputed on every request. */
  computeData: (raw: TRaw, options: InferOptions<S>) => TData;
  renderSvg: (data: TData, options: InferOptions<S>) => string;
  toJson: (data: TData, options: InferOptions<S>) => unknown;
  /**
   * Synchronous sample data for the builder's live preview — no GitHub API
   * call, no username required. Widgets without one can't be previewed
   * without live data (the preview route reports this rather than erroring
   * confusingly on a missing username).
   */
  mockRawData?: (options: InferOptions<S>) => TRaw;
  /**
   * Set to `false` for widgets not keyed by a GitHub username (e.g. the pin
   * card, keyed by `repo`, or the gist card, keyed by `id`). Defaults to
   * `true`. When `false`, the widget MUST also provide `dataCacheKeyBase`.
   */
  requiresUsername?: boolean;
  /**
   * The primary data-cache-key subject. Defaults to `options.username`.
   * Override for widgets keyed by something else — e.g. the pin card
   * returns `options.repo` so `owner/repo` becomes the cache subject
   * instead of an (absent) username.
   */
  dataCacheKeyBase?: (options: InferOptions<S>) => string | undefined;
  /**
   * Set to `false` for widgets whose `fetchRawData` never calls the GitHub
   * API at all (tech-icons, typing-header, quote — pure functions of their
   * own options). Defaults to `true`, since most widgets do. A self-hosted
   * deployment that only wants these GitHub-independent companion widgets
   * shouldn't be forced to configure a `GITHUB_TOKEN` it will never use.
   */
  requiresGithubToken?: boolean;
}

/**
 * Type-erased shape used internally by the registry and the generic
 * dispatcher, once a widget's specific option/data types have already been
 * checked once at `registerWidget` call sites and no longer need tracking.
 */
interface ErasedWidgetDefinition {
  type: string;
  schema: OptionSchema;
  cacheSecondsDefault: number;
  fetchRawData: (options: Record<string, unknown>) => Promise<unknown>;
  dataCacheKeySuffix?: (options: Record<string, unknown>) => string;
  computeData: (raw: unknown, options: Record<string, unknown>) => unknown;
  renderSvg: (data: unknown, options: Record<string, unknown>) => string;
  toJson: (data: unknown, options: Record<string, unknown>) => unknown;
  mockRawData?: (options: Record<string, unknown>) => unknown;
  requiresUsername?: boolean;
  dataCacheKeyBase?: (options: Record<string, unknown>) => string | undefined;
  requiresGithubToken?: boolean;
}

const registry = new Map<string, ErasedWidgetDefinition>();

export function registerWidget<S extends OptionSchema, TData, TRaw>(
  widget: WidgetDefinition<S, TData, TRaw>
): void {
  registry.set(widget.type, widget as unknown as ErasedWidgetDefinition);
}

export function getWidget(type: string): ErasedWidgetDefinition | undefined {
  return registry.get(type);
}

export function listWidgetTypes(): string[] {
  return Array.from(registry.keys());
}
