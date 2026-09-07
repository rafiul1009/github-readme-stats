import type { OptionSchema } from "@/lib/options";

export type FormValue = string | boolean | string[] | undefined;
export type FormState = Record<string, FormValue>;

/** The display value for a field: the form's current value, or the schema default if unset. */
export function fieldValue(schema: OptionSchema, form: FormState, key: string): FormValue {
  if (form[key] !== undefined) return form[key];
  return schema[key]?.default as FormValue;
}

function valueToQueryString(value: FormValue): string | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value.length > 0 ? value.join(",") : undefined;
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value === "") return undefined;
  return value;
}

/**
 * Builds a query string from the current form state, omitting any field
 * that's unset or equal to its schema default — keeping generated URLs as
 * short as the streak-stats/grs convention of "only pass what you changed".
 */
export function buildQueryString(schema: OptionSchema, form: FormState): string {
  const params = new URLSearchParams();

  for (const [key, def] of Object.entries(schema)) {
    const raw = form[key];
    if (raw === undefined) continue;

    const asString = valueToQueryString(raw);
    if (asString === undefined) continue;

    const defaultAsString = valueToQueryString(def.default as FormValue);
    if (asString === defaultAsString) continue;

    params.set(key, asString);
  }

  return params.toString();
}
