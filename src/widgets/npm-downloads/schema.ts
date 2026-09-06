import { COMMON_OPTIONS, mergeSchemas, type InferOptions } from "@/lib/options";

export const NPM_DOWNLOADS_SCHEMA = mergeSchemas(COMMON_OPTIONS, {
  package: {
    type: "string",
    description: "npm package name.",
  },
  card_width: {
    type: "number",
    description: "Card width, in pixels.",
    default: 340,
    min: 260,
  },
} as const);

export type NpmDownloadsOptions = InferOptions<typeof NPM_DOWNLOADS_SCHEMA>;
