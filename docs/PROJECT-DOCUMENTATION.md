# GitHub README Stats — Project Documentation

> Rewritten for task 5.10 (docs/TODOS.md). The previous version of this file described
> the pre-Phase-0 single-widget prototype (streak card only, no theme system, no option
> schema, satori/@vercel/og as unused dependencies) and had been stale since Phase 0.
> This version describes the system as of Phase 5. For the "why" behind any decision
> below, see [PLAN.md](./PLAN.md); for the phase-by-phase build log, see
> [TODOS.md](./TODOS.md).

---

## 1. What this is

A Next.js service that renders customizable GitHub profile widgets (streak, stats,
top-languages, repo/gist pins) as SVG, JSON, or PNG, plus two builder UIs:

> **UI note**: the two-builder, four-route layout described below is being replaced by a
> single-page dashboard at `/` (PLAN.md §9, TODOS.md Phase 12). Sections 1, 2 and 7 are
> rewritten as part of task 12.24 once that ships; everything else here — the option
> schema, theme system, render pipeline, i18n — is unaffected by that phase.

- **`/build`** — configure one widget, preview it live against sample data, copy the
  embed (Markdown/HTML/`<picture>`/raw URL/JSON/PNG/a GitHub Action workflow).
- **`/profile`** — compose several widgets plus identity, social badges, and a
  tech-stack row into one exportable `README.md`.

| Item | Value |
| --- | --- |
| Framework | Next.js 15.3.1 (App Router), all routes on the Node runtime (no `edge`) |
| Language | TypeScript 5.8, strict mode |
| UI | React 19, Tailwind CSS v4 |
| Data source | GitHub GraphQL API v4 (`@octokit/graphql`) + REST for gists |
| Rendering | JSX → real SVG elements via `react-dom/server`'s `renderToStaticMarkup` (not Satori — see PLAN.md §7 D1) |
| PNG rasterization | `@resvg/resvg-js` (native binary, Node-only, `serverExternalPackages` in next.config.ts) |
| Widgets | streak, stats, top-langs, pin, gist |
| Themes | 40 curated presets, 8 core slots + widget extension-slot fallback |
| Locales | 26 registered; 12 with full label translations, all with correct number/date formatting |

---

## 2. Directory structure

```
src/
  app/
    api/
      widget/[type]/route.ts        # unified dispatcher for every widget
      widget/[type]/preview/route.ts# same widget, bundled mock data, no auth/cache
      streak/route.ts                # back-compat alias -> widget/streak?format=json
      streak-svg/route.ts            # back-compat alias -> widget/streak
    build/                           # single-widget builder (Pillar A)
    profile/                         # full-README builder (Pillar B)
    page.tsx                         # landing page
  widgets/<name>/
    index.ts        # registerWidget() call: fetch/compute/render/toJson/mock
    schema.ts        # declarative option schema (client-safe, no server imports)
    <Name>Card.tsx   # JSX -> SVG renderer
    mock.ts          # sample data for the preview route
  lib/
    options/         # schema types, parser/validator, common option set
    themes/          # slot model + preset registry
    i18n/            # locale registry, label catalog, date-pattern engine
    render/          # svg.ts (serialize + error card), png.ts (rasterize)
    color.ts          # hex/alpha/named/gradient parsing
    cache.ts          # two-tier TtlCache (data + rendered output/PNG)
    github.ts, githubStats.ts, githubRepo.ts  # GraphQL/REST data fetching
    rank.ts, languages.ts, arc.ts, format.ts, text.ts, escape.ts
  components/card/    # shared JSX primitives: Card, Divider, FadeIn, Ring, RtlMirror, ErrorCard
  utils/streak.ts     # streak-calculation logic (daily/weekly, exclude_days, timezone)
```

---

## 3. The option schema (the keystone)

Every widget declares its options once as data (`src/lib/options/schema.ts`'s
`OptionDef`/`OptionSchema`), merging `COMMON_OPTIONS` (theme, colors, border,
`card_width`/`height`, `disable_animations`, `locale`, `number_format`,
`cache_seconds`, `format`) with its own. That single declaration drives:

- **API parsing/validation** — `parseOptions()` coerces and clamps against the schema,
  throwing `OptionValidationError` on bad input.
- **The builder's form** — `OptionField.tsx` dispatches a control per `type`
  (string/number/boolean/enum/color/commaList), with a few named special cases
  (`locale` → a language `<select>`, `date_format` → presets + free text,
  `exclude_days` → a weekday toggle row).
- **Cache-key normalization** — `normalizeOptionsForCacheKey()` sorts and stringifies
  the full option set so equivalent requests share a render-cache entry.

Widgets are registered against a type-erased `WidgetDefinition` (`src/widgets/registry.ts`):
`fetchRawData` (cached per username, ~30 min), `computeData` (pure, uncached — put any
option that only affects *derivation*, not *what's fetched*, here), `renderSvg`,
`toJson`, and optionally `mockRawData` for the preview route.

---

## 4. Theme system

8 core slots (`background`, `border`, `title`, `text`, `icon`, `accent`, `stroke`,
`muted`) that every theme must define, plus optional widget-specific extension slots
(`ring`, `fire`, `currStreakNum`, ...) that fall back to a mapped core slot when a
theme doesn't override them (`src/lib/themes/slots.ts`'s `EXTENSION_FALLBACKS`).
Resolution order for any slot: explicit query override → theme's extension slot →
theme's core slot → widget default. This is what lets 40 themes work across 5+ widget
types without 40×5 hand-authored palettes — see PLAN.md §7 D4/D5.

