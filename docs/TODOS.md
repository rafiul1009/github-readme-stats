# TODOs — Universal GitHub Profile & Stats Widget Generator

Phase-by-phase task breakdown. Rationale for every decision is in [PLAN.md](./PLAN.md).

**Status values**: `todo` · `doing` · `done` · `blocked`
**Priority**: P0 (blocks the phase) · P1 (needed for the phase to be complete) · P2 (nice to have)

**Shipping milestones**
- **MVP** = Phases 0–3 (streak + stats + top-langs + pins, working widget builder, copy-out)
- **v1.0** = Phases 0–5 (adds the profile README builder, i18n, and delivery modes)
- **v1.5+** = Phases 6–10 (remaining widgets, scaling); Phase 11 is explicitly out of scope

Phase order reflects **D8**: the profile README builder ships before widgets 5–15, because
it is the differentiator and is worth more atop four widgets than a fifth widget is worth
without it.

---

## Phase 0 — Foundations (blocks everything)

| # | Task | Details | Pri | Status |
| --- | --- | --- | --- | --- |
| 0.1 | Declarative option schema | `src/lib/options/`: a typed schema format (name, type, default, min/max, enum, description) that one declaration drives — API parsing, UI form controls, docs tables, URL building. **Keystone of the whole design.** | P0 | todo |
| 0.2 | Option parser + validator | Coercion, clamping, enum validation, comma-list parsing, sane errors for bad input. | P0 | todo |
| 0.3 | Color value parser | `src/lib/color.ts`: 6-digit hex, 8-digit hex with alpha, CSS color names, gradient `angle,c1,...,cN`. | P0 | todo |
| 0.4 | Theme slot model | Shared core slots (`background`, `border`, `title`, `text`, `icon`, `accent`, `stroke`, `muted`) + optional widget-specific slots with fallback to core. Get this right or every new widget touches every theme. | P0 | todo |
| 0.5 | Theme registry (initial 40) | `src/lib/themes/`: port the most-used presets (default, dark, radical, merko, gruvbox, tokyonight, onedark, cobalt, synthwave, dracula, nord, catppuccin×4, github-*, transparent, highcontrast, …). | P0 | todo |
| 0.6 | Theme override resolution | Layered merge: widget defaults → preset → per-slot overrides → structural options. | P0 | todo |
| 0.7 | SVG render pipeline | `src/lib/render/svg.ts`: TSX→SVG via `renderToStaticMarkup` (`react-dom/server`), SVG document shell, `<defs>`/`<style>` injection. Per **D1**. | P0 | todo |
| 0.8 | Drop `satori` + `@vercel/og` | Remove both from `package.json` — unused, and superseded by D1. | P0 | todo |
| 0.9 | Shared JSX primitives | `src/components/card/`: `Card`, `Row`, `Stat`, `Ring`, `Bar`, `Divider`, `Icon`, `Title` — all theme-slot driven. | P0 | todo |
| 0.10 | ~~PNG output~~ | **Moved to Phase 7 per D3** — PNG is the only format needing font binaries + a native `resvg` build. SVG + JSON are first-class. | — | n/a |
| 0.11 | Two-tier cache | `src/lib/cache.ts`: raw-data cache (by username + query shape) + rendered-output cache (by full normalized options). Document the serverless cold-start limitation + KV upgrade path. | P0 | todo |
| 0.12 | `cache_seconds` param | Per-request cache header control, clamped 21600–86400. | P2 | todo |
| 0.13 | Unified widget route | `src/app/api/widget/[type]/route.ts` dispatcher + widget registry. | P0 | todo |
| 0.14 | Back-compat aliases | `/api/streak-svg` and `/api/streak` keep working, delegating to the new dispatcher. Non-negotiable — existing embeds must not break. | P0 | todo |
| 0.15 | Escaping utility | Extract `escapeXml` from `svg.tsx` into `src/lib/escape.ts`; enforce for every user-controlled string. | P0 | todo |
| 0.16 | Remove `runtime = 'edge'` | Node runtime on all routes per **D2**; rely on `Cache-Control` + CDN for latency. | P1 | todo |
| 0.17 | Test harness | Vitest + a snapshot helper for SVG output. No test runner exists today. | P1 | todo |
| 0.18 | Clear starter cruft | Replace `create-next-app` boilerplate in `page.tsx` / `layout.tsx` metadata. | P2 | todo |

## Phase 1 — Port streak card + builder MVP (proves the loop end-to-end)

