"use client";

import { useMemo, useState } from "react";
import { listThemes } from "@/lib/themes";

export interface ThemePickerProps {
  value: string;
  onChange: (themeName: string) => void;
}

/** Searchable swatch grid (docs/TODOS.md task 1.10) — needed once the registry passes ~40 themes. */
export function ThemePicker({ value, onChange }: ThemePickerProps) {
  const [query, setQuery] = useState("");
  const themes = useMemo(() => listThemes(), []);
  const filtered = useMemo(
    () => themes.filter((t) => t.name.toLowerCase().includes(query.trim().toLowerCase())),
    [themes, query]
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search themes…"
        className="border rounded px-2 py-1 text-sm w-full mb-2 bg-transparent"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="grid grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
        {filtered.map((theme) => (
          <button
            key={theme.name}
            type="button"
            title={theme.label}
            onClick={() => onChange(theme.name)}
            className={`rounded overflow-hidden border-2 text-left ${
              value === theme.name ? "border-blue-600" : "border-transparent"
            }`}
          >
            <div
              className="h-8 flex items-center justify-center gap-1"
              style={{ background: theme.core.background }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: theme.core.accent }} />
              <span className="w-2 h-2 rounded-full" style={{ background: theme.core.title }} />
            </div>
            <div className="text-[10px] px-1 py-0.5 truncate opacity-80">{theme.label}</div>
          </button>
        ))}
        {filtered.length === 0 && <p className="col-span-4 text-xs opacity-60 py-2">No themes match.</p>}
      </div>
    </div>
  );
}
