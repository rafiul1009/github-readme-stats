import { COMMON_OPTIONS, mergeSchemas, type InferOptions } from "@/lib/options";

export const MOST_COMMIT_LANGUAGE_SCHEMA = mergeSchemas(COMMON_OPTIONS, {
  langs_count: {
    type: "number",
    description: "Number of languages to show.",
    default: 6,
    min: 1,
    max: 20,
  },
  hide: {
    type: "commaList",
    description: "Language names to exclude.",
  },
  card_width: {
    type: "number",
    description: "Card width, in pixels.",
    default: 320,
    min: 250,
  },
} as const);

export type MostCommitLanguageOptions = InferOptions<typeof MOST_COMMIT_LANGUAGE_SCHEMA>;
