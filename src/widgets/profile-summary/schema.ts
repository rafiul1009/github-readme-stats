import { COMMON_OPTIONS, mergeSchemas, type InferOptions } from "@/lib/options";

export const PROFILE_SUMMARY_SCHEMA = mergeSchemas(COMMON_OPTIONS, {
  photo_quality: {
    type: "enum",
    description: "Source resolution requested for the avatar before it's embedded (higher looks better when photo_resize is large).",
    values: ["low", "medium", "high"],
    default: "medium",
  },
  photo_resize: {
    type: "number",
    description: "Rendered avatar diameter, in pixels.",
    default: 76,
    min: 30,
    max: 200,
  },
  revert: {
    type: "boolean",
    description: "Flips the layout — avatar on the right, text on the left.",
    default: false,
  },
  card_width: {
    type: "number",
    description: "Card width, in pixels.",
    default: 480,
    min: 320,
  },
} as const);

export type ProfileSummaryOptions = InferOptions<typeof PROFILE_SUMMARY_SCHEMA>;
