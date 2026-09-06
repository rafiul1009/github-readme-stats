"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { WIDGET_CATALOG } from "@/widgets/catalog";
import { ThemePicker } from "@/app/build/ThemePicker";
import { emptyProfileConfig, newWidgetInstance, type ProfileConfig, type SocialLink, type WidgetInstance } from "./types";
import { SOCIAL_PLATFORMS, getSocialPlatform } from "./social";
import { TECH_STACK, techCategories } from "./techstack";
import { PROFILE_TEMPLATES } from "./templates";
import { WidgetInstanceEditor } from "./WidgetInstanceEditor";
import { ReadmePreview } from "./ReadmePreview";
import { buildReadmeMarkdown } from "./exportReadme";

const CONFIG_QUERY_KEY = "c";
const DEBOUNCE_MS = 400;

function loadConfigFromSearchParams(searchParams: URLSearchParams): ProfileConfig {
  const raw = searchParams.get(CONFIG_QUERY_KEY);
  if (!raw) return emptyProfileConfig();
  try {
    const parsed = JSON.parse(raw);
    return { ...emptyProfileConfig(), ...parsed };
  } catch {
    return emptyProfileConfig();
  }
}

function newSocialLink(platform: string): SocialLink {
  return { id: `${platform}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, platform, value: "" };
}

export function ProfileBuilderClient() {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<ProfileConfig>(() => loadConfigFromSearchParams(searchParams));
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const dragIndexRef = useRef<number | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      params.set(CONFIG_QUERY_KEY, JSON.stringify(config));
      const url = new URL(window.location.href);
      url.search = params.toString();
      window.history.replaceState(null, "", url.toString());
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [config]);

  function update(patch: Partial<ProfileConfig>) {
    setConfig((prev) => ({ ...prev, ...patch }));
  }

  function applyTemplate(key: string) {
    const template = PROFILE_TEMPLATES.find((t) => t.key === key);
    if (!template) return;
    const built = template.build();
    setConfig((prev) => ({
      ...built,
      username: prev.username,
      name: prev.name,
    }));
  }

  function addWidget(type: string) {
    update({ widgets: [...config.widgets, newWidgetInstance(type, "")] });
  }

  function updateWidget(id: string, next: WidgetInstance) {
    update({ widgets: config.widgets.map((w) => (w.id === id ? next : w)) });
  }

  function removeWidget(id: string) {
    update({ widgets: config.widgets.filter((w) => w.id !== id) });
  }

  function moveWidget(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= config.widgets.length) return;
    const next = [...config.widgets];
    [next[index], next[target]] = [next[target], next[index]];
    update({ widgets: next });
  }

  function reorderWidgets(from: number, to: number) {
    if (from === to) return;
    const next = [...config.widgets];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    update({ widgets: next });
  }

  function addSocial(platform: string) {
    update({ socials: [...config.socials, newSocialLink(platform)] });
  }

  function updateSocial(id: string, value: string) {
    update({ socials: config.socials.map((s) => (s.id === id ? { ...s, value } : s)) });
  }

  function removeSocial(id: string) {
    update({ socials: config.socials.filter((s) => s.id !== id) });
  }

  function toggleTech(slug: string) {
    const has = config.techStack.includes(slug);
    update({ techStack: has ? config.techStack.filter((s) => s !== slug) : [...config.techStack, slug] });
  }

  const readme = buildReadmeMarkdown(config, origin);
  const usedPlatforms = new Set(config.socials.map((s) => s.platform));
  const availablePlatforms = SOCIAL_PLATFORMS.filter((p) => !usedPlatforms.has(p.key));

  async function copyReadme() {
    try {
      await navigator.clipboard.writeText(readme);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable — the markdown is still selectable in the textarea below.
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Profile README Builder</h1>
        <Link href="/build" className="text-xs px-2 py-1 rounded border hover:bg-black/5 dark:hover:bg-white/10">
          Single widget builder →
        </Link>
      </div>
      <p className="text-sm opacity-70 mb-6">
        Pick widgets, add your identity and socials, and export a complete README.md. The link to this
        page is shareable — your whole configuration lives in the URL.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <section className="flex flex-col gap-6">
          {/* Starter templates */}
          <div>
            <span className="block text-xs font-medium mb-1 opacity-80">Starter template</span>
            <div className="flex flex-wrap gap-1.5">
              {PROFILE_TEMPLATES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  title={t.description}
                  onClick={() => applyTemplate(t.key)}
                  className="text-xs px-2 py-1 rounded border hover:bg-black/5 dark:hover:bg-white/10"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Identity */}
          <div className="border-t pt-4">
            <span className="block text-xs font-medium mb-2 opacity-80">Identity</span>
            <label className="block mb-2">
              <span className="block text-xs mb-1 opacity-70">GitHub username</span>
              <input
                type="text"
                className="border rounded px-2 py-1.5 text-sm w-full bg-transparent"
                placeholder="e.g. octocat"
                value={config.username}
                onChange={(e) => update({ username: e.target.value })}
              />
            </label>
            <label className="block mb-2">
              <span className="block text-xs mb-1 opacity-70">Display name</span>
              <input
                type="text"
                className="border rounded px-2 py-1.5 text-sm w-full bg-transparent"
                placeholder="e.g. Ada Lovelace"
                value={config.name}
                onChange={(e) => update({ name: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="block text-xs mb-1 opacity-70">Bio</span>
              <textarea
                className="border rounded px-2 py-1.5 text-sm w-full bg-transparent"
                rows={2}
                placeholder="A short line about what you do."
                value={config.bio}
                onChange={(e) => update({ bio: e.target.value })}
              />
            </label>
          </div>

          {/* Socials */}
          <div className="border-t pt-4">
            <span className="block text-xs font-medium mb-2 opacity-80">Socials</span>
            <div className="flex flex-col gap-2 mb-2">
              {config.socials.map((link) => {
                const platform = getSocialPlatform(link.platform);
                return (
                  <div key={link.id} className="flex items-center gap-2">
                    <span className="text-xs w-24 shrink-0 opacity-80">{platform?.label ?? link.platform}</span>
                    <input
                      type="text"
                      className="border rounded px-2 py-1 text-sm flex-1 bg-transparent"
                      placeholder={platform?.placeholder}
                      value={link.value}
                      onChange={(e) => updateSocial(link.id, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeSocial(link.id)}
                      className="text-xs px-2 py-0.5 rounded border border-red-400 text-red-500 hover:bg-red-500/10"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
            {availablePlatforms.length > 0 && (
              <select
                className="border rounded px-2 py-1 text-sm bg-transparent"
                value=""
                onChange={(e) => {
                  if (e.target.value) addSocial(e.target.value);
                }}
              >
                <option value="">+ Add a social link…</option>
                {availablePlatforms.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Tech stack */}
          <div className="border-t pt-4">
            <span className="block text-xs font-medium mb-2 opacity-80">Tech stack</span>
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
              {techCategories().map((category) => (
                <div key={category}>
                  <p className="text-[11px] font-semibold uppercase opacity-50 mb-1">{category}</p>
                  <div className="flex flex-wrap gap-1">
                    {TECH_STACK.filter((t) => t.category === category).map((t) => {
                      const active = config.techStack.includes(t.slug);
                      return (
                        <button
                          key={t.slug}
                          type="button"
                          onClick={() => toggleTech(t.slug)}
                          className={`text-xs px-2 py-0.5 rounded border ${
                            active
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-transparent border-neutral-400 dark:border-neutral-600"
                          }`}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Theme lock + layout */}
          <div className="border-t pt-4">
            <span className="block text-xs font-medium mb-2 opacity-80">Shared theme (applies to every widget)</span>
            <ThemePicker value={config.theme} onChange={(theme) => update({ theme })} />

            <div className="flex gap-6 mt-3">
              <label className="block">
                <span className="block text-xs mb-1 opacity-70">Widget layout</span>
                <select
                  className="border rounded px-2 py-1 text-sm bg-transparent"
                  value={config.layout}
                  onChange={(e) => update({ layout: e.target.value as ProfileConfig["layout"] })}
                >
                  <option value="stacked">Stacked</option>
                  <option value="side-by-side">Side by side</option>
                </select>
              </label>
              <label className="block">
                <span className="block text-xs mb-1 opacity-70">Alignment</span>
                <select
                  className="border rounded px-2 py-1 text-sm bg-transparent"
                  value={config.align}
                  onChange={(e) => update({ align: e.target.value as ProfileConfig["align"] })}
                >
                  <option value="center">Center</option>
                  <option value="left">Left</option>
                </select>
              </label>
            </div>
          </div>

          {/* Widgets */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium opacity-80">Widgets</span>
              <select
                className="border rounded px-2 py-1 text-xs bg-transparent"
                value=""
                onChange={(e) => {
                  if (e.target.value) addWidget(e.target.value);
                }}
              >
                <option value="">+ Add widget…</option>
                {WIDGET_CATALOG.map((w) => (
                  <option key={w.type} value={w.type}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              {config.widgets.map((instance, index) => (
                <WidgetInstanceEditor
                  key={instance.id}
                  instance={instance}
                  index={index}
                  total={config.widgets.length}
                  onChange={(next) => updateWidget(instance.id, next)}
                  onRemove={() => removeWidget(instance.id)}
                  onMoveUp={() => moveWidget(index, -1)}
                  onMoveDown={() => moveWidget(index, 1)}
                  draggable={{
                    onDragStart: () => {
                      dragIndexRef.current = index;
                    },
                    onDragOver: (e) => e.preventDefault(),
                    onDrop: () => {
                      if (dragIndexRef.current !== null) reorderWidgets(dragIndexRef.current, index);
                      dragIndexRef.current = null;
                    },
                  }}
                />
              ))}
              {config.widgets.length === 0 && (
                <p className="text-xs opacity-60 py-2">No widgets yet — add one above.</p>
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-2">
            <span className="block text-xs font-medium mb-1 opacity-80">Preview</span>
            <div className="border rounded p-4">
              <ReadmePreview config={config} />
            </div>
            <p className="text-xs opacity-60 mt-1">
              Widget previews use sample data — not your real GitHub stats. The final README uses your
              actual username.
            </p>
          </div>

          <div className="border-t pt-3 mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium opacity-80">README.md</span>
              <button
                type="button"
                onClick={copyReadme}
                className="text-xs px-2 py-0.5 rounded border hover:bg-black/5 dark:hover:bg-white/10"
              >
                {copied ? "Copied!" : "Copy README.md"}
              </button>
            </div>
            <textarea
              readOnly
              className="w-full h-64 text-xs font-mono border rounded p-2 bg-black/[.03] dark:bg-white/[.05]"
              value={readme}
            />
            <p className="text-xs opacity-60 mt-1">
              This page&apos;s URL updates as you edit — copy it to save or share your configuration.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
