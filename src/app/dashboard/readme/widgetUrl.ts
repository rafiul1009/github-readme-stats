import { getWidgetCatalogEntry } from "@/widgets/catalog";
import { buildQueryString, type FormState } from "../query";
import type { WidgetInstance } from "./types";

/**
 * A widget's own identifying value if set, otherwise the profile's shared
 * username as a fallback for username-identified widgets (repo/gist widgets
 * have no sensible fallback and must be filled in individually). Widgets
 * with no `identifyingField` at all (e.g. quote) have nothing to fill in.
 */
export function effectiveIdentifyingValue(instance: WidgetInstance, profileUsername: string): string {
  if (instance.identifyingValue.trim()) return instance.identifyingValue.trim();
  const entry = getWidgetCatalogEntry(instance.type);
  return entry?.identifyingField === "username" ? profileUsername.trim() : "";
}

/**
 * Builds the final `/api/widget/<type>` embed URL for a profile widget
 * instance, forcing the profile's shared theme (task 4.3) regardless of any
 * per-widget theme value that might otherwise be present in `options`.
 */
export function widgetImageUrl(
  origin: string,
  instance: WidgetInstance,
  sharedTheme: string,
  profileUsername: string
): string | undefined {
  const entry = getWidgetCatalogEntry(instance.type);
  if (!entry) return undefined;

  const identifyingValue = effectiveIdentifyingValue(instance, profileUsername);
  if (entry.identifyingField && !identifyingValue) return undefined;

  const form: FormState = {
    ...instance.options,
    ...(entry.identifyingField ? { [entry.identifyingField]: identifyingValue } : {}),
    theme: sharedTheme,
  };
  const qs = buildQueryString(entry.schema, form);
  return `${origin}/api/widget/${entry.type}${qs ? `?${qs}` : ""}`;
}

export function widgetPreviewUrl(instance: WidgetInstance, sharedTheme: string): string {
  const entry = getWidgetCatalogEntry(instance.type);
  if (!entry) return "";

  const form: FormState = { ...instance.options, theme: sharedTheme };
  const qs = buildQueryString(entry.schema, form);
  return `/api/widget/${entry.type}/preview${qs ? `?${qs}` : ""}`;
}
