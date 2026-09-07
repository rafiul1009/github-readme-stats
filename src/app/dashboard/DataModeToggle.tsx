"use client";

import { FlaskConical, Radio } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useDashboard } from "./context";
import type { DataMode } from "./state";

const MODES: { value: DataMode; label: string; icon: typeof Radio; hint: string }[] = [
  {
    value: "sample",
    label: "Sample",
    icon: FlaskConical,
    hint: "Renders from bundled sample data — instant, no username needed, and it costs nothing against the GitHub rate limit.",
  },
  {
    value: "live",
    label: "Live",
    icon: Radio,
    hint: "Renders your real GitHub data. Needs the identifying field filled, and spends one (cached) API call per Generate.",
  },
];

/** Which endpoint Generate calls (docs/TODOS.md 12.8). */
export function DataModeToggle() {
  const { state, dispatch } = useDashboard();

  return (
    <div role="radiogroup" aria-label="Preview data source" className="inline-flex rounded-lg border bg-muted/40 p-0.5">
      {MODES.map(({ value, label, icon: Icon, hint }) => {
        const active = state.dataMode === value;
        return (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => dispatch({ type: "setDataMode", dataMode: value })}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 h-8 text-xs font-medium transition-colors",
                  active ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("size-3.5", active && value === "live" && "text-brand")} />
                {label}
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-56">{hint}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
