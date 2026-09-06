import { COMMON_OPTIONS, mergeSchemas, type InferOptions } from "@/lib/options";

export const SKYLINE_SCHEMA = mergeSchemas(COMMON_OPTIONS, {
  card_width: {
    type: "number",
    description: "Card width, in pixels. Tile size (and so the card's height) is derived from this and `weeks`.",
    default: 720,
    min: 300,
  },
  weeks: {
    type: "number",
    description: "How many Sun-Sat weeks of history to show, ending on the current week.",
    default: 26,
    min: 4,
    max: 104,
  },
} as const);

export type SkylineOptions = InferOptions<typeof SKYLINE_SCHEMA>;
