import { COMMON_OPTIONS, mergeSchemas, type InferOptions } from "@/lib/options";

export const WEEKDAY_ABBREVIATIONS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/**
 * Client-safe: contains only plain data (no server-only imports like
 * @/lib/github), so the builder UI can import this directly without
 * pulling the streak widget's server registration code into the browser
 * bundle.
 */
export const STREAK_SCHEMA = mergeSchemas(COMMON_OPTIONS, {
  font: {
    type: "string",
    description: "Font family used in the card text.",
    default: "Inter",
  },
  mode: {
    type: "enum",
    description: "'daily' requires a contribution every day; 'weekly' requires at least one per Sun-Sat week.",
    values: ["daily", "weekly"],
    default: "daily",
  },
  exclude_days: {
    type: "commaList",
    description: `Weekday abbreviations (${WEEKDAY_ABBREVIATIONS.join(",")}) that neither break nor count toward the streak.`,
  },
  timezone: {
    type: "string",
    description: "IANA timezone used to determine the current day (e.g. Asia/Kolkata). Defaults to UTC.",
  },
  starting_year: {
    type: "number",
    description: "Only consider contributions from this year onward.",
    min: 2005,
  },
  hide_total_contributions: {
    type: "boolean",
    description: "Hides the total contributions column.",
    default: false,
  },
  hide_current_streak: {
    type: "boolean",
    description: "Hides the current streak column.",
    default: false,
  },
  hide_longest_streak: {
    type: "boolean",
    description: "Hides the longest streak column.",
    default: false,
  },
  card_width: {
    type: "number",
    description: "Card width, in pixels.",
    default: 495,
    min: 300,
  },
  card_height: {
    type: "number",
    description: "Card height, in pixels.",
    default: 195,
    min: 170,
  },
} as const);

export type StreakOptions = InferOptions<typeof STREAK_SCHEMA>;
