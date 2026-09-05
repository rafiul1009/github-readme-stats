/**
 * Declarative option schema (docs/PLAN.md §6 — "the keystone of the whole
 * design"). Each widget declares its options once, as data; that single
 * declaration drives request parsing/validation, and can drive UI form
 * generation and docs tables later without being redefined per surface.
 */

export interface StringOptionDef {
  type: "string";
  description: string;
  default?: string;
  maxLength?: number;
}

export interface NumberOptionDef {
  type: "number";
  description: string;
  default?: number;
  min?: number;
  max?: number;
}

export interface BooleanOptionDef {
  type: "boolean";
  description: string;
  default?: boolean;
}

export interface EnumOptionDef<T extends string = string> {
  type: "enum";
  description: string;
  values: readonly T[];
  default?: T;
}

/** A color value: solid hex/CSS-name, or "angle,c1,c2[,...]" gradient. See src/lib/color.ts. */
export interface ColorOptionDef {
  type: "color";
  description: string;
  default?: string;
}

/** Comma-separated list, e.g. `hide=stars,commits`. */
export interface CommaListOptionDef {
  type: "commaList";
  description: string;
  default?: string[];
}

export type OptionDef =
  | StringOptionDef
  | NumberOptionDef
  | BooleanOptionDef
  | EnumOptionDef<string>
  | ColorOptionDef
  | CommaListOptionDef;

export type OptionSchema = Record<string, OptionDef>;

type InferOption<D> = D extends StringOptionDef
  ? string
  : D extends NumberOptionDef
    ? number
    : D extends BooleanOptionDef
      ? boolean
      : D extends EnumOptionDef<infer T>
        ? T
        : D extends ColorOptionDef
          ? string | undefined
          : D extends CommaListOptionDef
            ? string[]
            : never;

/** Infers the parsed options object type for a given schema. */
export type InferOptions<S extends OptionSchema> = {
  [K in keyof S]: InferOption<S[K]>;
};

/**
 * Merges a widget-specific schema with the shared common schema, with the
 * widget's own definitions winning on key collisions (a widget may want a
 * different default for a common option).
 */
export function mergeSchemas<A extends OptionSchema, B extends OptionSchema>(
  common: A,
  widget: B
): A & B {
  return { ...common, ...widget };
}
