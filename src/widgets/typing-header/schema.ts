import { COMMON_OPTIONS, mergeSchemas, type InferOptions } from "@/lib/options";

export const TYPING_HEADER_SCHEMA = mergeSchemas(COMMON_OPTIONS, {
  lines: {
    type: "commaList",
    description: "Lines of text to type, in order.",
  },
  font: {
    type: "string",
    description: "Font family for the typed text.",
    default: "Fira Code, Consolas, Monaco, monospace",
    maxLength: 200,
  },
  size: {
    type: "number",
    description: "Font size, in pixels.",
    default: 24,
    min: 10,
    max: 60,
  },
  duration: {
    type: "number",
    description: "Time to type each line, in milliseconds.",
    default: 3000,
    min: 500,
    max: 15000,
  },
  pause: {
    type: "number",
    description: "Pause after a line finishes typing, in milliseconds, before it's erased (rotate mode) or the next line starts (multiline mode).",
    default: 1200,
    min: 0,
    max: 10000,
  },
  multiline: {
    type: "boolean",
    description:
      "Types all lines and keeps them stacked permanently (no erase, no loop). Default rotates through lines one at a time, erasing and looping forever.",
    default: false,
  },
  hide_cursor: {
    type: "boolean",
    description: "Hides the blinking cursor.",
    default: false,
  },
  card_width: {
    type: "number",
    description: "Card width, in pixels.",
    default: 500,
    min: 150,
  },
  card_height: {
    type: "number",
    description: "Card height, in pixels. In multiline mode, grows automatically to fit all lines if this is too small.",
    default: 60,
    min: 30,
  },
} as const);

export type TypingHeaderOptions = InferOptions<typeof TYPING_HEADER_SCHEMA>;
