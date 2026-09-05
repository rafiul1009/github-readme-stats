import { COMMON_OPTIONS, mergeSchemas, type InferOptions } from "@/lib/options";

export const PIN_SCHEMA = mergeSchemas(COMMON_OPTIONS, {
  repo: {
    type: "string",
    description: 'Repository to pin, as "owner/name".',
  },
  show_owner: {
    type: "boolean",
    description: "Shows the repo owner's username in the title.",
    default: false,
  },
  description_lines_count: {
    type: "number",
    description: "Number of lines reserved for the description (1-3). Auto-sized to content if omitted.",
    min: 1,
    max: 3,
  },
  card_width: {
    type: "number",
    description: "Card width, in pixels.",
    default: 400,
    min: 280,
  },
} as const);

export type PinOptions = InferOptions<typeof PIN_SCHEMA>;
