import { COMMON_OPTIONS, mergeSchemas, type InferOptions } from "@/lib/options";

export const HEATMAP_SCHEMA = mergeSchemas(COMMON_OPTIONS, {
  card_width: {
    type: "number",
    description: "Card width, in pixels. Cell size (and so the card's height) is derived from this and `weeks`.",
    default: 720,
    min: 300,
  },
  weeks: {
    type: "number",
    description: "How many Sun-Sat weeks of history to show, ending on the current week.",
    default: 53,
    min: 4,
    max: 260,
  },
  hide_month_labels: {
    type: "boolean",
    description: "Hides the month labels above the grid.",
    default: false,
  },
  hide_weekday_labels: {
    type: "boolean",
    description: "Hides the Mon/Wed/Fri row labels to the left of the grid.",
    default: false,
  },
  hide_legend: {
    type: "boolean",
    description: "Hides the 'Less...More' color scale legend.",
    default: false,
  },
} as const);

export type HeatmapOptions = InferOptions<typeof HEATMAP_SCHEMA>;