Colors (`src/lib/color.ts`) accept a 6-digit hex, an 8-digit hex with alpha, a CSS
color name, or `angle,c1,c2,...,cN` for a background gradient.

---

## 5. Rendering pipeline

Widgets are authored as TSX components (`<Card>`, `<Divider>`, `<FadeIn>`, `<Ring>`,
`<RtlMirror>` from `src/components/card/`) that emit real SVG elements — `<circle>`,
`<path>`, arc geometry (`src/lib/arc.ts`), `<mask>`, gradient `<defs>`, `<style>`
keyframes. `renderJsxToSvg()` (`src/lib/render/svg.ts`) serializes the element tree
with `renderToStaticMarkup` from `react-dom/server.edge` (that specific entry point,
not the bare `react-dom/server`, sidesteps a Next.js app-router bundler check — it
still runs on the Node runtime).

**Formats**: `format=svg` (default) serializes as above. `format=json` short-circuits
rendering entirely and returns `widget.toJson(data, options)`. `format=png` renders
the SVG as normal, then rasterizes it with `@resvg/resvg-js`
(`src/lib/render/png.ts`) — Node-only, and `disable_animations` is forced on first
(resvg renders one static frame, so an in-progress fade-in would otherwise freeze
mid-animation instead of showing the finished card).

**Caching**: two `TtlCache` instances (`src/lib/cache.ts`) — `githubDataCache` (raw
GraphQL/REST responses, ~30 min, keyed by widget type + username/repo/gist-id, plus a
suffix for options that genuinely change the upstream query) and
`renderedOutputCache`/`renderedPngCache` (final SVG/PNG, keyed by the full normalized
option set, TTL from `cache_seconds` or the widget's default). Both are module-level
`Map`s — they do not survive serverless cold starts or spread across concurrent
instances; Phase 10.1 (durable cache) is the documented upgrade path.

---

## 6. Internationalization (`src/lib/i18n/`)

- **`locales.ts`** — a registry of `{code, label, rtl}`; `getLocale()` falls back to
  English for any unrecognized code. 26 locales registered, 4 marked `rtl: true`
  (`ar`, `he`, `fa`, `ur`).
- **`catalog.ts`** — an always-complete English label catalog plus partial per-locale
  overrides (12 fully translated: `es fr de pt-BR it ru ja ko zh-CN ar hi tr`); a
  missing key or locale silently falls back to English rather than rendering blank.
- **`dateFormat.ts`** — a PHP `date()`-style token engine (`d j F M m n Y y`) with a
  `[...]` bracket meaning "include only if the date's year differs from the reference
  year" — mirrors streak-stats' own `date_format` convention (PLAN.md §7 D9). Exposed
  as the streak widget's `date_format` option, default `M j[, Y]`.
- **RTL layout mirroring** (`components/card/RtlMirror.tsx`) — `<Card rtl>` wraps a
  widget's content in `translate(width,0) scale(-1,1)`, mirroring every position
  card-wide. Individually wrapping a text node or icon group in `<RtlMirror x={itsOwnX}>`
  composes a second reflection around that same coordinate, which cancels the visual
  flip (glyphs/icons render normally) while leaving the position change intact —
  composing two reflections is a pure translation, and that cancellation holds
  regardless of how many pure-translation groups sit in between, so it's safe to wrap
  directly around any positioned element using its own local x/cx. Applied to all 5
  widgets; decorative bars/wedges (progress bars, pie/donut slices) are deliberately
  left unwrapped since letting them mirror naturally produces the correct RTL
  fill-direction/reading order for a row of items.

---

## 7. Delivery modes

1. **Hosted endpoint** — the default; embed `/api/widget/<type>?...` directly.
2. **GitHub Action** — `src/app/build/workflowYaml.ts` generates a workflow (exposed as
   a copy-out tab in `/build`) that curls the widget's SVG on a schedule and commits it
   into the user's own repo, so their README has zero runtime dependency on this
   service's uptime. A filled-in reference copy lives at
   [`examples/github-actions/update-widget.yml`](../examples/github-actions/update-widget.yml).
3. **Self-host** — `Dockerfile` builds Next's `output: "standalone"` artifact (only the
   pruned production dependency tree, not full `node_modules`). `WHITELIST` (comma-
   separated usernames) restricts which accounts a self-hosted instance serves —
   enforced in `src/widgets/handler.ts`'s `isWhitelisted()`, checked against `username`
   for most widgets or the owner segment of `repo` for the pin widget; not enforced for
   gists (no owner available without an extra fetch).

---

## 8. Known limitations

- **Module-level caches don't survive cold starts** or spread across concurrent
  serverless instances (Phase 10.1 tracks a Vercel KV/Redis upgrade).
- **First-100-repositories ceiling** on stats/language aggregation — a GitHub GraphQL
  API constraint (`repositories(first: 100)`), not a bug.
- **Contribution data can lag up to 24 hours** behind real activity on GitHub's side.
- **RTL mirroring is geometric, not exhaustively hand-verified per widget** — the
  mechanism is proven correct (see §6), but only spot-checked visually against a few
  locale/widget combinations, not systematically screenshot-tested.
- **PNG rasterization is untested inside a Linux container** in this repo's own CI —
  verified locally on the development machine's platform binary only; `npm ci` on a
  target platform pulls the matching `@resvg/resvg-js-*` optional dependency
  automatically, but that path hasn't been exercised end-to-end here.
- **No automated test suite** — every phase to date has been verified by hand against
  live GitHub data and structural SVG inspection instead (see each phase's notes in
  [TODOS.md](./TODOS.md)); a real test suite is still open work.
