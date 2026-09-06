# TODOs — Universal GitHub Profile & Stats Widget Generator

Phase-by-phase task breakdown. Rationale for every decision is in [PLAN.md](./PLAN.md).

**Status values**: `todo` · `doing` · `done` · `blocked`
**Priority**: P0 (blocks the phase) · P1 (needed for the phase to be complete) · P2 (nice to have)

**Shipping milestones**
- ✅ **MVP** = Phases 0–3 (streak + stats + top-langs + pins, working widget builder, copy-out) — **complete**, gist support shipped alongside pins as well
- ✅ **v1.0** = Phases 0–5 (adds the profile README builder, i18n, and delivery modes) — **complete**
- **v1.5+** = Phases 6–10 (remaining widgets, scaling); Phase 11 is explicitly out of scope

Phase order reflects **D8**: the profile README builder ships before widgets 5–15, because
it is the differentiator and is worth more atop four widgets than a fifth widget is worth
without it.

---

## ✅ Phase 0 — Foundations (blocks everything)

| # | Task | Details | Pri | Status |
| --- | --- | --- | --- | --- |
| 0.1 | ✅ Declarative option schema | `src/lib/options/schema.ts`: typed `OptionDef`/`OptionSchema` (string/number/boolean/enum/color/commaList) + `InferOptions<S>` type inference + `mergeSchemas`. | P0 | done |
| 0.2 | ✅ Option parser + validator | `src/lib/options/parse.ts`: `parseOptions()` coerces/clamps/validates against a schema, `OptionValidationError` on bad input, `normalizeOptionsForCacheKey()` for stable cache keys. | P0 | done |
| 0.3 | ✅ Color value parser | `src/lib/color.ts`: 6-digit hex, 8-digit hex with alpha, CSS color names, `angle,c1,...,cN` gradients. | P0 | done |
| 0.4 | ✅ Theme slot model | `src/lib/themes/slots.ts`: 8 core slots + `EXTENSION_FALLBACKS` map + `resolveThemeSlot`/`resolveThemeSlots`. | P0 | done |
| 0.5 | ✅ Theme registry (initial 40) | `src/lib/themes/registry.ts`: 40 presets (default, dark, radical, merko, gruvbox×2, tokyonight, onedark, cobalt×2, synthwave, dracula, nord, monokai, solarized×2, catppuccin×4, github-*×3, vue×2, shades-of-purple, nightowl, gotham, material-palenight, ayu-mirage, midnight-purple, calm, react, blueberry, dark-aura, panda, rose-pine, algolia, swift, transparent, highcontrast). | P0 | done |
| 0.6 | ✅ Theme override resolution | Covered by 0.4's `resolveThemeSlots` (theme → extension slot → core fallback); per-request query overrides wired in as each widget consumes it (see streak widget shim). | P0 | done |
| 0.7 | ✅ SVG render pipeline | `src/lib/render/svg.ts`: `renderJsxToSvg()` via `renderToStaticMarkup` from `react-dom/server.edge` (the plain `react-dom/server` entry trips Next's app-router bundler check — see code comment), plus `svgResponse`/`jsonResponse`/`errorResponse`. Per **D1**. | P0 | done |
| 0.8 | ✅ Drop `satori` + `@vercel/og` | Removed from `package.json`. | P0 | done |
| 0.9 | ✅ Shared JSX primitives | `src/components/card/`: `Card`, `Divider`, `FadeIn`, `Stat`, `Ring`, `Title` built and in use by the streak port. `Row`/`Bar`/`Icon` deferred until the widgets that need them (Phase 2/3 stats & top-langs cards). | P0 | done (partial — remaining primitives added on demand) |
| 0.10 | ~~PNG output~~ | **Moved to Phase 7 per D3** — PNG is the only format needing font binaries + a native `resvg` build. SVG + JSON are first-class. | — | n/a |
| 0.11 | ✅ Two-tier cache | `src/lib/cache.ts`: `TtlCache` + `githubDataCache` (30 min TTL) + `renderedOutputCache` (per-request TTL) + `getOrSetAsync`. Cold-start/KV-upgrade limitation documented in the file header. | P0 | done |
| 0.12 | ✅ `cache_seconds` param | In `COMMON_OPTIONS` (`src/lib/options/common.ts`), clamped 21600–86400, wired into `handleWidgetRequest`. | P2 | done |
| 0.13 | ✅ Unified widget route | `src/app/api/widget/[type]/route.ts` dispatcher + `src/widgets/registry.ts` (type-erased registry) + `src/widgets/handler.ts` (shared request handling). | P0 | done |
| 0.14 | ✅ Back-compat aliases | `/api/streak-svg` and `/api/streak` now delegate to the same widget + shared data cache; verified against live GitHub data — identical response shapes, status codes, and cache key as before. | P0 | done |
| 0.15 | ✅ Escaping utility | `src/lib/escape.ts`; `svg.tsx`'s local copy removed in favor of the shared one. | P0 | done |
| 0.16 | ✅ Remove `runtime = 'edge'` | Dropped — the rewritten routes no longer declare it; all routes run on the Node runtime per **D2**. | P1 | done |
| 0.17 | Test harness | **Skipped per user instruction for this session** — revisit before Phase 1 ships. | P1 | skipped |
| 0.18 | ✅ Clear starter cruft | `layout.tsx` metadata replaced; `page.tsx` no longer the `create-next-app` template (full builder UI is Phase 1 task 1.7, this is just the placeholder swap). | P2 | done |

## ✅ Phase 1 — Port streak card + builder MVP (proves the loop end-to-end)

| # | Task | Details | Pri | Status |
| --- | --- | --- | --- | --- |
| 1.1 | ✅ Port streak card to TSX/SVG | `src/widgets/streak/StreakCard.tsx`: real SVG elements (Card/Divider/FadeIn/Ring primitives), gradient-capable background via the Card primitive, proportional scaling for non-default card_width/height, dynamic re-centering when a column is hidden. Legacy `svg.tsx` deleted. Verified against live data (DenverCoder1, torvalds). | P0 | done |
| 1.2 | ✅ Streak option expansion | Added `mode`, `exclude_days`, `timezone`, `starting_year`, `hide_total_contributions`, `hide_current_streak`, `hide_longest_streak`, per-widget `card_width`/`card_height` defaults (495×195). `short_numbers` is served by the already-generic `number_format=short\|long` common option instead of a duplicate param — same capability, one name. | P1 | done |
| 1.3 | ✅ Weekly streak mode | `calculateWeeklyStreaks` in `src/utils/streak.ts`: groups by Sun-Sat week, counts consecutive weeks with ≥1 contribution. Verified distinct from daily mode against live data (was silently returning identical numbers before a cache-key bug fix — see note below). | P1 | done |
| 1.4 | ✅ Exclude-days logic | Fixed twice: v1 unconditionally skipped excluded weekdays (including ones WITH a contribution), which could only ever shrink a streak — backwards from the intended "free pass" semantics. Corrected so a contribution always counts regardless of weekday; only a *lack* of contribution on an excluded day is forgiven. Verified monotonic (exclude_days only ever helps or leaves the streak unchanged) against live data. | P1 | done |
| 1.5 | ✅ Timezone-aware "today" | `todayDateKey(timezone)` uses `Intl.DateTimeFormat('en-CA', {timeZone})` to compute the calendar day in the requested IANA zone. | P1 | done |
| 1.6 | ✅ Mock data for streak | `src/widgets/streak/mock.ts`: deterministic "today"-relative sample history (unbroken recent run, a slump, a longer historical run) feeding a new `/api/widget/[type]/preview` route — no username, no GITHUB_TOKEN, no caching needed. | P0 | done |
| 1.7 | ✅ Builder page shell | `/build` (`src/app/build/`): options form (left) + live preview & copy-out (right). | P0 | done |
| 1.8 | ✅ Form control library | `OptionField.tsx` dispatches on schema type: text/number/select/checkbox/color (with a synced native color-picker)/comma-list, plus a dedicated weekday-toggle control for `exclude_days`. | P0 | done |
| 1.9 | ✅ Live preview (mock-backed) | Debounced (250ms) `<img>` pointed at `/api/widget/streak/preview`; sample-data notice shown under the preview. Confirmed zero calls to the real GitHub-backed endpoint while editing. | P0 | done |
| 1.10 | ✅ Theme picker | Searchable swatch grid (`ThemePicker.tsx`) over all 40 registry themes; selecting a theme clears any explicit color overrides so every color field reverts to following the new theme. | P0 | done |
| 1.11 | Advanced color panel | Solid-vs-gradient is handled generically (the `color` field free-text accepts a gradient string directly) and "Clear options" is implemented. The specific "Add property" per-theme-slot dropdown from the reference UI was **not** built — scoped out since our common `*_color` options already cover the slots exposed to users; revisit only if a widget needs a slot with no common-option mapping. | P1 | done (scoped down — see note) |
| 1.12 | ✅ Copy-out panel | `CopyPanel.tsx`: Markdown, HTML, HTML with a `prefers-color-scheme` `<picture>` block, raw URL, and a JSON-endpoint link, each with its own copy button. | P0 | done |
| 1.13 | ✅ `<picture>` generator | Explicit light/dark pairing table for themes with a known counterpart (default/dark, gruvbox/gruvbox-light, solarized, github-light/dark), falling back to default/dark generically otherwise. | P1 | done |
| 1.14 | ✅ Permalink / URL state | Debounced `history.replaceState` mirrors form state into the page's own query string (plus a `_widget` marker); `BuilderClient` seeds initial state from `useSearchParams()` on load, so deep links restore. | P1 | done |
| 1.15 | Streak unit tests | **Skipped per user instruction for this session.** Correctness was instead verified by hand against live GitHub data for every new option (mode, exclude_days monotonicity, timezone, starting_year) plus structural checks (divider count, hidden-column re-centering, gradient defs, no double-escaping) — see session notes. A real test suite covering these same cases is still needed before this phase can be considered fully closed. | P1 | skipped |

## ✅ Phase 2 — Stats overview + Top languages

| # | Task | Details | Pri | Status |
| --- | --- | --- | --- | --- |
| 2.1 | ✅ Extend GraphQL layer | `src/lib/githubStats.ts`: stars/forks (summed from up to 100 owned non-fork repos), PRs opened/merged, issues (open+closed), reviews, discussions started/answered, contributed-to repos, followers, current-year and (on request) all-time commits. Every field name verified against the live GraphQL API before writing the query, not guessed. | P0 | done |
| 2.2 | ✅ Rank algorithm | `src/lib/rank.ts`: weighted exponential/log-normal CDFs across commits/PRs/issues/reviews/stars/followers → 0-100 percentile (lower is better) → S/A+/A/A-/B+/B/B-/C+/C. Own published weights/medians (documented in-file) rather than unverifiable upstream constants — matches D6's *approach*, not a byte-for-byte copy. | P0 | done |
| 2.3 | ✅ Stats card widget | `src/widgets/stats/`: `hide`, `show` (reviews/discussions_started/discussions_answered/prs_merged/prs_merged_percentage), `show_icons` (original geometric glyph set, not a reproduced icon font), `hide_rank`, `rank_icon=default\|github\|percentile`, `include_all_commits`, `line_height`, `text_bold`, `ring_color`, `number_format`. Verified against live data incl. hide/show/theme/hide_rank combinations. | P0 | done |
| 2.4 | ✅ Language aggregation | `src/lib/languages.ts` + the query's per-repo `languages(first:10)`; first-100-repo limit documented in code. | P0 | done |
| 2.5 | ✅ Language ranking algorithm | `(bytes ^ size_weight) * (repo_count ^ count_weight)` in `aggregateLanguages`; verified `count_weight=1&size_weight=0` reorders results (CSS overtakes low-repo-count languages) against live data. | P1 | done |
| 2.6 | ✅ Top-langs: `normal` + `compact` | `src/widgets/top-langs/TopLangsCard.tsx`. | P0 | done |
| 2.7 | ✅ Top-langs: `donut`, `donut-vertical`, `pie` | `src/lib/arc.ts` (standard polar-to-cartesian pie/donut path geometry) + per-layout renderers; all 5 layouts verified rendering with distinct, correct viewBox/content against live data. | P1 | done |
| 2.8 | ✅ Top-langs options | `langs_count`, `hide`, `exclude_repo`, `hide_progress`, `card_width` (default 300), `custom_title` — verified `exclude_repo` and `langs_count` change output against live data. | P1 | done |
| 2.9 | ✅ Mock data both widgets | `src/widgets/stats/mock.ts`, `src/widgets/top-langs/mock.ts`; both feed the same `/api/widget/[type]/preview` route built in Phase 1. | P0 | done |
| 2.10 | ✅ Add to builder | `WIDGET_CATALOG` now lists all three widgets; added a working widget-type `<select>` to `BuilderClient` (previously a placeholder with no setter). Verified `/build?_widget=stats` and `?_widget=top-langs` both serve and list correctly. | P0 | done |
| 2.11 | Tests | **Skipped per user instruction for this session.** Verified instead by hand against live GitHub data: hide/show row selection, hide_rank, include_all_commits vs current-year, all 5 top-langs layouts, langs_count, exclude_repo, and the size_weight/count_weight ranking reorder. A real test suite for these cases (plus rank boundary values, which weren't hand-verified) is still needed. | P1 | skipped |

## ✅ Phase 3 — Repo & Gist pins → **MVP complete**

| # | Task | Details | Pri | Status |
| --- | --- | --- | --- | --- |
| 3.1 | ✅ Repo data fetch | `src/lib/githubRepo.ts`: `fetchRepoData("owner/name")` — description, isArchived/isTemplate/isFork, stars, forks, primaryLanguage+color. Verified query shape and the not-found error shape against the live GraphQL API before writing the fetch code. | P0 | done |
| 3.2 | ✅ Pin card widget | `src/widgets/pin/`: `PinCard.tsx` (repo icon, title, word-wrapped description, language dot, star/fork counts, archived/template/fork badges), `show_owner`, `description_lines_count` (1–3, auto-sized when omitted). | P0 | done |
| 3.3 | ✅ Gist data fetch + card | Gists aren't cleanly reachable by plain ID via GraphQL, so `fetchGistData` uses the REST API directly (verified shape live) instead of forcing a GraphQL-only architecture; `GistCard.tsx` lists files with a language-color dot (`src/lib/languageColors.ts`, since gists only report a language *name*, not a color, unlike repos). `show_owner` supported. | P1 | done |
| 3.4 | Repo-category theme variants | **Scoped out** — our theme model (8 core slots + extension-slot fallback, docs/PLAN.md §7 D4) already gives every widget type a consistent look from one preset without needing a separate `_repocard` palette family; pin/gist reuse the same core slots directly. Revisit only if a widget needs a slot with no reasonable core-slot mapping. | P1 | done (scoped down — see note) |
| 3.5 | ✅ Builder repo/gist inputs | Generalized the builder from a hardcoded "username" field to a per-widget `identifyingField` (`username`/`repo`/`id`) driving the input's label, placeholder, and copy-panel gating — pin/gist now get "Repository"/"Gist ID" fields instead of a username box that didn't apply to them. | P1 | done |
| 3.6 | ✅ Error-state cards | `WidgetRenderError` (`src/widgets/errors.ts`) carries a status + message from a widget's fetch/compute step; the handler renders a themed `ErrorCard` SVG (`src/components/card/ErrorCard.tsx`, word-wrapped, correct status code) for `format=svg` requests, or a plain-text error for `format=json`, applied uniformly to unknown-widget/validation/missing-field/upstream-failure cases across every widget, not just pin. Verified against a real 404 (nonexistent repo/gist) and a 400 (malformed repo, missing repo, invalid gist id). | P0 | done |
| 3.7 | Tests | **Skipped per user instruction for this session.** Verified instead against live data/API: malformed `repo=`, missing `repo=`, nonexistent repo (404), nonexistent gist (404), invalid gist id (400), long-description word wrapping with both auto and explicit `description_lines_count`. Not exercised: an actual private repo (structurally identical to the not-found path, since GitHub's API returns the same `NOT_FOUND` type for both, but not directly observed). | P1 | skipped |
| 3.8 | ✅ **MVP release prep** | Root `README.md` rewritten with all 5 widgets, embed examples, common + per-widget options, local dev, deploy. Landing page now links into the builder pre-selected for each widget type. `.env.example` already accurate; confirmed (again) `.env.local` is not git-tracked. | P0 | done |

## ✅ Phase 4 — Profile README builder (Pillar B) → **v1.0 core complete**

> **Moved ahead of widgets 5–15 per D8.** This is the differentiator, and it is worth more
> on top of four solid widgets than a fifth widget is worth with no builder. Building it
> now also de-risks multi-widget composition while the widget count is still small.

| # | Task | Details | Pri | Status |
| --- | --- | --- | --- | --- |
| 4.1 | ✅ Multi-widget composition | `/profile` (`src/app/profile/`): `ProfileConfig.widgets` is an array of `WidgetInstance` (type + identifying value + options), each rendered via a reused `WidgetInstanceEditor` (identifying-value input + collapsible options grid built from the widget's own schema, same `OptionField` the single-widget builder uses). Add/remove via a type `<select>`. | P0 | done |
| 4.2 | ✅ Drag-to-reorder + layout | `WidgetInstanceEditor` is `draggable`; native HTML5 drag events reorder `config.widgets` (`reorderWidgets`), with ↑/↓ buttons as a non-drag fallback. `layout: "stacked" \| "side-by-side"` and `align: "left" \| "center"` control both the live preview and the exported markdown's `<p align>` wrapping. | P0 | done |
| 4.3 | ✅ Shared theme lock | One `ThemePicker` sets `config.theme`; `widgetImageUrl`/`widgetPreviewUrl` (`src/app/profile/widgetUrl.ts`) force this theme onto every widget instance's URL, ignoring any per-widget theme value. | P0 | done |
| 4.4 | ✅ Identity & socials section | Name/bio fields; `SOCIAL_PLATFORMS` catalog (`src/app/profile/social.ts`, 13 platforms) renders each configured link as a shields.io badge (`src/app/profile/badges.ts`) linking to the platform URL — swaps to the native badge engine in Phase 8. | P1 | done |
| 4.5 | ✅ Tech-stack picker | `TECH_STACK` catalog (`src/app/profile/techstack.ts`, ~50 items across 7 categories) as a searchable-by-category toggle grid; emits shields.io badges now, swaps to the Phase 8 icon grid later. | P1 | done |
| 4.6 | ✅ Full README export | `buildReadmeMarkdown` (`src/app/profile/exportReadme.ts`) assembles name/bio/socials/tech-stack/widgets into one `README.md` string (copy-to-clipboard textarea); `ReadmePreview.tsx` renders the live equivalent beside it using each widget's mock-data preview endpoint. | P0 | done |
| 4.7 | ✅ Starter templates | `PROFILE_TEMPLATES` (`src/app/profile/templates.ts`): Minimal, Developer, Data Scientist, Open-Source Maintainer, Student — each seeds bio/socials/tech-stack/widgets/theme, layered on top of whatever username/name is already entered. | P1 | done |
| 4.8 | ✅ Save/share config | The whole `ProfileConfig` is JSON-serialized into the page's own `?c=` query param via debounced `history.replaceState` (mirrors the single-widget builder's permalink approach), so the URL is the save/share mechanism — no backend storage needed. | P2 | done |

Verified: `tsc --noEmit` and `next build` both clean; dev server smoke-tested — `/profile`, `/`, and every widget's `/api/widget/<type>/preview` endpoint (streak, stats, top-langs, pin, gist) return 200 with no server errors. Automated tests skipped per user instruction for this session, consistent with Phases 0–3.

## ✅ Phase 5 — i18n & delivery modes → **v1.0 complete**

| # | Task | Details | Pri | Status |
| --- | --- | --- | --- | --- |
| 5.1 | ✅ i18n infrastructure | `src/lib/i18n/`: `locales.ts` (registry + `isRtlLocale`), `catalog.ts` (label catalog), `translate.ts` (`t()` with English fallback), `dateFormat.ts` (pattern engine). `formatNumber()` (`src/lib/format.ts`) takes a locale for `number_format=long`'s `Intl`-grouped output. | P0 | done |
| 5.2 | ✅ Locale translations | 26 locales registered (correct number/date formatting via `Intl` for all of them); 12 fully hand-translated labels (`es fr de pt-BR it ru ja ko zh-CN ar hi tr`) — scoped down from "30" the same way the theme registry scoped to 40/170 (**D5**): hand-verified quality over mechanically-stubbed breadth, with a fallback-to-English architecture that costs nothing to extend later. | P1 | done (scoped — see note) |
| 5.3 | ✅ RTL layout mirroring | `<Card rtl>` mirrors the whole card (`translate(width,0) scale(-1,1)`); `<RtlMirror x={ownCoordinate}>` (`src/components/card/RtlMirror.tsx`) wraps individual text/icon nodes to cancel that flip locally (composing two reflections = a pure translation, proven to hold regardless of intervening translate groups — see the file's docstring and docs/PROJECT-DOCUMENTATION.md §6). Applied to all 5 widgets; verified structurally via a rendered Arabic streak card (correct mirrored transforms, correct Arabic month names via `Intl`). Decorative bars/pie slices are deliberately left unmirrored — their natural flip already produces correct RTL fill-direction/order. | P1 | done |
| 5.4 | ✅ Custom `date_format` | `src/lib/i18n/dateFormat.ts`: PHP `date()`-style tokens (`d j F M m n Y y`) + `[...]` conditional-year bracket, matching streak-stats' own convention (**D9**). Wired as the streak widget's `date_format` option (default `M j[, Y]`), with a presets dropdown + free-text override in the builder (`OptionField.tsx`). | P2 | done |
| 5.5 | ✅ GitHub Action | [`examples/github-actions/update-widget.yml`](../examples/github-actions/update-widget.yml): scheduled workflow that curls a widget's SVG and commits it into the user's own repo via the built-in `GITHUB_TOKEN` — zero runtime dependency on our uptime. | P0 | done |
| 5.6 | ✅ Builder emits workflow YAML | `src/app/build/workflowYaml.ts` + a new section in `CopyPanel.tsx`: generates the same workflow pre-filled with the user's actual widget URL and a suggested output path. | P1 | done |
| 5.7 | ✅ `format=json` everywhere | Already universal by construction — `WidgetDefinition.toJson` is a required field for every registered widget, and `handleWidgetRequest`/`handlePreviewRequest` branch on it generically. Verified via curl against all 5 widgets' `/preview` routes. | P1 | done |
| 5.8 | ✅ PNG output (deferred from 0.10) | `src/lib/render/png.ts` via `@resvg/resvg-js`; `serverExternalPackages` in `next.config.ts` (webpack can't bundle its native `.node` binary). `format=png` forces `disable_animations` (resvg rasterizes one static frame). New `renderedPngCache` (`src/lib/cache.ts`) since PNG output is a `Buffer`, not a `string`. Verified locally: all 5 widgets return valid PNGs at their correct dimensions. Not exercised inside a Linux container in this session (see docs/PROJECT-DOCUMENTATION.md §8). | P2 | done |
| 5.9 | ✅ Self-host docs + Docker | `Dockerfile` (multi-stage, Next's `output: "standalone"`) + `.dockerignore`; `WHITELIST` env var enforced in `src/widgets/handler.ts`'s `isWhitelisted()` (checked against `username`, or `repo`'s owner segment for the pin widget; not enforced for gists — no owner available without an extra fetch). `docker build`/`run` documented in the README; the standalone build artifact was verified to exist and start correctly, but the actual `docker build` was not run (no Docker daemon in this session). | P1 | done (Docker build unverified — see note) |
| 5.10 | ✅ Docs rewrite | [PROJECT-DOCUMENTATION.md](./PROJECT-DOCUMENTATION.md) fully rewritten — the previous version described the pre-Phase-0 prototype. Now covers the option-schema/theme/render/i18n/delivery-mode architecture through Phase 5, plus a Known Limitations section. | P0 | done |
| 5.11 | ✅ Root README rewrite | Added the `/profile` builder link, `format=png`, the Localization section, `date_format`, a Delivery Modes section, Docker self-hosting + `WHITELIST`, an FAQ (24 h contribution lag, first-100-repos ceiling), and a License/NOTICE section. | P0 | done |
| 5.12 | ✅ Back-compat regression check | Verified `/api/streak-svg` and `/api/streak` still delegate through unmodified code paths: `/api/streak` never calls `renderSvg` (JSON-only, unaffected by the new `locale`/`date_format` render props) and `/api/streak-svg` goes through `handleWidgetRequest`, where new options default to their pre-Phase-5 equivalents (`locale=en`, `date_format=M j[, Y]` ≈ the old hardcoded `"en-US"` short-date formatting) — confirmed both return identical status codes/shapes to `/api/widget/streak` with no `GITHUB_TOKEN` configured. Automated regression tests skipped per user instruction, consistent with Phases 0–4. | P0 | done (manual verification — see note) |
| 5.13 | ✅ `NOTICE` file | Root [`NOTICE`](../NOTICE): MIT + attribution to DenverCoder1/github-readme-streak-stats, anuraghazra/github-readme-stats, and ryo-ma/github-profile-trophy, per **D10**. | P1 | done |
| 5.14 | ✅ FAQ | Added to the README: the 24 h GitHub contribution-data lag and the first-100-repos aggregation ceiling (verified against the actual `first: 100` in `githubStats.ts` before documenting it as fact). | P1 | done |

Verified: `tsc --noEmit` and `next build` both clean throughout; dev-server smoke tests covered locale/RTL rendering (Arabic streak card inspected byte-for-byte), PNG output for all 5 widgets, and back-compat aliases. Automated tests skipped per user instruction for this session, consistent with Phases 0–4.

## ✅ Phase 6 — Contribution graphs

| # | Task | Details | Pri | Status |
| --- | --- | --- | --- | --- |
| 6.1 | ✅ Activity graph widget | `src/widgets/activity-graph/`: `days` (14-3650) controls the plotted range; `graph_style=line\|area\|bar`; `show_points`; `hide_grid`. `src/lib/activity.ts`'s `aggregateActivity()` buckets the same full contribution history the streak widget fetches (own cache namespace, per the existing per-widget-type cache convention) — every day in range contributes to a bucket even at 0, so zero-activity stretches show as a genuine dip rather than a gap. | P0 | done |
| 6.2 | ✅ Contribution heatmap | `src/widgets/heatmap/`: `src/lib/heatmap.ts`'s `buildHeatmapGrid()` builds `weeks` (4-260) Sun-Sat columns ending on the current week, quantized into a 5-level color scale by quartiles of the user's own non-zero days (adapts to how active they are, rather than fixed absolute thresholds) — rendered as accent-tinted (`#RRGGBBAA` alpha stops) cells over the theme's border/background slots, so any of the 40 presets works without a dedicated heatmap palette. Cell size (and the card's height) derives from `card_width`/`weeks` rather than being independently set. | P0 | done |
| 6.3 | ✅ Graph axis/label system | `src/lib/i18n/dateFormat.ts` gained `monthShortLabel`/`weekdayShortLabel` (UTC-anchored `Intl.DateTimeFormat`, consistent with the UTC day-key bucketing both widgets use). X-axis/month labels auto-thin to ≤6 evenly-spaced points on the activity graph; RTL support reuses the same `<Card rtl>` + `<RtlMirror>` mechanism as every other widget — verified on a rendered Arabic activity graph (correct mirrored transforms + correct Arabic label). | P1 | done |
| 6.4 | ✅ Animated variants | New shared primitive `src/components/card/DrawOnPath.tsx`: a `pathLength={100}` + `stroke-dasharray`/`stroke-dashoffset` `<animate>` "draws" the activity graph's line/area stroke on load — a plain SVG `<animate>` element (not a CSS `@keyframes` block) since the pathLength trick only works that way. `disabled` (from `disable_animations`, and forced automatically for `format=png` per Phase 5's existing PNG handling) renders the path fully drawn with no animation element. | P2 | done |
| 6.5 | ✅ Builder + mock data | `src/lib/mockContributions.ts`: a shared deterministic seasonal-wave generator (kept separate from the streak widget's own hand-shaped mock, so tuning one can't break the other) feeds both new widgets' `mock.ts`. Both added to `WIDGET_CATALOG` and verified serving at `/build?_widget=activity-graph` and `?_widget=heatmap`. | P0 | done |
| 6.6 | Tests | **Skipped per user instruction for this session.** Verified instead by hand: all 3 graph styles, `show_points`, `hide_grid`, `days` from 30 to 1000 (crossing all three auto-granularities), `weeks` from 20 to 53, `format=json`/`svg`/`png` for both widgets, and RTL rendering (`locale=ar`/`he`) — structurally inspected (element counts, transform values, integer card height) via curl against the dev server, not screenshot-verified. | P1 | skipped |

Verified: `tsc --noEmit` and `next build` clean; dev-server smoke tests covered both widgets across styles, locales (including RTL), and all three output formats (SVG/JSON/PNG). Automated tests skipped per user instruction, consistent with prior phases.

## Phase 7 — Trophies & profile summary family

| # | Task | Details | Pri | Status |
| --- | --- | --- | --- | --- |
| 7.1 | Trophy definitions | 6 standard (stars, commits, followers, issues, PRs, repos) + secret (multi-language, super-rank, new/ancient/long-time account, multi-org). Ranks `SSS SS S AAA AA A B C` + `UNKNOWN`/`SECRET`; thresholds adopted verbatim per **D7**. | P0 | todo |
| 7.2 | Trophy tile + next-rank bar | Title, rank, rank-title, value, progress-to-next-rank. | P0 | todo |
| 7.3 | Trophy grid options | `title=` filter, `rank=` filter/order, `column`, `row`, `margin-w`, `margin-h`, `no-bg`, `no-frame`. | P1 | todo |
| 7.4 | Profile summary card | Avatar (fetch, resize, base64-embed in `<pattern>`), name, followers/following, aggregate stats; `photo_quality`, `photo_resize`, `revert` layout flip, `{name}` title token. | P0 | todo |
| 7.5 | Repos-per-language card | | P1 | todo |
| 7.6 | Most-commit-language card | | P1 | todo |
| 7.7 | Productive-time card | Hour-of-day histogram + day-of-week activity. | P1 | todo |
| 7.8 | Builder + mock data | | P0 | todo |
| 7.9 | Tests | Tier boundaries, secret-trophy conditions, avatar fetch failure fallback. | P1 | todo |

## Phase 8 — Badges & icons

| # | Task | Details | Pri | Status |
| --- | --- | --- | --- | --- |
| 8.1 | Badge engine | `/api/widget/badges?name=a,b,c` composable rows; `column` (1–50), `size`, padding `p`, per-badge **theme cycling** from a comma list. | P0 | todo |
| 8.2 | User badge types | `visitors`, `repositories`, `followers`, `organization`, `languages`, `total-stars`, `total-contributors`, `total-commits`, `total-code-reviews`, `total-issues`, `total-pull-requests`, `total-joined-years`. | P0 | todo |
| 8.3 | Repo badge types | `stars`, `forks`, `contributors`, `issues`, `pull-requests`, `watchers`, `size`. | P1 | todo |
| 8.4 | Visitor counter | Persistent counter with **privacy-preserving IP hashing**. **Blocked on 10.1** (durable storage) — the only widget with that dependency. | P1 | blocked |
| 8.5 | Tech-icon grid | `name=` comma list, `columns` (1–50), index-mapped `color` list with fallback, `size`. | P1 | todo |
| 8.6 | Icon set + single-icon route | Bundled tech icon library; `/api/widget/icon/<name>`. | P1 | todo |
| 8.7 | Visual effects | `glow` and `wave` as a styling layer independent of theme. | P2 | todo |
| 8.8 | Builder support | Multi-select badge/icon pickers; swap Phase 4's shields.io fallback for the native engine. | P1 | todo |

## Phase 9 — Companion widgets

| # | Task | Details | Pri | Status |
| --- | --- | --- | --- | --- |
| 9.1 | Typing-animation header | `lines` (multi), `font`, `size`, `color`, `duration`, `pause`, `width`, `height`, `multiline`, cursor style. | P1 | todo |
| 9.2 | WakaTime card | `layout=default\|compact`, `display_format=time\|percent`, `api_domain` (Wakapi/Hakatime), `langs_count`, `hide_progress`. | P1 | todo |
| 9.3 | Quote / joke card | Bundled quote set; category + refresh-per-load. | P2 | todo |
| 9.4 | Gallery page | Style-taxonomy showcase (Minimal, Vivid, Retro, Animated, Badges, Icons) linking into the pre-configured builder. | P1 | todo |

## Phase 10 — Scaling & hardening

| # | Task | Details | Pri | Status |
| --- | --- | --- | --- | --- |
| 10.1 | Durable cache | Vercel KV or Redis; survives cold starts, shared across regions. Also unblocks 6.4. | P0 | todo |
| 10.2 | Multi-token rotation | Round-robin across `PAT_*` env vars. | P1 | todo |
| 10.3 | Scoping filters | `repo=`, `owner=`, `role=OWNER,ORGANIZATION_MEMBER,COLLABORATOR`, `commits_year=`. | P1 | todo |
| 10.4 | Theme registry expansion | Grow toward ecosystem parity (80–170 presets) + a docs page with previews. | P2 | todo |
| 10.5 | Rate-limit + abuse handling | Graceful themed error cards, backoff, per-IP throttle on uncached renders. | P1 | todo |
| 10.6 | Observability | Structured logs, render timings, cache hit rate, upstream error rates. | P2 | todo |
| 10.7 | Perf budget | Track cold-start and render time; target sub-second cached responses. | P2 | todo |

## Phase 11 — Explicitly deferred

Documented as out of scope so they aren't silently forgotten. Revisit only after v1.0.

| # | Item | Why deferred |
| --- | --- | --- |
| 11.1 | 3D contribution graph (10 style variants) | Needs a fundamentally different renderer + an Action-based pipeline. |
| 11.2 | Spotify now-playing card | Requires per-user Spotify OAuth. |
| 11.3 | Medium / StackOverflow / LinkedIn / Twitter cards | Each is a separate third-party integration. |
| 11.4 | Stargazer / forker roster images | Unbounded avatar fetching; heavy and slow. |
| 11.5 | Metrics-style isocalendar plugin suite | Very large surface; the upstream project does it well already. |
| 11.6 | npm downloads / YouTube / GoodReads / PageSpeed cards | Long tail; add on demand. |
