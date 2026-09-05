import type { InferOptions, OptionSchema } from "@/lib/options";

export interface WidgetDefinition<S extends OptionSchema = OptionSchema, TData = unknown> {
  type: string;
  schema: S;
  /** Default Cache-Control max-age, in seconds, unless overridden by the cache_seconds option. */
  cacheSecondsDefault: number;
  fetchData: (options: InferOptions<S>) => Promise<TData>;
  renderSvg: (data: TData, options: InferOptions<S>) => string;
  toJson: (data: TData, options: InferOptions<S>) => unknown;
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
  fetchData: (options: Record<string, unknown>) => Promise<unknown>;
  renderSvg: (data: unknown, options: Record<string, unknown>) => string;
  toJson: (data: unknown, options: Record<string, unknown>) => unknown;
}

const registry = new Map<string, ErasedWidgetDefinition>();

export function registerWidget<S extends OptionSchema, TData>(
  widget: WidgetDefinition<S, TData>
): void {
  registry.set(widget.type, widget as unknown as ErasedWidgetDefinition);
}

export function getWidget(type: string): ErasedWidgetDefinition | undefined {
  return registry.get(type);
}

export function listWidgetTypes(): string[] {
  return Array.from(registry.keys());
}
