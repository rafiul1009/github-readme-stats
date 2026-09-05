import { DEFAULT_THEME_NAME } from "@/lib/themes";
import type { OptionSchema } from "./schema";

/**
 * Options every widget accepts (docs/PLAN.md §4 "Universal options"). Widget
 * schemas are built with `mergeSchemas(COMMON_OPTIONS, { ...widget-specific })`.
 */
export const COMMON_OPTIONS = {
  username: {
    type: "string",
    description: "GitHub username to fetch data for.",
    maxLength: 39,
  },
  theme: {
    type: "string",
    description: "Name of a preset theme to apply.",
    default: DEFAULT_THEME_NAME,
  },
  bg_color: {
    type: "color",
    description: "Card background color: hex, CSS name, or an 'angle,c1,c2,...' gradient.",
  },
  title_color: {
    type: "color",
    description: "Card title text color.",
  },
  text_color: {
    type: "color",
    description: "Body text color.",
  },
  icon_color: {
    type: "color",
    description: "Icon color, where icons are shown.",
  },
  border_color: {
    type: "color",
    description: "Card border color. No effect when hide_border is set.",
  },
  border_radius: {
    type: "number",
    description: "Corner rounding of the card, in pixels.",
    default: 4.5,
    min: 0,
    max: 248,
  },
  border_width: {
    type: "number",
    description: "Border stroke width, in pixels.",
    default: 1,
    min: 0,
    max: 10,
  },
  hide_border: {
    type: "boolean",
    description: "Hides the card border.",
    default: false,
  },
  hide_title: {
    type: "boolean",
    description: "Hides the card's title.",
    default: false,
  },
  custom_title: {
    type: "string",
    description: "Overrides the card's default title. Supports {name}/{username} tokens.",
    maxLength: 100,
  },
  card_width: {
    type: "number",
    description: "Card width, in pixels.",
    min: 100,
  },
  card_height: {
    type: "number",
    description: "Card height, in pixels.",
    min: 100,
  },
  disable_animations: {
    type: "boolean",
    description: "Disables all SVG animations on the card.",
    default: false,
  },
  locale: {
    type: "string",
    description: "Locale for labels, dates and numbers.",
    default: "en",
  },
  number_format: {
    type: "enum",
    description: "Number display format.",
    values: ["short", "long"],
    default: "short",
  },
  cache_seconds: {
    type: "number",
    description: "Overrides the response Cache-Control max-age, in seconds.",
    min: 21600,
    max: 86400,
  },
  format: {
    type: "enum",
    description: "Output format.",
    values: ["svg", "json"],
    default: "svg",
  },
} as const satisfies OptionSchema;
