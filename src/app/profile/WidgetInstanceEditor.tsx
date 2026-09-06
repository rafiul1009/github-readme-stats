"use client";

import { useState } from "react";
import { getWidgetCatalogEntry } from "@/widgets/catalog";
import { fieldValue, type FormValue } from "@/app/build/query";
import { OptionField } from "@/app/build/OptionField";
import type { WidgetInstance } from "./types";

const IDENTIFYING_FIELD_LABELS: Record<string, { label: string; placeholder: string }> = {
  username: { label: "GitHub username", placeholder: "e.g. octocat" },
  repo: { label: "Repository", placeholder: "owner/name" },
  id: { label: "Gist ID", placeholder: "e.g. 1345eef09799d4e6ac4c9cce08805875" },
  name: { label: "Names", placeholder: "e.g. react,typescript,nodedotjs" },
};

export interface WidgetInstanceEditorProps {
  instance: WidgetInstance;
  index: number;
  total: number;
  onChange: (next: WidgetInstance) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  draggable: {
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: () => void;
  };
}

/** Editor for a single widget inside the profile (task 4.1), with reorder controls (task 4.2). */
export function WidgetInstanceEditor({
  instance,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  draggable,
}: WidgetInstanceEditorProps) {
  const [expanded, setExpanded] = useState(false);
  const entry = getWidgetCatalogEntry(instance.type);
  if (!entry) return null;

  const identifyingUi = IDENTIFYING_FIELD_LABELS[entry.identifyingField] ?? {
    label: entry.identifyingField,
    placeholder: "",
  };

  const optionFieldNames = Object.keys(entry.schema).filter(
    (k) => k !== "theme" && k !== "format" && k !== entry.identifyingField
  );

  return (
    <div
      className="border rounded p-3 bg-black/[.02] dark:bg-white/[.03]"
      draggable
      onDragStart={draggable.onDragStart}
      onDragOver={draggable.onDragOver}
      onDrop={draggable.onDrop}
    >
      <div className="flex items-center gap-2">
        <span className="cursor-grab select-none opacity-50" title="Drag to reorder">
          ⠿
        </span>
        <span className="text-sm font-medium flex-1">{entry.label}</span>
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="text-xs px-1.5 py-0.5 rounded border disabled:opacity-30"
          title="Move up"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="text-xs px-1.5 py-0.5 rounded border disabled:opacity-30"
          title="Move down"
        >
          ↓
        </button>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs px-2 py-0.5 rounded border hover:bg-black/5 dark:hover:bg-white/10"
        >
          {expanded ? "Hide options" : "Options"}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs px-2 py-0.5 rounded border border-red-400 text-red-500 hover:bg-red-500/10"
        >
          Remove
        </button>
      </div>

      <label className="block mt-2">
        <span className="block text-xs font-medium mb-1 opacity-80">{identifyingUi.label}</span>
        <input
          type="text"
          className="border rounded px-2 py-1 text-sm w-full bg-transparent"
          placeholder={identifyingUi.placeholder}
          value={instance.identifyingValue}
          onChange={(e) => onChange({ ...instance, identifyingValue: e.target.value })}
        />
      </label>

      {expanded && (
        <div className="grid grid-cols-2 gap-x-4 mt-2 border-t pt-2">
          {optionFieldNames.map((name) => (
            <OptionField
              key={name}
              name={name}
              def={entry.schema[name]}
              value={fieldValue(entry.schema, instance.options, name)}
              onChange={(v: FormValue) => onChange({ ...instance, options: { ...instance.options, [name]: v } })}
              widgetType={entry.type}
            />
          ))}
        </div>
      )}
    </div>
  );
}