| # | Task | Details | Pri | Status |
| --- | --- | --- | --- | --- |
| 1.1 | Port streak card to TSX/SVG | Convert the template literal in `svg.tsx` to SVG-emitting TSX. Layout, ring, fire icon and `@keyframes` all carry over directly — no flexbox re-expression needed (D1). Visual-diff against current output. | P0 | todo |
| 1.2 | Streak option expansion | Add `mode=daily\|weekly`, `exclude_days`, `timezone`, `starting_year`, `hide_total_contributions`, `hide_current_streak`, `hide_longest_streak`, `card_width`, `card_height`, `short_numbers`, `disable_animations`. | P1 | todo |
| 1.3 | Weekly streak mode | Streak counts a Sun–Sat week with ≥1 contribution. Non-trivial logic change in `streak.ts`. | P1 | todo |
| 1.4 | Exclude-days logic | Excluded weekdays don't break a streak and don't count toward it. | P1 | todo |
| 1.5 | Timezone-aware "today" | Current code uses UTC day keys; honor an IANA `timezone` param for the streak boundary. | P1 | todo |
| 1.6 | Mock data for streak | `widgets/streak/mock.ts` — sample dataset for instant, API-free preview. | P0 | todo |
| 1.7 | Builder page shell | `/build`: options form (left) + preview & copy-out (right), driven by the Phase 0 option schema. | P0 | todo |
| 1.8 | Form control library | Render controls automatically from option schema types: text, number, select, checkbox, color, comma-list, weekday-picker. | P0 | todo |
| 1.9 | Live preview (mock-backed) | Instant re-render from sample data on every change, with the "these are sample stats" notice. **No API calls while editing.** | P0 | todo |
| 1.10 | Theme picker | Searchable swatch grid (needed at 40+ themes); selecting a theme repopulates all color pickers client-side from embedded palette data. | P0 | todo |
| 1.11 | Advanced color panel | "Add property" dropdown + `+` to add a picker per theme slot; solid-vs-gradient background radio; "Clear options". | P1 | todo |
| 1.12 | Copy-out panel | Separate copy buttons: Markdown, HTML, `<picture>` dark-mode block, raw URL, JSON. | P0 | todo |
| 1.13 | `<picture>` generator | Auto-pair the chosen theme with a light/dark counterpart for `prefers-color-scheme`. | P1 | todo |
| 1.14 | Permalink / URL state | Builder options mirrored into the page query string; deep links restore state. | P1 | todo |
| 1.15 | Streak unit tests | Daily/weekly modes, exclude-days, timezone boundaries, zero-contribution, gap-in-middle, contributed-today-vs-yesterday. | P1 | todo |

## Phase 2 — Stats overview + Top languages

| # | Task | Details | Pri | Status |
| --- | --- | --- | --- | --- |
| 2.1 | Extend GraphQL layer | Stars, commits, PRs (opened/merged), issues, reviews, discussions, contributed-to repos, followers. | P0 | todo |
| 2.2 | Rank algorithm | `src/lib/rank.ts`: weighted percentile → S/A+/A/A-/B+/B/B-/C+/C. Publish the formula in docs. | P0 | todo |
| 2.3 | Stats card widget | `hide=stars,commits,prs,issues,contribs`; `show=reviews,discussions_started,discussions_answered,prs_merged,prs_merged_percentage`; `show_icons`, `hide_rank`, `rank_icon=default\|github\|percentile`, `include_all_commits`, `line_height`, `text_bold`, `ring_color`, `number_format`. | P0 | todo |
| 2.4 | Language aggregation | Per-repo language bytes + repo counts, aggregated; first-100-repo limit documented. | P0 | todo |
| 2.5 | Language ranking algorithm | `(bytes ^ size_weight) * (repo_count ^ count_weight)`, exposed via `size_weight` / `count_weight`. | P1 | todo |
| 2.6 | Top-langs: `normal` + `compact` | Bar list and stacked-bar-with-legend layouts. | P0 | todo |
| 2.7 | Top-langs: `donut`, `donut-vertical`, `pie` | Multi-segment arc rendering via `<path>`/`<circle>` — available directly under D1. | P1 | todo |
| 2.8 | Top-langs options | `langs_count` (1–20), `hide` (languages), `exclude_repo`, `hide_progress`, `card_width`, `custom_title`. | P1 | todo |
| 2.9 | Mock data both widgets | Sample datasets for preview. | P0 | todo |
| 2.10 | Add to builder | Widget selector gains both; schema-driven forms render automatically. | P0 | todo |
| 2.11 | Tests | Rank boundaries, language percentage math, weight algorithm, hide/show parsing. | P1 | todo |

## Phase 3 — Repo & Gist pins → **MVP complete**

