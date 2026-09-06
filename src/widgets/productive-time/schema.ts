import { COMMON_OPTIONS, mergeSchemas, type InferOptions } from "@/lib/options";

export const PRODUCTIVE_TIME_SCHEMA = mergeSchemas(COMMON_OPTIONS, {
  timezone: {
    type: "string",
    description: "IANA timezone the hour-of-day histogram is bucketed in (e.g. Asia/Kolkata). Defaults to UTC.",
  },
  hide_hour_of_day: {
    type: "boolean",
    description: "Hides the hour-of-day histogram.",
    default: false,
  },
  hide_day_of_week: {
    type: "boolean",
    description: "Hides the day-of-week histogram.",
    default: false,
  },
  card_width: {
    type: "number",
    description: "Card width, in pixels.",
    default: 480,
    min: 320,
  },
} as const);

export type ProductiveTimeOptions = InferOptions<typeof PRODUCTIVE_TIME_SCHEMA>;
