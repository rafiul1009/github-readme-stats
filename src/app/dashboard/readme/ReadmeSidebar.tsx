"use client";

import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Settings2 } from "lucide-react";
import { WIDGET_CATALOG, getWidgetCatalogEntry } from "@/widgets/catalog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useDashboard } from "../context";
import { OptionField } from "../OptionField";
import { fieldValue } from "../query";
import { groupOptions, OPTION_GROUP_LABELS, OPTION_GROUP_ORDER } from "../optionGroups";
import { SOCIAL_PLATFORMS } from "./social";
import { TECH_STACK, techCategories } from "./techstack";
import { newWidgetInstance, type ProfileConfig, type WidgetInstance } from "./types";
import { WIDGET_ICONS } from "../widgetGroups";

/**
 * README mode's controls (docs/TODOS.md 12.18 / 12.19). The `ProfileConfig`
 * model and its export logic are the shipped Phase 4 ones, untouched — this is
 * a re-skin and a re-host into the dashboard shell, not a rewrite.
 */
export function ReadmeSidebar() {
  const { state, dispatch } = useDashboard();
  const profile = state.profile;
  const update = (patch: Partial<ProfileConfig>) =>
    dispatch({ type: "setProfile", profile: { ...profile, ...patch } });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div>
          <Label htmlFor="pc-username" className="text-xs text-muted-foreground mb-1.5">
            GitHub username
          </Label>
          <Input
            id="pc-username"
            placeholder="octocat"
            value={profile.username}
            onChange={(e) => update({ username: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="pc-name" className="text-xs text-muted-foreground mb-1.5">
            Display name
          </Label>
          <Input
            id="pc-name"
            placeholder="Mona Lisa"
            value={profile.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="pc-bio" className="text-xs text-muted-foreground mb-1.5">
            Bio
          </Label>
          <Textarea
            id="pc-bio"
            rows={3}
            placeholder="Building things, one commit at a time."
            value={profile.bio}
            onChange={(e) => update({ bio: e.target.value })}
          />
        </div>
      </div>

      <Separator />

      <Accordion type="multiple" defaultValue={["widgets"]}>
        <AccordionItem value="widgets">
          <AccordionTrigger className="py-3 text-sm">
            <span className="flex items-center gap-2">
              Widgets
              <span className="text-[10px] font-normal text-muted-foreground tabular-nums">
                {profile.widgets.length}
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <WidgetList profile={profile} update={update} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="socials">
          <AccordionTrigger className="py-3 text-sm">
            <span className="flex items-center gap-2">
              Social links
              <span className="text-[10px] font-normal text-muted-foreground tabular-nums">
                {profile.socials.length}
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <SocialList profile={profile} update={update} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tech">
          <AccordionTrigger className="py-3 text-sm">
            <span className="flex items-center gap-2">
              Tech stack
              <span className="text-[10px] font-normal text-muted-foreground tabular-nums">
                {profile.techStack.length}
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <TechPicker profile={profile} update={update} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="layout">
          <AccordionTrigger className="py-3 text-sm">Layout</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5">Widget arrangement</Label>
              <Select value={profile.layout} onValueChange={(v) => update({ layout: v as ProfileConfig["layout"] })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stacked">Stacked — one per line</SelectItem>
                  <SelectItem value="side-by-side">Side by side — wrapped rows</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5">Alignment</Label>
              <Select value={profile.align} onValueChange={(v) => update({ align: v as ProfileConfig["align"] })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">Centered</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

type Update = (patch: Partial<ProfileConfig>) => void;

function WidgetList({ profile, update }: { profile: ProfileConfig; update: Update }) {
  const move = (index: number, delta: number) => {
    const next = [...profile.widgets];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    update({ widgets: next });
  };

  return (
    <div className="flex flex-col gap-2">
      {profile.widgets.map((instance, i) => (
        <WidgetRow
          key={instance.id}
          instance={instance}
          profile={profile}
          isFirst={i === 0}
          isLast={i === profile.widgets.length - 1}
          onMove={(delta) => move(i, delta)}
          onRemove={() => update({ widgets: profile.widgets.filter((w) => w.id !== instance.id) })}
          onChange={(next) =>
            update({ widgets: profile.widgets.map((w) => (w.id === instance.id ? next : w)) })
          }
        />
      ))}

      {profile.widgets.length === 0 && (
        <p className="text-xs text-muted-foreground py-2">No widgets yet — add one below.</p>
      )}

      <Select value="" onValueChange={(type) => update({ widgets: [...profile.widgets, newWidgetInstance(type, "")] })}>
        <SelectTrigger className="w-full">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Plus className="size-3.5" />
            Add a widget
          </span>
        </SelectTrigger>
        <SelectContent>
          {WIDGET_CATALOG.map((w) => (
            <SelectItem key={w.type} value={w.type}>
              {w.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function WidgetRow({
  instance,
  profile,
  isFirst,
  isLast,
  onMove,
  onRemove,
  onChange,
}: {
  instance: WidgetInstance;
  profile: ProfileConfig;
  isFirst: boolean;
  isLast: boolean;
  onMove: (delta: number) => void;
  onRemove: () => void;
  onChange: (next: WidgetInstance) => void;
}) {
  const entry = getWidgetCatalogEntry(instance.type);
  if (!entry) return null;
  const Icon = WIDGET_ICONS[instance.type];
  // `theme` is locked at the profile level, so it never appears per-widget.
  const groups = groupOptions(entry.schema, entry.identifyingField);

  return (
    <div className="rounded-lg border bg-card/50 p-2">
      <div className="flex items-center gap-1.5">
        <GripVertical className="size-3.5 text-muted-foreground/50 shrink-0" />
        {Icon && <Icon className="size-3.5 text-brand shrink-0" />}
        <span className="text-xs font-medium flex-1">{entry.label}</span>

        <Button variant="ghost" size="icon" className="size-7" disabled={isFirst} onClick={() => onMove(-1)} aria-label="Move up">
          <ChevronUp className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="size-7" disabled={isLast} onClick={() => onMove(1)} aria-label="Move down">
          <ChevronDown className="size-3.5" />
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" aria-label={`Configure ${entry.label}`}>
              <Settings2 className="size-3.5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{entry.label}</DialogTitle>
            </DialogHeader>

            {entry.identifyingField && (
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5">
                  {entry.identifyingField.replace(/_/g, " ")}
                </Label>
                <Input
                  placeholder={
                    entry.identifyingField === "username" && profile.username
                      ? `${profile.username} (from the profile)`
                      : undefined
                  }
                  value={instance.identifyingValue}
                  onChange={(e) => onChange({ ...instance, identifyingValue: e.target.value })}
                />
              </div>
            )}

            <Accordion type="multiple" defaultValue={["content"]}>
              {OPTION_GROUP_ORDER.filter((k) => groups[k].length > 0).map((key) => (
                <AccordionItem key={key} value={key}>
                  <AccordionTrigger className="py-3 text-sm">{OPTION_GROUP_LABELS[key].title}</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col divide-y divide-border/50">
                      {groups[key].map((name) => (
                        <OptionField
                          key={name}
                          name={name}
                          def={entry.schema[name]}
                          value={fieldValue(entry.schema, instance.options, name)}
                          onChange={(value) =>
                            onChange({ ...instance, options: { ...instance.options, [name]: value } })
                          }
                          widgetType={entry.type}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </DialogContent>
        </Dialog>

        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          aria-label={`Remove ${entry.label}`}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function SocialList({ profile, update }: { profile: ProfileConfig; update: Update }) {
  return (
    <div className="flex flex-col gap-2">
      {profile.socials.map((link) => (
        <div key={link.id} className="flex items-center gap-1.5">
          <Select
            value={link.platform}
            onValueChange={(platform) =>
              update({ socials: profile.socials.map((s) => (s.id === link.id ? { ...s, platform } : s)) })
            }
          >
            <SelectTrigger className="w-32 shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SOCIAL_PLATFORMS.map((p) => (
                <SelectItem key={p.key} value={p.key}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            className="flex-1"
            placeholder="handle or URL"
            value={link.value}
            onChange={(e) =>
              update({ socials: profile.socials.map((s) => (s.id === link.id ? { ...s, value: e.target.value } : s)) })
            }
          />
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => update({ socials: profile.socials.filter((s) => s.id !== link.id) })}
            aria-label="Remove social link"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          update({
            socials: [
              ...profile.socials,
              { id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, platform: SOCIAL_PLATFORMS[0].key, value: "" },
            ],
          })
        }
      >
        <Plus className="size-3.5" />
        Add link
      </Button>
    </div>
  );
}

function TechPicker({ profile, update }: { profile: ProfileConfig; update: Update }) {
  const selected = new Set(profile.techStack);
  const toggle = (slug: string) =>
    update({
      techStack: selected.has(slug) ? profile.techStack.filter((s) => s !== slug) : [...profile.techStack, slug],
    });

  return (
    <div className="flex flex-col gap-3">
      {techCategories().map((category) => (
        <div key={category}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1.5">
            {category}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {TECH_STACK.filter((t) => t.category === category).map((tech) => {
              const active = selected.has(tech.slug);
              return (
                <button
                  key={tech.slug}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(tech.slug)}
                  className={cn(
                    "rounded-md border px-2 py-2 lg:py-1 text-[11px] font-medium transition-colors",
                    active ? "bg-brand text-white border-brand" : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  {tech.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