| # | Task | Details | Pri | Status |
| --- | --- | --- | --- | --- |
| 3.1 | Repo data fetch | `owner/repo`: name, description, language + color, stars, forks, archived/template badges. | P0 | todo |
| 3.2 | Pin card widget | GitHub-native repo-pin visual language; `show_owner`, `description_lines_count` (1–3). | P0 | todo |
| 3.3 | Gist data fetch + card | Gist by id; `show_owner`. | P1 | todo |
| 3.4 | Repo-category theme variants | Repo/gist cards use `_repocard` theme slot variants (per stats-extended's category model). | P1 | todo |
| 3.5 | Builder repo/gist inputs | `owner/repo` and gist-id fields shown conditionally by widget type. | P1 | todo |
| 3.6 | Error-state cards | Render a proper themed error card (not a 500 text body) for missing/private/malformed targets — an `<img>` cannot show text errors. | P0 | todo |
| 3.7 | Tests | Malformed `repo=`, missing repo, private repo, long descriptions. | P1 | todo |
| 3.8 | **MVP release prep** | Docs for shipped widgets, landing page, deploy, `.env.example`, untrack `.env.local`. | P0 | todo |

## Phase 4 — Profile README builder (Pillar B)

> **Moved ahead of widgets 5–15 per D8.** This is the differentiator, and it is worth more
> on top of four solid widgets than a fifth widget is worth with no builder. Building it
> now also de-risks multi-widget composition while the widget count is still small.

| # | Task | Details | Pri | Status |
| --- | --- | --- | --- | --- |
| 4.1 | Multi-widget composition | Pick several widgets, configure each, arrange them. | P0 | todo |
| 4.2 | Drag-to-reorder + layout | Side-by-side vs stacked; alignment; consistent widths across stacked cards. | P0 | todo |
| 4.3 | Shared theme lock | One theme applied across all selected widgets so a README looks coherent. | P0 | todo |
| 4.4 | Identity & socials section | Name, bio, social links → shields.io badge row (own badge engine arrives in Phase 8). | P1 | todo |
| 4.5 | Tech-stack picker | Searchable picker; emits shields.io badges now, swaps to the Phase 8 icon grid later. | P1 | todo |
| 4.6 | Full README export | Emit a complete `README.md` with live rendered preview beside it. | P0 | todo |
| 4.7 | Starter templates | Minimal, Developer, Data Scientist, OSS Maintainer, Student. | P1 | todo |
| 4.8 | Save/share config | Encode the whole profile config in a shareable URL. | P2 | todo |

## Phase 5 — i18n & delivery modes → **v1.0**

| # | Task | Details | Pri | Status |
| --- | --- | --- | --- | --- |
| 5.1 | i18n infrastructure | `src/lib/i18n/`: label catalogs, locale-aware date + number formatting. | P0 | todo |
| 5.2 | 30 locale translations | GRS parity set. | P1 | todo |
| 5.3 | RTL layout mirroring | Mirror positions, not just strings. | P1 | todo |
| 5.4 | Custom `date_format` | Bracket syntax for conditional year (`M j[, Y]`), plus presets in the builder. | P2 | todo |
| 5.5 | GitHub Action | Renders the widget and commits the SVG to a user's profile repo — zero runtime dependency on our uptime. | P0 | todo |
| 5.6 | Builder emits workflow YAML | Copy-out tab producing a ready `.github/workflows/*.yml`. | P1 | todo |
| 5.7 | `format=json` everywhere | Short-circuit rendering; return raw stats. | P1 | todo |
| 5.8 | PNG output (deferred from 0.10) | `src/lib/render/png.ts` via `resvg-js`, Node-only, bundled fonts, animations auto-disabled. Per **D3**. | P2 | todo |
| 5.9 | Self-host docs + Docker | Dockerfile, Vercel guide, `WHITELIST` env to restrict served usernames. | P1 | todo |
| 5.10 | Docs rewrite | Replace the stale [PROJECT-DOCUMENTATION.md](./PROJECT-DOCUMENTATION.md); auto-generate option tables from the Phase 0 schemas. | P0 | todo |
| 5.11 | Root README rewrite | Currently a stub; needs usage + embed examples per widget. | P0 | todo |
| 5.12 | Back-compat regression tests | Old streak URLs still render identically. | P0 | todo |
| 5.13 | `NOTICE` file | Attribution per **D10** (MIT + credits to upstream projects). | P1 | todo |
| 5.14 | FAQ | Document the 24 h contribution lag and the first-100-repos ceiling before users report them as bugs. | P1 | todo |

## Phase 6 — Contribution graphs

| # | Task | Details | Pri | Status |
| --- | --- | --- | --- | --- |
| 6.1 | Activity graph widget | Contributions-over-time line/area chart; configurable date range, point/line/area style, grid toggle. | P0 | todo |
| 6.2 | Contribution heatmap | GitHub-style calendar grid; color-scale driven by theme slots. | P0 | todo |
| 6.3 | Graph axis/label system | Month/day labels, locale-aware, RTL-safe. | P1 | todo |
| 6.4 | Animated variants | Opt-in draw-on animation via `<animate>`; disabled for PNG. | P2 | todo |
| 6.5 | Builder + mock data | | P0 | todo |
| 6.6 | Tests | Range boundaries, empty history, single-day history. | P1 | todo |

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
