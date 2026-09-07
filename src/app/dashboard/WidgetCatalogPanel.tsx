"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDashboard } from "./context";
import { groupedWidgets, WIDGET_ICONS } from "./widgetGroups";

/** The left sidebar's widget picker (docs/TODOS.md 12.13). */
export function WidgetCatalogPanel() {
  const { state, dispatch } = useDashboard();
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return groupedWidgets()
      .map(({ group, entries }) => ({
        group,
        entries: needle
          ? entries.filter(
              (e) => e.label.toLowerCase().includes(needle) || e.type.toLowerCase().includes(needle)
            )
          : entries,
      }))
      .filter(({ entries }) => entries.length > 0);
  }, [query]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-8 h-9"
          placeholder="Search widgets…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* The catalog scrolls inside itself. Without a bound, 22 widgets push
          the options accordion — the thing being configured — off-screen
          entirely on a 1024px-tall laptop. */}
      <div className="flex flex-col gap-3 max-h-[34vh] lg:max-h-[38vh] overflow-y-auto -mr-1 pr-1">
      {groups.length === 0 && (
        <p className="text-xs text-muted-foreground py-4 text-center">No widget matches “{query}”.</p>
      )}

      {groups.map(({ group, entries }) => (
        <div key={group.title}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-1 mb-1">
            {group.title}
          </p>
          <div className="flex flex-col gap-0.5">
            {entries.map((entry) => {
              const Icon = WIDGET_ICONS[entry.type];
              const active = state.widgetType === entry.type;
              return (
                <button
                  key={entry.type}
                  type="button"
                  aria-current={active ? "true" : undefined}
                  onClick={() => dispatch({ type: "selectWidget", widgetType: entry.type })}
                  className={cn(
                    // 44px touch target below lg (docs/TODOS.md 12.37).
                    "flex items-center gap-2.5 rounded-md px-2 min-h-11 lg:min-h-8 text-left text-sm transition-colors",
                    active
                      ? "bg-brand/12 text-foreground font-medium ring-1 ring-brand/30"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {Icon && <Icon className={cn("size-4 shrink-0", active && "text-brand")} />}
                  <span className="truncate">{entry.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
