import type { InferOptions, OptionDef, OptionSchema } from "./schema";

export class OptionValidationError extends Error {
  constructor(
    public readonly optionName: string,
    message: string
  ) {
    super(`Invalid value for "${optionName}": ${message}`);
    this.name = "OptionValidationError";
  }
}

function parseBoolean(raw: string): boolean {
  return raw === "true" || raw === "1";
}

function parseCommaList(raw: string): string[] {
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function parseSingleValue(name: string, def: OptionDef, raw: string): unknown {
  switch (def.type) {
    case "string": {
      if (def.maxLength !== undefined && raw.length > def.maxLength) {
        throw new OptionValidationError(name, `must be at most ${def.maxLength} characters`);
      }
      return raw;
    }
    case "number": {
      const value = Number(raw);
      if (!Number.isFinite(value)) {
        throw new OptionValidationError(name, `"${raw}" is not a number`);
      }
      const min = def.min ?? -Infinity;
      const max = def.max ?? Infinity;
      return Math.min(Math.max(value, min), max);
    }
    case "boolean": {
      return parseBoolean(raw);
    }
    case "enum": {
      if (!(def.values as readonly string[]).includes(raw)) {
        throw new OptionValidationError(
          name,
          `"${raw}" is not one of: ${def.values.join(", ")}`
        );
      }
      return raw;
    }
    case "color": {
      // Left as a raw string here; src/lib/color.ts interprets it at render
      // time so every widget shares one parsing/validation path for colors.
      return raw;
    }
    case "commaList": {
      return parseCommaList(raw);
    }
  }
}

/**
 * Parses and validates a URLSearchParams object against a declarative option
 * schema, applying each option's default when absent. Throws
 * OptionValidationError on the first invalid value.
 */
export function parseOptions<S extends OptionSchema>(
  schema: S,
  searchParams: URLSearchParams
): InferOptions<S> {
  const result: Record<string, unknown> = {};

  for (const [name, def] of Object.entries(schema)) {
    const raw = searchParams.get(name);

    if (raw === null || raw === "") {
      result[name] = def.default;
      continue;
    }

    result[name] = parseSingleValue(name, def, raw);
  }

  return result as InferOptions<S>;
}

/**
 * Builds a normalized, sorted query string from a parsed options object —
 * used as the cache key for rendered output so that param order and
 * incidental formatting never cause cache misses for an equivalent request.
 */
export function normalizeOptionsForCacheKey(options: Record<string, unknown>): string {
  const entries = Object.entries(options)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]): [string, string] => [
      key,
      Array.isArray(value) ? value.join(",") : String(value),
    ])
    .sort(([a], [b]) => a.localeCompare(b));

  return entries.map(([key, value]) => `${key}=${value}`).join("&");
}
