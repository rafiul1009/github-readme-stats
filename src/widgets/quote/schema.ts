import { COMMON_OPTIONS, mergeSchemas, type InferOptions } from "@/lib/options";

export const QUOTE_SCHEMA = mergeSchemas(COMMON_OPTIONS, {
  category: {
    type: "enum",
    description: "Quote category. Omit (or 'random') to pick from all categories.",
    values: ["random", "programming", "motivational", "humor"],
    default: "random",
  },
  card_width: {
    type: "number",
    description: "Card width, in pixels.",
    default: 480,
    min: 300,
  },
} as const);

export type QuoteOptions = InferOptions<typeof QUOTE_SCHEMA>;
