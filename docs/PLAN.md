# Plan — Universal GitHub Profile & Stats Widget Generator

> Supersedes the earlier draft of this plan, which surveyed only the stats-card
> subset of the reference projects and wrongly dismissed the non-card widgets
> (activity graphs, badges, icons, typing headers, profile summary cards, 3D
> contribution graphs) as "adjacent products". They are the majority of what
> people actually put in a profile README, and they are in scope.

---

## 1. Where we are today

The project is named `github-readme-stats` but currently ships **one** card: a
contribution streak card.

| Area | Current state |
| --- | --- |
| Framework | Next.js 15.3.1 (App Router), React 19, TypeScript strict, Tailwind v4 |
| Cards | Streak only |
| Endpoints | `GET /api/streak` (JSON), `GET /api/streak-svg` (SVG, `runtime = 'edge'`) |
| Rendering | Hand-written SVG template literal in [src/components/svg.tsx](../src/components/svg.tsx) |
| Themes | 2 (`light`, `dark`), hardcoded, 6 color slots |
| Options | `username`, `theme`, `font` — that is all |
| Data | [src/lib/github.ts](../src/lib/github.ts) — aliased per-year GraphQL sub-queries covering full account history |
| Streak logic | [src/utils/streak.ts](../src/utils/streak.ts) — correct UTC day-key walk for current + longest streak |
| Cache | Module-level `Map`, 1 h TTL, keyed by username only (not by render options) |
| Web UI | **None** — [src/app/page.tsx](../src/app/page.tsx) is the unmodified `create-next-app` starter |
| Unused deps | `satori`, `@vercel/og` installed but never imported |

Note the existing docs file ([PROJECT-DOCUMENTATION.md](./PROJECT-DOCUMENTATION.md)) is
**stale**: it describes bugs that have since been fixed (streak miscalculation, missing
XML escaping, 12-month-only history). The data and streak layers are in good shape. The
gaps are breadth (one card), customization (two themes), and the complete absence of a
user-facing generator.

---

## 2. Reference project survey (all 10 folders)

### 2.1 Generators (services that render widgets)

#### `github-readme-streak-stats-main` — DenverCoder1, PHP
The direct ancestor of this project, and **the single most important reference**.

- **166 themes**, each an 11-slot per-element palette: `background`, `border`, `stroke`,
  `ring`, `fire`, `currStreakNum`, `sideNums`, `currStreakLabel`, `sideLabels`, `dates`,
  `excludeDaysLabel`. Every slot is independently overridable by query param, applied
  *on top of* the selected theme.
- **60+ locales** with full translation files ([src/translations.php]), plus locale-aware
  date and number formatting.
