import { COMMON_OPTIONS, mergeSchemas, type InferOptions } from "@/lib/options";

export const MEDIUM_SCHEMA = mergeSchemas(COMMON_OPTIONS, {
  username: {
    type: "string",
    description: "Medium username (without @). Either this or `publication` is required.",
  },
  publication: {
    type: "string",
    description: "Medium publication slug, as an alternative to `username`.",
  },
  limit: {
    type: "number",
    description: "Number of articles to show.",
    default: 5,
    min: 1,
    max: 10,
  },
  card_width: {
    type: "number",
    description: "Card width, in pixels.",
    default: 400,
    min: 280,
  },
} as const);

export type MediumOptions = InferOptions<typeof MEDIUM_SCHEMA>;
