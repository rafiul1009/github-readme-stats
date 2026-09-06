import { COMMON_OPTIONS, mergeSchemas, type InferOptions } from "@/lib/options";

export const WAKATIME_SCHEMA = mergeSchemas(COMMON_OPTIONS, {
  username: {
    type: "string",
    description: "WakaTime (or Wakapi/Hakatime) username. Their profile's coding activity must be set to public.",
    maxLength: 100,
  },
  api_domain: {
    type: "string",
    description: "API domain for self-hosted WakaTime-compatible services (Wakapi, Hakatime). Defaults to wakatime.com.",
    default: "wakatime.com",
    maxLength: 200,
  },
  layout: {
    type: "enum",
    description: "Card layout.",
    values: ["default", "compact"],
    default: "default",
  },
  display_format: {
    type: "enum",
    description: "How each language's amount is shown.",
    values: ["time", "percent"],
    default: "time",
  },
  langs_count: {
    type: "number",
    description: "Number of languages to show.",
    default: 6,
    min: 1,
    max: 15,
  },
  hide_progress: {
    type: "boolean",
    description: "Hides the per-language progress bars.",
    default: false,
  },
  card_width: {
    type: "number",
    description: "Card width, in pixels.",
    default: 350,
    min: 250,
  },
} as const);

export type WakaTimeOptions = InferOptions<typeof WAKATIME_SCHEMA>;
