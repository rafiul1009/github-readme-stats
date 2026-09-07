"use client";

import { useMemo, useState } from "react";
import { Search, Shuffle, Check } from "lucide-react";
import { listThemes } from "@/lib/themes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDashboard } from "./context";
import { fieldValue } from "./query";

/**
 * The former `/themes` catalog, reduced to a sidebar tab (docs/TODOS.md 12.15).
 *
 * **Supersedes** this file's earlier "themes fetch on Generate like anything
 * else" stance. Selecting a theme now re-renders immediately
 * (`dispatch({ type: "setTheme" })` — see `renderImmediately` in `state.ts`):
 * a theme is a palette, not a data change, and gating it behind a manual
 * Generate read as "changing the style calls the GitHub API", which it
 * never actually needed to (the raw-data cache is keyed by widget+username,
 * not by theme, so this only ever re-renders already-fetched data).
 */
export function ThemesPanel() {
  const { state, dispatch, schema } = useDashboard();
  const [query, setQuery] = useState("");
  const themes = useMemo(() => listThemes(), []);
  const active = (fieldValue(schema, state.form, "theme") as string) ?? "default";

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return themes;
    return themes.filter(
      (t) => t.name.toLowerCase().includes(needle) || t.label.toLowerCase().includes(needle)
    );
  }, [themes, query]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-8 h-9"
            placeholder={`Search ${themes.length} themes…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="size-9 shrink-0"
          title="Surprise me"
          onClick={() =>
            dispatch({ type: "setTheme", theme: themes[Math.floor(Math.random() * themes.length)].name })
          }
        >
          <Shuffle className="size-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
        {filtered.map((theme) => {
          const selected = active === theme.name;
          return (
            <button
              key={theme.name}
              type="button"
              title={`${theme.label} · ${theme.mode}`}
              aria-pressed={selected}
              onClick={() => dispatch({ type: "setTheme", theme: theme.name })}
              className={cn(
                "group rounded-lg overflow-hidden border text-left transition-all",
                selected ? "border-brand ring-2 ring-brand/30" : "hover:border-foreground/25"
              )}
            >
              <div
                className="h-10 flex items-center justify-center gap-1 relative"
                style={{ background: theme.core.background }}
              >
                <span className="size-2 rounded-full" style={{ background: theme.core.accent }} />
                <span className="size-2 rounded-full" style={{ background: theme.core.title }} />
                <span className="size-2 rounded-full" style={{ background: theme.core.text }} />
                {selected && (
                  <Check className="absolute right-1 top-1 size-3 text-brand drop-shadow" strokeWidth={3} />
                )}
              </div>
              <div className="px-1.5 py-1 truncate text-[10px] text-muted-foreground group-hover:text-foreground">
                {theme.label}
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-xs text-muted-foreground py-4 text-center">No theme matches “{query}”.</p>
      )}
    </div>
  );
}