- Options far beyond ours: `mode=daily|weekly` (weekly = contribute once per Sun–Sat week),
  `exclude_days=Sun,Sat` (weekend days don't break a streak), `timezone` (IANA),
  `date_format` with a bracket syntax for conditional year (`M j[, Y]`),
  `short_numbers` (1.5k vs 1,500), `starting_year`, `card_width`, `card_height`,
  `hide_total_contributions` / `hide_current_streak` / `hide_longest_streak`,
  `border_radius`, `hide_border`, `disable_animations`, `type=svg|png|json`.
- `background` accepts a hex, a **CSS color name**, or a gradient `angle,c1,...,cN`.
- **`src/demo/` is a live card generator UI** — the exact thing we need to build. Its
  design is documented in §5.
- **GitHub Actions delivery mode**: an action renders the SVG and commits it into the
  user's profile repo, so their README does not depend on a public endpoint's uptime.
- `WHITELIST` env var restricts which usernames a self-hosted instance will serve.
- Docker + Heroku + Vercel deploy paths; Inkscape used for PNG rasterization.

#### `github-readme-stats-fast-main` — fork of anuraghazra/github-readme-stats
The canonical stats-card project; **77 themes**.

- **Card types**: Stats, Top Languages, WakaTime, Repo Pin, **Gist Pin**, Streak.
- **Common options** (every card): `title_color`, `text_color`, `icon_color`,
  `border_color`, `bg_color` (hex or `DEG,C1,...,C10` gradient), `hide_border`, `theme`,
  `cache_seconds` (21600–86400), `locale` (30 locales), `border_radius`.
- **Stats card**: `hide=stars,commits,prs,issues,contribs`,
  `show=reviews,discussions_started,discussions_answered,prs_merged,prs_merged_percentage`,
  `hide_title`, `card_width`, `hide_rank`, `rank_icon=default|github|percentile`,
  `show_icons`, `include_all_commits`, `line_height`, `exclude_repo`, `custom_title`,
  `text_bold`, `disable_animations`, `ring_color`, `number_format=short|long`.
- **Top languages**: 5 layouts — `normal`, `compact`, `donut`, `donut-vertical`, `pie`;
  `langs_count` (1–20), `exclude_repo`, `hide` (languages), `hide_progress`, `card_width`,
  and a tunable ranking algorithm
  `ranking_index = (byte_count ^ size_weight) * (repo_count ^ count_weight)`.
- **WakaTime**: `layout=default|compact`, `display_format=time|percent`, `api_domain`
  (so self-hosted Wakapi/Hakatime work), `langs_count`, `line_height`, `hide_progress`.
- **Pin**: `show_owner`, `description_lines_count` (1–3). **Gist**: `show_owner`.
- Documents both GitHub dark-mode techniques: the `#gh-dark-mode-only` URL suffix and the
  `<picture>` + `prefers-color-scheme` element.
- Two-tier caching (raw data micro-cache + rendered-SVG cache keyed by normalized params)
  and **multi-token round-robin** across all `PAT_*` env vars for rate-limit headroom.

#### `github-stats-extended-master` — monorepo successor fork
URL-compatible with upstream; `packages/core` + `apps/backend` + `apps/frontend` (Astro +
React + Redux).

- Adds heavy **scoping** params the others lack: `repo=owner/name[,...]`,
  `owner=user_or_org[,...]`, `role=OWNER,ORGANIZATION_MEMBER,COLLABORATOR`,
  `commits_year=YYYY` — lets a user show "my stats *within this org* only".
- Extra `show=` values: `prs_authored`, `prs_commented`, `prs_reviewed`,
  `issues_authored`, `issues_commented`.
- **`apps/frontend/src/wizard/` is a staged card wizard** — the second UX blueprint,
  detailed in §5. Notably it renders previews from **`mockData/*.json`**, not live API calls.

#### `github-readme-profile-master` — FajarKim, TypeScript/Vercel
A single **profile summary card** (avatar + name + follower/following + stat list).

- `format=svg|png|json|xml` — four output formats.
- Colors: `title_color`, `text_color`, `icon_color`, `border_color`, `bg_color`
  (solid, gradient, or **8-digit alpha hex** e.g. `00000000` for transparency),
  `stroke_color`, `username_color`.
- `title` supports a **`{name}` template token**; `locale` with **RTL layout mirroring**
  (X coordinates flip based on `isRtl`); `revert` mirrors the whole layout;
  `border_width`, `border_radius`, `hide_border`, `hide_stroke`, `disabled_animations`.
- `hide=repos,stars,forks,commits,prs,prs_merged,issues,contributed`;
  `show=reviews,issues_closed,discussions_started,discussions_answered`.
- `photo_quality`, `photo_resize` — avatar fetched, resized via `sharp`, embedded as a
  base64 JPEG inside an SVG `<pattern>`.
- Output minified with `html-minifier-terser`.

#### `github-stats-latest` — pphatdev, Express + Postgres/SQLite + Redis
Broadest surface of all the references; a general "dev graphics API".

- **Endpoints**: `/stats`, `/badges`, `/icons`, `/graphs`, `/languages`, `/users`, `/health`.
- **Badge system** — `/badges?username=&repo=&name=a,b,c&theme=t1,t2&effect=&column=&size=&p=`:
  - User badges: `visitors`, `repositories`, `followers`, `organization`, `languages`,
    `total-stars`, `total-contributors`, `total-commits`, `total-code-reviews`,
    `total-issues`, `total-pull-requests`, `total-joined-years`.
  - Repo badges: `stars`, `forks`, `contributors`, `issues`, `pull-requests`, `watchers`, `size`.
  - Themes **cycle per badge** when a comma list is given. `realtime=true` bypasses cache
    with a 30 s cooldown.
- **Icon grids** — `/icons?name=react,typescript,github&columns=3&color=<index-mapped list>&effect=glow|wave&size=`,
  plus single icons `/icons/react?color=&glow=&glowColor=`.
- **Stats card** extras: `size=small|medium|large`, `avatar_mode=radar`,
  `data_border_style=frame`, `data_border_frame=out`, `hide_title`, `hide_rank`.
- **Contribution graph** endpoint with animated variants.
- Multi-tier cache **Memory → Redis → Source** (2 h default TTL); clustered Express workers;
  visitor counting via **privacy-preserving IP hashing**; WebP/PNG/GIF export;
  mirrored deployment domains for load balancing.

#### `github-trophies-main` — fork of ryo-ma/github-profile-trophy, Deno/TS
- **12 trophies**: `TotalStar`, `TotalCommit`, `TotalFollower`, `TotalIssue`,
  `TotalPullRequest`, `TotalRepository`, plus secret ones — `MultipleLang`,
  `AchieveSuperRank`, `NewAccount`, `AncientAccount`, `LongTimeAccount`,
  `MultipleOrganizations`.
- **Ranks**: `SSS SS S AAA AA A B C` + `UNKNOWN` + `SECRET`; each tile shows title, rank,
  rank-title, value, and a **progress bar toward the next rank**.
- Options: `title=` (filter), `rank=` (filter/order), `column`, `row`, `theme`
  (~24 themes: dracula, flat, onedark, gruvbox, monokai, nord, discord, chalk, alduin,
  darkhub, juicyfresh, oldie, buddhism, radical, onestar, algolia, gitdimmed, tokyonight,
  matrix, apprentice, dark_dimmed, dark_lover, catppuccin), `margin-w`, `margin-h`,
  `no-bg`, `no-frame`.

### 2.2 Consumers (profile READMEs showing what people actually embed)

`Ahtisham-1214-main`, `formidablae-main`, `walidbosso-main` — three real profile READMEs.
Extracting their embedded services gives the **true widget demand list**:

| Widget | Service seen |
| --- | --- |
| Stats / top-langs / pin / wakatime cards | `github-readme-stats.vercel.app` |
| Streak card | `streak-stats.demolab.com` |
| **Profile summary cards** (4 variants) | `github-profile-summary-cards.vercel.app/api/cards/{profile-details, repos-per-language, most-commit-language, productive-time}` |
| **Contribution activity graph** | `github-readme-activity-graph.vercel.app/graph` |
| **Trophies** | `github-profile-trophy.vercel.app` |
| **3D contribution graph** — 10 style variants (`gitblock`, `green`, `green-animate`, `night-green`, `night-rainbow`, `night-view`, `season`, `season-animate`, `south-season`, `south-season-animate`) | `profile-3d-contrib` (GitHub Action, commits SVG) |
| **Isocalendar / metrics** | `lowlighter/metrics` (GitHub Action, commits SVG) |
| **Typing animation header** | `readme-typing-svg.demolab.com` (`font`, `size`, `duration`, `pause`, `multiline`, `width`, `height`, `lines`, `color`) |
| **Visitor counter** | `hits.seeyoufarm.com`, `komarev.com/ghpvc` |
| **Stargazer / forker roster** | `reporoster.com/stars|forks/<theme>/<user>/<repo>` |
| **Spotify now-playing** | `spotify-github-profile.vercel.app/api/view` |
| Tech-stack badges | `img.shields.io`, `custom-icon-badges.demolab.com` |
| Contributor stats | `github-contributor-stats.vercel.app` |

`awesome-github-profile-readme-master` is a curated directory (no code) that supplies two
things: a **style taxonomy** for a gallery page (GitHub Actions, Game Mode, Code Mode,
Dynamic Realtime, Descriptive, Typing Mode, Anime, Minimalistic, GIFs, Badges, Fancy
Fonts, Icons, Retro) and a **tools list** naming further widget categories we should know
about: README quotes, dev jokes, random memes, npm download counts, YouTube channel stats,
GoodReads current book, Medium/StackOverflow/LinkedIn/Twitter cards, PageSpeed scores,
blog-post RSS injection, and — importantly — two **full profile README generators**
(`rahuldkjain/github-profile-readme-generator`, `rishavanand/github-profilinator`) that
assemble an entire README from GUI components rather than emitting a single card.

---

## 3. Product vision

Two pillars, not one.

### Pillar A — Widget engine
A single service rendering **many** widget types from one shared theme/option/cache/render
core, so every widget gets every theme and every color override for free, and stacked
widgets in a README look like one coherent set.

### Pillar B — Profile README builder
The "profile generator" half of the request: a user picks widgets, arranges them, fills in
their social links and tech stack, and copies out **a complete README.md** — not just one
`<img>` tag. This is what `rahuldkjain`'s generator and Profilinator do, and no single
reference project combines it with a first-party widget engine. **That combination is our
differentiator.**

### Widget catalogue

Tier 1 — core GitHub data (must have):
1. **Streak card** (exists; port + expand)
2. **Stats overview card** + rank
3. **Top languages card** (5 layouts)
4. **Repo pin card** / **Gist pin card**
5. **Contribution activity graph** (line/area over time)
6. **Contribution heatmap / calendar**

Tier 2 — differentiated:
7. **Trophy case** (tiered ranks + next-rank progress + secret trophies)
8. **Profile summary card** (avatar + identity + aggregate stats)
9. **Profile detail family**: repos-per-language, most-commit-language, productive-time
   (hour-of-day histogram), day-of-week activity
10. **Composable badge rows** (12 user + 7 repo badge types, per-badge theme cycling)
11. **Tech-icon grid** (index-mapped colors, `glow`/`wave` effects)

Tier 3 — companion widgets that make a README feel complete:
12. **Typing-animation header SVG**
13. **Visitor counter badge** (privacy-preserving IP hashing)
14. **WakaTime card** (with `api_domain` for self-hosted Wakapi/Hakatime)
15. **Quote / joke card**

Explicitly deferred (documented, not built): 3D contribution graph (needs a GitHub Action
pipeline and a very different renderer), Spotify/Medium/StackOverflow/LinkedIn cards (each
needs a separate third-party OAuth integration), repo roster images.

---

## 4. Customization system

The reference projects converge on a model we should adopt wholesale.

**Layered resolution**, in order:
1. Widget defaults →
2. Named preset theme (`?theme=`) →
3. Individual color overrides (any theme slot, by name) →
4. Structural options (`hide`, `show`, layout, sizes, titles).

**Theme registry.** Target **80–170 presets** (match the ecosystem, don't ship 25).
Themes must be per-element palettes, not a generic bg/text/accent triple: the streak card
alone needs 11 slots. Define a **shared core slot set** (`background`, `border`, `title`,
`text`, `icon`, `accent`, `stroke`, `muted`) that every widget consumes, plus optional
widget-specific slots (`ring`, `fire`, `currStreakNum`, …) that fall back to core slots
when a theme doesn't define them. This is what lets 170 themes work across 15 widgets
without writing 2,550 palettes.

**Color values** accept: 6-digit hex, **8-digit hex with alpha**, CSS color names, and for
backgrounds a gradient `angle,color1,...,colorN`.

**Universal options** on every widget: `theme`, `bg_color`, `title_color`, `text_color`,
`icon_color`, `border_color`, `border_radius`, `border_width`, `hide_border`,
`hide_title`, `custom_title` (with `{name}`/`{username}` tokens), `card_width`,
`card_height`, `disable_animations`, `locale`, `number_format=short|long`,
`cache_seconds`, `format=svg|png|json`.

**Localization**: `locale` drives label translations, date formats, and number formats.
Target ~30 locales at launch (GRS parity) with the architecture supporting the 60+ that
streak-stats has. **RTL support must mirror layout**, per `github-readme-profile`'s
approach — not just swap the strings.

---

## 5. UX design — the generator

Both reference generator UIs (streak-stats `src/demo/`, stats-extended `wizard/`) agree on
the important decisions:

**Critical insight — preview from sample data.** Both render the live preview from
**mock/sample data**, not real API calls, and label it ("The stats above are just examples
and not from your GitHub profile"). This is what makes a live-updating options form
viable without destroying your rate limit. We will do the same: the preview is instant and
free, and only the final copied URL hits real data.

**Layout**: options form on the left, preview + copy-out panel on the right.

**Flow** (adapted from the stats-extended wizard's stages): `Select Widget →
Customize Parameters → Choose Theme → Display & Copy`, but non-linear — a returning user
should be able to jump straight to any step. No login (stats-extended has a login stage;
we don't need one).

**Theme picker mechanics** (from streak-stats demo): each theme option carries its full
palette as data attributes, so selecting a theme *instantly repopulates every color
picker* client-side with no server round-trip — and the user can then tweak individual
slots from there. Combine with a visual swatch grid, searchable (170 themes needs search),
and a "surprise me" random button.

**Advanced panel**: an "Add property" dropdown + `+` button that dynamically adds a color
picker for any theme slot (rather than showing 11 pickers up front), a solid-vs-gradient
background radio, "Clear options", and config export.

**Copy-out panel** offers, as separate one-click copies:
- Markdown `![Alt](url)`
- HTML `<img>`
- **`<picture>` block with `prefers-color-scheme`** light/dark variants (auto-generated
  from the chosen theme + its light/dark counterpart)
- Raw URL
- JSON (the underlying stats)

**Permalink**: builder state lives in the page's own query string so configurations are
shareable and bookmarkable.

**Landing/gallery page**: widgets grouped by the awesome-list style taxonomy (Minimal,
Vivid, Retro, Animated, Badges, Icons), each example clicking through into the builder
pre-configured.

**Profile builder page** (Pillar B): pick multiple widgets, drag to reorder, add a typing
header, social badges, and a tech-stack icon row, then export one complete `README.md`
with a live rendered preview beside it. Ship 3–5 starter templates (Minimal, Developer,
Data Scientist, Open-Source Maintainer, Student).

---

## 6. Architecture

```
src/
  app/
    api/
      widget/[type]/route.ts     # unified dispatcher for every widget
      streak-svg/route.ts        # back-compat alias  → widget/streak
      streak/route.ts            # back-compat alias  → widget/streak?format=json
    build/page.tsx               # widget builder (Pillar A)
    profile/page.tsx             # README builder   (Pillar B)
    gallery/page.tsx             # themed showcase
    page.tsx                     # landing
  widgets/<name>/                # one folder per widget
    render.tsx                   #   TSX → SVG elements
    options.ts                   #   declarative option schema (drives API + UI form)
    data.ts                      #   its GraphQL/REST needs
    mock.ts                      #   sample data for instant preview
  lib/
    render/svg.ts                # renderToStaticMarkup wrapper + SVG doc shell
    render/png.ts                # resvg rasterization (Phase 7, Node-only)
    themes/                      # preset registry (slot-based)
    options/                     # shared schema, parsing, validation, coercion
    color.ts                     # hex/alpha/named/gradient parsing
    cache.ts                     # two-tier: data cache + rendered-output cache
    github/                      # GraphQL client, queries, token rotation
    i18n/                        # locales, date + number formatting, RTL
  components/card/               # shared JSX primitives (Card, Row, Stat, Ring, Bar…)
```

**The declarative option schema is the keystone.** Each widget declares its options once
(name, type, default, range, enum, description). That single declaration drives: API
parsing and validation, the builder UI form controls, the docs table, and the URL builder.
Without it, 15 widgets × ~25 options each becomes unmaintainable — and it is the reason
the earlier plan's "add a checkbox per option" approach would not have scaled.

**Rendering** (see D1): widgets are TSX components emitting real SVG elements, serialized
by `renderToStaticMarkup` from `react-dom/server` — already a dependency. Full SVG is
available: `<circle>`, `<path>`, arcs, masks, `clipPath`, gradient `<defs>`, `<style>`
keyframes. JSON short-circuits rendering entirely. PNG (Phase 7) rasterizes the same SVG
via `resvg-js` on the Node runtime.

**Caching**: two tiers — raw GitHub data keyed by `username` + query-shape, and rendered
output keyed by the **full normalized option set**. Module-level `Map` initially, with a
documented upgrade path to Vercel KV/Redis (the current `Map` does not survive serverless
cold starts — a known limitation, not a regression).

**Delivery modes**, all three that the references offer:
1. **Hosted endpoint** (default).
2. **GitHub Action** — renders the SVG and commits it to the user's profile repo, so their
   README has zero runtime dependency on our uptime. This is streak-stats' most valuable
   reliability feature and the builder should emit the workflow YAML.
3. **Self-host** — Docker + Vercel, with a `WHITELIST` env var to restrict served usernames.

**Rate limits**: single `GITHUB_TOKEN` initially; `PAT_*` round-robin documented as the
scaling lever. Mock-data previews mean the builder itself costs zero API calls.

---

## 7. Decisions

The open questions from the previous draft are resolved below. Each states the decision,
the evidence, and the cost of being wrong.

### D1 — Rendering: JSX → SVG via `renderToStaticMarkup`. **Not Satori.**

**This reverses the earlier decision to migrate to Satori**, which was made when the only
supporting argument was "the dependency is already installed". That was weak, and the
evidence now points clearly the other way.

Evidence:
- **None of the six mature generator projects use Satori.** A repo-wide search for
  `satori` / `@vercel/og` across all ten reference folders returns exactly one hit: our own
  `package.json`, where it is unused. Six independent projects solving precisely this
  problem converged on direct SVG generation.
- **Satori cannot draw the shapes half our widgets need.** It renders a flexbox subset of
  HTML — `div`, `span`, `img` — and has no `<circle>`, `<path>`, `<polyline>`, or arc
  support. That rules out: the streak ring, top-languages donut/donut-vertical/pie, the
  trophy next-rank arcs, the activity line/area graph, and the contribution heatmap. The
  successor project `github-stats-extended` renders with exactly these primitives
  (`<g>`, `<circle>`, `<path>`, `<text>`, `<rect>`) — the ones Satori lacks.
- Satori has no CSS `@keyframes`, so animations would be post-injected into the output
  anyway — surrendering the authoring benefit that motivated the choice.
- Satori requires font binaries loaded as buffers (bundle weight, runtime constraints) and
  by default converts text to filled paths, inflating output and destroying text
  selectability and accessibility.

**Decision**: author cards as **TSX components that render real SVG elements**, serialized
with `renderToStaticMarkup` from `react-dom/server`. React 19 and `react-dom` are already
dependencies, so this adds none.

This keeps the actual intent behind the original choice — *JSX authoring instead of
unmaintainable template-literal strings* — while giving full access to SVG: arcs, masks,
`clipPath`, gradients, `<style>` keyframes, and `<animate>`. Text stays as `<text>`, so
output is small, selectable, and accessible.

**Consequences**: remove `satori` and `@vercel/og` from `package.json`. The Phase 0
feasibility spike is no longer needed and is deleted. No per-widget engine split — one
engine renders every widget.

**If wrong**: JSX-to-SVG is a thin, well-understood serialization step; the escape hatch
(dropping to template strings for one widget) is local and cheap.

### D2 — Runtime: Node everywhere. Drop `runtime = 'edge'`.

The edge declaration on `/api/streak-svg` is a latent deployment hazard flagged in the
original project docs, and it constrains the GraphQL client, font handling, and any future
rasterization. Cards are cached and CDN-fronted, so edge's cold-start advantage is
marginal — a cache hit never reaches the runtime at all.

**Decision**: Node runtime for all routes; lean on `Cache-Control` + CDN for latency.

### D3 — Output formats: SVG and JSON at v1.0. PNG deferred to Phase 7.

SVG is what GitHub READMEs actually render (via camo), and JSON is free — it skips
rendering entirely. PNG is the *only* format requiring bundled font binaries and a native
`resvg-js` binary, and it is the least used.

**Decision**: SVG + JSON are first-class from Phase 0. PNG lands in Phase 7, Node-only,
with animations auto-disabled. XML/WebP/GIF are not planned.

### D4 — Theme slots: 8 core slots, widget extensions fall back to core.

Concrete model, decided now so it cannot drift:

```
Core (every widget, every theme MUST define): background, border, title, text, icon,
                                              accent, stroke, muted
Widget extensions (OPTIONAL, per theme):      ring, fire, currStreakNum, sideNums,
                                              currStreakLabel, sideLabels, dates, …
```

Resolution order for any slot: explicit query override → theme's widget-specific slot →
theme's mapped core slot → widget default. Every widget-specific slot declares its core
fallback once (`ring → accent`, `fire → accent`, `sideLabels → muted`, …).

This is what makes N themes × M widgets tractable: a theme author defines 8 values and
every widget works; a theme *may* refine specific slots. Without the fallback chain, each
new widget would require editing every theme.

### D5 — Theme count: 40 curated at v1.0, not 170.

Themes are cheap to add and expensive to verify — each must be checked against every
widget for contrast and legibility. 170 unverified themes is worse than 40 good ones,
especially since D4's fallback chain means late additions cost nothing architecturally.

**Decision**: ship ~40 well-known presets at v1.0 (the ones users actually name: dark,
radical, tokyonight, dracula, gruvbox, onedark, catppuccin×4, nord, synthwave, github-*,
transparent, highcontrast, …), with a documented contribution path and incremental
expansion toward ecosystem parity afterward.

### D6 — Rank formula: adopt the established one; publish it.

**Decision**: use the upstream approach — a weighted percentile combining commits, PRs,
reviews, issues, stars, and followers through log-normal/exponential CDFs, producing
S/A+/A/A-/B+/B/B-/C+/C — and expose `rank_icon=default|github|percentile`.

Inventing our own formula would make our rank disagree with the card users already have in
their README, which reads as a bug, not a feature. The exact weights get published in the
docs so the number is auditable.

### D7 — Trophy thresholds: adopt upstream values verbatim, with attribution.

Same reasoning as D6, more strongly: trophy ranks are directly comparable across services,
and a user whose `SS` becomes an `A` on our card will assume we are broken.

### D8 — Sequencing: build the profile builder *before* widgets 5–15.

**This reorders the plan.** The README builder (Pillar B) moves from Phase 8 to **Phase 4**,
ahead of the activity graph, trophies, badges, and icons.

Rationale: the builder is the differentiator — no reference project pairs a first-party
widget engine with a full README generator — and it delivers more value on top of four
solid widgets than a fifth widget delivers with no builder. It also de-risks the widest
part of the design (multi-widget composition, shared theming, full-README export) while
the widget count is still small enough to change course cheaply.

**MVP** stays Phases 0–3. **v1.0** becomes Phases 0–4 plus i18n and delivery modes.

### D9 — Param naming: mirror upstream names exactly.

**Decision**: use the established names (`hide`, `show`, `bg_color`, `title_color`,
`hide_border`, `layout`, `langs_count`, `custom_title`, …) even where we would choose
better ones. Users migrate between these services by swapping a domain in a URL; name
compatibility makes us a drop-in target and makes every existing tutorial apply to us.

### D10 — Licensing: MIT, plus a `NOTICE` file.

We are reimplementing behaviour, not copying code — but theme palettes, trophy thresholds,
the rank formula, and the parameter vocabulary are all derived from MIT-licensed upstream
projects. **Decision**: ship MIT with a `NOTICE` crediting DenverCoder1
(streak-stats), anuraghazra (github-readme-stats), ryo-ma (profile-trophy), and the other
projects surveyed in §2.

---

## 8. Residual risks

Genuine unknowns that remain after the decisions above.

- **GitHub API rate limits under real traffic.** Mock-data previews remove the builder's
  cost, but a popular hosted instance still burns 5,000 points/hour per token. Mitigation
  is layered (render cache → data cache → token rotation → the GitHub Action path, which
  moves cost off our infrastructure entirely). This is the most likely thing to force
  architectural change, and Phase 10 exists for it.
- **First-100-repos ceiling** on language and repo aggregation is a GitHub API constraint
  every reference project hits. It will produce complaints from users with large accounts.
  Document it prominently rather than pretending it's solved.
- **Visitor counter needs durable storage** (Phase 8.4 depends on Phase 10.1). If durable
  storage slips, that one widget slips with it — no other widget shares the dependency.
- **Contribution data has an up-to-24-hour lag** on GitHub's side. Users reliably report
  this as a bug in the streak card. Surface it in the FAQ before launch.

See [TODOS.md](./TODOS.md) for the phase-by-phase task breakdown.
