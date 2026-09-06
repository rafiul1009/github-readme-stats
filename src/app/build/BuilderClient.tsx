"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { WIDGET_CATALOG, getWidgetCatalogEntry } from "@/widgets/catalog";
import { getTheme } from "@/lib/themes";
import type { OptionSchema } from "@/lib/options";
import { OptionField } from "./OptionField";
import { ThemePicker } from "./ThemePicker";
import { CopyPanel } from "./CopyPanel";
import { buildQueryString, fieldValue, type FormState, type FormValue } from "./query";

const COLOR_OVERRIDE_KEYS = ["bg_color", "title_color", "text_color", "icon_color", "border_color"];
// Rendered by dedicated UI elsewhere on the page rather than the generic field list.
// "username"/"repo"/"id" are added dynamically below via entry.identifyingField.
const ALWAYS_HANDLED_ELSEWHERE = new Set(["theme", "format"]);
const IDENTIFYING_FIELD_LABELS: Record<string, { label: string; placeholder: string }> = {
  username: { label: "GitHub username", placeholder: "e.g. octocat" },
  repo: { label: "Repository", placeholder: "owner/name" },
  id: { label: "Gist ID", placeholder: "e.g. 1345eef09799d4e6ac4c9cce08805875" },
  name: { label: "Names", placeholder: "e.g. react,typescript,nodedotjs" },
  lines: { label: "Lines", placeholder: "e.g. Hi I'm Octocat,I build things" },
};
const WIDGET_QUERY_KEY = "_widget";
const PREVIEW_DEBOUNCE_MS = 250;

function initFormFromSearchParams(schema: OptionSchema, searchParams: URLSearchParams): FormState {
  const form: FormState = {};
  for (const [key, def] of Object.entries(schema)) {
    const raw = searchParams.get(key);
    if (raw === null) continue;

    if (def.type === "boolean") form[key] = raw === "true";
    else if (def.type === "number") {
      const n = Number(raw);
      if (Number.isFinite(n)) form[key] = raw;
    } else if (def.type === "commaList") form[key] = raw.split(",").filter(Boolean);
    else form[key] = raw;
  }
  return form;
}

export function BuilderClient() {
  const searchParams = useSearchParams();
  const [widgetType, setWidgetType] = useState(searchParams.get(WIDGET_QUERY_KEY) || WIDGET_CATALOG[0].type);
  const entry = getWidgetCatalogEntry(widgetType) ?? WIDGET_CATALOG[0];

  const [form, setForm] = useState<FormState>(() => initFormFromSearchParams(entry.schema, searchParams));
  const [origin, setOrigin] = useState("");
  const [previewSrc, setPreviewSrc] = useState(`/api/widget/${entry.type}/preview`);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const qs = buildQueryString(entry.schema, form);
      setPreviewSrc(`/api/widget/${entry.type}/preview${qs ? `?${qs}` : ""}`);

      const url = new URL(window.location.href);
      const params = new URLSearchParams(qs);
      params.set(WIDGET_QUERY_KEY, entry.type);
      url.search = params.toString();
      window.history.replaceState(null, "", url.toString());
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, entry.type]);

  function setField(name: string, value: FormValue) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleThemeChange(themeName: string) {
    setForm((prev) => {
      const next: FormState = { ...prev, theme: themeName };
      for (const key of COLOR_OVERRIDE_KEYS) delete next[key];
      return next;
    });
  }

  function handleWidgetTypeChange(type: string) {
    setWidgetType(type);
    // Options are widget-specific (even the identifying field differs —
    // username vs repo vs gist id) and rarely transfer meaningfully across
    // types, so only theme, a concept every widget shares, survives a switch.
    setForm((prev) => ({ theme: prev.theme }));
  }

  const identifyingField = entry.identifyingField;
  const identifyingValue =
    identifyingField && typeof form[identifyingField] === "string" ? (form[identifyingField] as string) : "";
  const identifyingUi = identifyingField
    ? IDENTIFYING_FIELD_LABELS[identifyingField] ?? { label: identifyingField, placeholder: "" }
    : undefined;
  const themeName = (fieldValue(entry.schema, form, "theme") as string) ?? "default";
  const theme = getTheme(themeName);
  const finalQuery = buildQueryString(entry.schema, form);
  const finalUrl = `${origin}/api/widget/${entry.type}?${finalQuery}`;

  const genericFieldNames = Object.keys(entry.schema).filter(
    (k) => !ALWAYS_HANDLED_ELSEWHERE.has(k) && k !== identifyingField
  );

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Widget Builder</h1>
      <p className="text-sm opacity-70 mb-6">
        Configure a card, preview it instantly from sample data, then copy the embed for your README.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <label className="block mb-4">
            <span className="block text-xs font-medium mb-1 opacity-80">Widget</span>
            <select
              className="border rounded px-2 py-1.5 text-sm w-full bg-transparent"
              value={entry.type}
              onChange={(e) => handleWidgetTypeChange(e.target.value)}
            >
              {WIDGET_CATALOG.map((w) => (
                <option key={w.type} value={w.type}>
                  {w.label}
                </option>
              ))}
            </select>
          </label>

          {identifyingUi && identifyingField && (
            <label className="block mb-4">
              <span className="block text-xs font-medium mb-1 opacity-80">{identifyingUi.label}</span>
              <input
                type="text"
                className="border rounded px-2 py-1.5 text-sm w-full bg-transparent"
                placeholder={identifyingUi.placeholder}
                value={identifyingValue}
                onChange={(e) => setField(identifyingField, e.target.value)}
              />
            </label>
          )}

          <div className="mb-4">
            <span className="block text-xs font-medium mb-1 opacity-80">Theme</span>
            <ThemePicker value={themeName} onChange={handleThemeChange} />
          </div>

          <div className="border-t pt-3 mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium opacity-80">Options</span>
              <button
                type="button"
                onClick={() => setForm({})}
                className="text-xs px-2 py-0.5 rounded border hover:bg-black/5 dark:hover:bg-white/10"
              >
                Clear options
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-4">
              {genericFieldNames.map((name) => (
                <OptionField
                  key={name}
                  name={name}
                  def={entry.schema[name]}
                  value={fieldValue(entry.schema, form, name)}
                  onChange={(v) => setField(name, v)}
                  widgetType={entry.type}
                />
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-2">
            <span className="block text-xs font-medium mb-1 opacity-80">Preview</span>
            {/* eslint-disable-next-line @next/next/no-img-element -- external, dynamically-generated SVG; next/image doesn't apply */}
            <img src={previewSrc} alt="Widget preview" className="max-w-full border rounded" />
            <p className="text-xs opacity-60 mt-1">Preview uses sample data — not your real GitHub stats.</p>
          </div>

          <div className="border-t pt-3 mt-3">
            {!identifyingField || identifyingValue ? (
              <CopyPanel
                imageUrl={finalUrl}
                altText={`${identifyingValue || entry.label} — ${entry.label}`}
                themeName={themeName}
                themeMode={theme.mode}
                widgetType={entry.type}
                buildUrlWithTheme={(t) =>
                  `${origin}/api/widget/${entry.type}?${buildQueryString(entry.schema, { ...form, theme: t })}`
                }
              />
            ) : (
              <p className="text-sm opacity-60">Enter {identifyingUi?.label.toLowerCase()} to generate an embeddable link.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
