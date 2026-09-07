"use client";

import { Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDashboard } from "./context";

/**
 * The one action that performs a render for a data edit (D11 / docs/TODOS.md
 * 12.10). Mounted in the top bar and above the canvas, plus a sticky bottom
 * bar on phones — the standalone button below the copy-out panel (12.10's
 * "second Generate") was removed per 12.50, since navigation/presentation
 * changes (switching widgets, picking a theme) now render immediately on
 * their own and no longer need a reachable fallback for "I forgot to press
 * Generate".
 *
 * Never disabled: there is no Sample/Live mode to be blocked by (12.43) — an
 * empty identifying field just renders sample data instead of refusing to
 * render at all.
 */
export function GenerateButton({ className, size = "default" }: { className?: string; size?: "default" | "lg" }) {
  const { state, dispatch } = useDashboard();
  const first = state.rendered === null;

  return (
    <Button
      size={size}
      onClick={() => dispatch({ type: "generate" })}
      className={cn(
        "gap-2 font-medium",
        // A pulsing ring is the stale affordance (12.9): the canvas is out of
        // date and this is the button that fixes it.
        state.dirty && "ring-2 ring-brand/40 ring-offset-2 ring-offset-background",
        className
      )}
    >
      {first ? <Play className="size-4" /> : <RefreshCw className={cn("size-4", state.dirty && "animate-pulse")} />}
      {first ? "Generate" : "Regenerate"}
    </Button>
  );
}
