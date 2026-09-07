"use client";

import { Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useDashboard } from "./context";
import { canRenderLive } from "./state";

/**
 * The one action that performs a render (D11 / docs/TODOS.md 12.10). Two of
 * these are mounted — above and below the canvas — so a Generate is always
 * reachable without scrolling; on phones the lower one is a sticky bottom bar.
 */
export function GenerateButton({ className, size = "default" }: { className?: string; size?: "default" | "lg" }) {
  const { state, dispatch } = useDashboard();
  const liveBlocked = state.dataMode === "live" && !canRenderLive(state);
  const first = state.rendered === null;

  const button = (
    <Button
      size={size}
      disabled={liveBlocked}
      onClick={() => dispatch({ type: "generate" })}
      className={cn(
        "gap-2 font-medium",
        // A pulsing ring is the stale affordance (12.9): the canvas is out of
        // date and this is the button that fixes it.
        state.dirty && !liveBlocked && "ring-2 ring-brand/40 ring-offset-2 ring-offset-background",
        className
      )}
    >
      {first ? <Play className="size-4" /> : <RefreshCw className={cn("size-4", state.dirty && "animate-pulse")} />}
      {first ? "Generate" : state.dirty ? "Regenerate" : "Regenerate"}
      {state.dataMode === "live" && <span className="text-[10px] font-normal opacity-80">live</span>}
    </Button>
  );

  if (!liveBlocked) return button;

  return (
    <Tooltip>
      {/* A disabled button swallows pointer events, so the trigger needs a wrapper to stay hoverable. */}
      <TooltipTrigger asChild>
        <span className={cn("inline-flex", className)}>{button}</span>
      </TooltipTrigger>
      <TooltipContent>Enter a value in the identifying field first to render live data.</TooltipContent>
    </Tooltip>
  );
}
