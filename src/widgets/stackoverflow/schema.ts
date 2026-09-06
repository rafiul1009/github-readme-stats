import { COMMON_OPTIONS, mergeSchemas, type InferOptions } from "@/lib/options";

export const STACKOVERFLOW_SCHEMA = mergeSchemas(COMMON_OPTIONS, {
  user_id: {
    type: "string",
    description: "Stack Overflow numeric user id (from your profile URL: stackoverflow.com/users/<id>/...).",
  },
  card_width: {
    type: "number",
    description: "Card width, in pixels.",
    default: 380,
    min: 280,
  },
} as const);

export type StackOverflowOptions = InferOptions<typeof STACKOVERFLOW_SCHEMA>;
