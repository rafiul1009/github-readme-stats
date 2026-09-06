// Importing each widget module for its registerWidget(...) side effect.
// Add new widgets here as they're built (docs/TODOS.md Phase 2+).
import "@/widgets/streak";
import "@/widgets/stats";
import "@/widgets/top-langs";
import "@/widgets/pin";
import "@/widgets/gist";
import "@/widgets/activity-graph";
import "@/widgets/heatmap";
import "@/widgets/trophy";
import "@/widgets/profile-summary";
import "@/widgets/repos-per-language";
import "@/widgets/most-commit-language";
import "@/widgets/productive-time";

export * from "@/widgets/registry";
