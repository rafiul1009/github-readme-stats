/**
 * Theme slot model (docs/PLAN.md §7 D4).
 *
 * Every theme MUST define the 8 core slots below. Widgets may additionally
 * reference "extension" slots (e.g. a streak card's "ring"/"fire" colors) that
 * a theme MAY override — and if it doesn't, the slot falls back to a mapped
 * core slot via EXTENSION_FALLBACKS. This is what makes N themes usable
 * across M widgets without every theme having to define every widget's colors.
 */

export interface CoreThemeSlots {
  background: string;
  border: string;
  title: string;
  text: string;
  icon: string;
  accent: string;
  stroke: string;
  muted: string;
}

export const CORE_SLOT_NAMES = [
  "background",
  "border",
  "title",
  "text",
  "icon",
  "accent",
  "stroke",
  "muted",
] as const;

export type CoreSlotName = (typeof CORE_SLOT_NAMES)[number];

/**
 * Maps a widget-specific extension slot to the core slot it falls back to
 * when a theme does not explicitly define it. Extend this as new widgets
 * introduce new extension slots — every extension slot must have an entry
 * here or slot resolution will throw.
 */
export const EXTENSION_FALLBACKS: Record<string, CoreSlotName> = {
  // Streak card
  ring: "accent",
  fire: "accent",
  currStreakNum: "accent",
  sideNums: "title",
  currStreakLabel: "muted",
  sideLabels: "muted",
  dates: "text",
  excludeDaysLabel: "muted",
  divider: "stroke",
  // Stats card
  rankCircle: "accent",
  rankText: "title",
  // Top languages card
  langBar: "accent",
  langBarTrack: "border",
  // Trophy card
  trophyFrame: "border",
  trophyProgress: "accent",
  trophySecret: "muted",
};

export interface ThemeDefinition {
  /** Unique, URL-safe theme identifier, e.g. "dracula", "tokyonight". */
  name: string;
  /** Human-readable label for the theme picker UI. */
  label: string;
  /** Whether this theme is intended for a dark or light surrounding page (drives `<picture>` pairing). */
  mode: "light" | "dark";
  core: CoreThemeSlots;
  /** Optional per-slot overrides for widget-specific extension slots. */
  extensions?: Partial<Record<string, string>>;
}

/**
 * Resolves a single slot's color for a theme, applying the extension
 * fallback chain. `slotName` may be a core slot name or a registered
 * extension slot name.
 */
export function resolveThemeSlot(theme: ThemeDefinition, slotName: string): string {
  if ((CORE_SLOT_NAMES as readonly string[]).includes(slotName)) {
    return theme.core[slotName as CoreSlotName];
  }

  const explicit = theme.extensions?.[slotName];
  if (explicit) return explicit;

  const fallback = EXTENSION_FALLBACKS[slotName];
  if (!fallback) {
    throw new Error(
      `Unknown theme slot "${slotName}" — add it to EXTENSION_FALLBACKS in src/lib/themes/slots.ts`
    );
  }
  return theme.core[fallback];
}

/**
 * Resolves every slot a widget needs at once, given a theme and any
 * query-string overrides (already-parsed color strings keyed by slot name).
 * Overrides always win over both the theme's extension slot and its core
 * fallback.
 */
export function resolveThemeSlots<TSlots extends string>(
  theme: ThemeDefinition,
  slotNames: readonly TSlots[],
  overrides: Partial<Record<TSlots, string>> = {}
): Record<TSlots, string> {
  const result = {} as Record<TSlots, string>;
  for (const slot of slotNames) {
    result[slot] = overrides[slot] ?? resolveThemeSlot(theme, slot);
  }
  return result;
}
