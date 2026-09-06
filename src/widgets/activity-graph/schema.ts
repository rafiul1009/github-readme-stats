import { COMMON_OPTIONS, mergeSchemas, type InferOptions } from "@/lib/options";

export const ACTIVITY_GRAPH_STYLES = ["line", "area", "bar"] as const;
export const ACTIVITY_GRAPH_GRANULARITIES = ["auto", "day", "week", "month"] as const;

export const ACTIVITY_GRAPH_SCHEMA = mergeSchemas(COMMON_OPTIONS, {
  card_width: {
    type: "number",
    description: "Card width, in pixels.",
    default: 720,
    min: 300,
  },
  card_height: {
    type: "number",
    description: "Card height, in pixels.",
    default: 280,
    min: 150,
  },
  days: {
    type: "number",
    description: "How many past days of contribution history to plot.",
    default: 365,
    min: 14,
    max: 3650,
  },
  granularity: {
    type: "enum",
    description: "Bucket size for each point. 'auto' picks daily/weekly/monthly based on `days`.",
    values: ACTIVITY_GRAPH_GRANULARITIES,
    default: "auto",
  },
  graph_style: {
    type: "enum",
    description: "Chart style.",
    values: ACTIVITY_GRAPH_STYLES,
    default: "area",
  },
  show_points: {
    type: "boolean",
    description: "Draws a marker at each data point (line/area styles only).",
    default: false,
  },
  hide_grid: {
    type: "boolean",
    description: "Hides the horizontal gridlines and their value labels.",
    default: false,
  },
} as const);

export type ActivityGraphOptions = InferOptions<typeof ACTIVITY_GRAPH_SCHEMA>;
