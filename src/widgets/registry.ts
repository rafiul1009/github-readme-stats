import type { InferOptions, OptionSchema } from "@/lib/options";

export interface WidgetDefinition<S extends OptionSchema = OptionSchema, TData = unknown, TRaw = unknown> {
  type: string;
  schema: S;
  /** Default Cache-Control max-age, in seconds, unless overridden by the cache_seconds option. */
  cacheSecondsDefault: number;
  /**
   * Fetches upstream data. Cached under `${type}:${username}` — this MUST
   * NOT vary with any option other than username, or requests differing
   * only in another option will incorrectly receive a stale cached result.
   * Any option that changes what's fetched from GitHub (not just how it's
   * displayed/derived) needs its own cache-key strategy — not yet needed by
   * any registered widget (tracked for repo/owner/role scoping in
   * docs/TODOS.md Phase 10.3).
   */
  fetchRawData: (options: InferOptions<S>) => Promise<TRaw>;
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
  computeData: (raw: unknown, options: Record<string, unknown>) => unknown;
  renderSvg: (data: unknown, options: Record<string, unknown>) => string;
  toJson: (data: unknown, options: Record<string, unknown>) => unknown;
  mockRawData?: (options: Record<string, unknown>) => unknown;
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
