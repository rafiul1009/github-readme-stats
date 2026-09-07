"use client";

import { Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDashboard } from "./context";
import { resolveDataMode } from "./state";

/**
 * The one action that performs a render (D11 / docs/TODOS.md 12.10). Two of
 * these are mounted — above and below the canvas — so a Generate is always
 * reachable without scrolling; on phones the lower one is a sticky bottom bar.
 *
 * Never disabled: there is no Sample/Live mode to be blocked by (12.43) — an
 * empty identifying field just renders sample data instead of refusing to
 * render at all.
 */
export function GenerateButton({ className, size = "default" }: { className?: string; size?: "default" | "lg" }) {
  const { state, dispatch } = useDashboard();
  const first = state.rendered === null;
  const live = resolveDataMode(state) === "live";

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
      {live && <span className="text-[10px] font-normal opacity-80">live</span>}
    </Button>
  );
}
