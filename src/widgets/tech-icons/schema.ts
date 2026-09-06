import { COMMON_OPTIONS, mergeSchemas, type InferOptions } from "@/lib/options";

export const TECH_ICONS_SCHEMA = mergeSchemas(COMMON_OPTIONS, {
  name: {
    type: "commaList",
    description: "simple-icons slugs to show, e.g. react,typescript,nodedotjs. See https://simpleicons.org for the full catalog.",
  },
  columns: {
    type: "number",
    description: "Icons per row.",
    default: 8,
    min: 1,
    max: 50,
  },
  size: {
    type: "number",
    description: "Icon size, in pixels.",
    default: 40,
    min: 16,
    max: 100,
  },
  color: {
    type: "commaList",
    description: "Index-mapped hex colors (color[i] applies to name[i]). Empty entries fall back to the icon's own brand color.",
  },
  glow: {
    type: "boolean",
    description: "Adds a soft glow behind each icon.",
    default: false,
  },
  wave: {
    type: "boolean",
    description: "Gently bobs each icon up and down, staggered.",
    default: false,
  },
} as const);

export type TechIconsOptions = InferOptions<typeof TECH_ICONS_SCHEMA>;
