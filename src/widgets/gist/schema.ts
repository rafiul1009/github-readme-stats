import { COMMON_OPTIONS, mergeSchemas, type InferOptions } from "@/lib/options";

export const GIST_SCHEMA = mergeSchemas(COMMON_OPTIONS, {
  id: {
    type: "string",
    description: "Gist ID to display.",
  },
  show_owner: {
    type: "boolean",
    description: "Shows the gist owner's username in the title.",
    default: false,
  },
  card_width: {
    type: "number",
    description: "Card width, in pixels.",
    default: 400,
    min: 280,
  },
} as const);

export type GistOptions = InferOptions<typeof GIST_SCHEMA>;
