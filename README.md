# github-readme-stats

A customizable widget generator for GitHub profile READMEs. Pick a card, configure it
in the live builder, and copy the embed — no more hand-editing query strings.

**[Open the widget builder →](/build)** · **[Build a full README →](/profile)** ·
**[Browse the gallery →](/gallery)**

The widget builder generates one embed at a time. The profile builder composes several
widgets plus your identity, socials, and tech stack into one complete `README.md`.

## Widgets

| Widget | Endpoint | Example |
| --- | --- | --- |
| Contribution Streak | `/api/widget/streak` | `?username=octocat` |
| Stats Overview | `/api/widget/stats` | `?username=octocat&show_icons=true` |
| Top Languages | `/api/widget/top-langs` | `?username=octocat&layout=donut` |
| Pinned Repository | `/api/widget/pin` | `?repo=octocat/Hello-World` |
| Gist | `/api/widget/gist` | `?id=<gist_id>` |
| Contribution Activity Graph | `/api/widget/activity-graph` | `?username=octocat&graph_style=area` |
| Contribution Heatmap | `/api/widget/heatmap` | `?username=octocat&weeks=53` |
| GitHub Trophies | `/api/widget/trophy` | `?username=octocat&row=2&column=6` |
| Profile Summary | `/api/widget/profile-summary` | `?username=octocat` |
| Repos per Language | `/api/widget/repos-per-language` | `?username=octocat` |
| Most Commit Language | `/api/widget/most-commit-language` | `?username=octocat` |
| Productive Time | `/api/widget/productive-time` | `?username=octocat&timezone=Asia/Kolkata` |
| Badges | `/api/widget/badges` | `?username=octocat&name=followers,total-stars` |
| Tech Icons | `/api/widget/tech-icons` | `?name=react,typescript,nodedotjs` |
| Typing Header | `/api/widget/typing-header` | `?lines=Hi, I'm Octocat,I build things` |
| WakaTime Stats | `/api/widget/wakatime` | `?username=<wakatime-username>` |
| Quote / Joke | `/api/widget/quote` | `?category=programming` |

There's also a standalone `/api/widget/icon/<simple-icons-slug>` route (e.g.
`/api/widget/icon/react?color=fff&size=32`) for a single bundled tech icon outside the
grid layout — see https://simpleicons.org for valid slugs.

Every widget accepts `format=svg` (default), `format=json` (raw computed data, no
rendering), or `format=png` (rasterized, Node-only, animations forced off).
`/api/widget/<type>/preview` renders the same widget from bundled sample
data — no username/token required — and powers the builder's live preview.

### Embedding

```md
![GitHub Streak](https://<your-deployment>/api/widget/streak?username=octocat)
```

### Common options

Every widget accepts: `theme` (40 built-in presets — see the builder's theme picker),
`bg_color`, `title_color`, `text_color`, `icon_color`, `border_color` (hex, CSS color
name, or `angle,color1,color2,...` gradient for `bg_color`), `border_radius`,
`border_width`, `hide_border`, `hide_title`, `custom_title` (supports `{name}`/
`{username}` tokens), `card_width`, `card_height`, `disable_animations`,
`number_format=short|long`, `cache_seconds`, `locale` (see below).

### Localization

`locale` translates the visible labels on every widget (12 fully-translated
locales — `es`, `fr`, `de`, `pt-BR`, `it`, `ru`, `ja`, `ko`, `zh-CN`, `ar`, `hi`,
`tr` — plus correct number/date formatting for a broader set; see
`src/lib/i18n/locales.ts` for the full list). `ar`, `he`, `fa`, and `ur` also mirror
the whole card layout right-to-left, not just the strings — the same theme/option
system applies underneath, so RTL works for every widget automatically.

Each widget also has its own options — the builder's form is generated directly from
the same schema the API validates against, so it's always in sync. See
[docs/PROJECT-DOCUMENTATION.md](docs/PROJECT-DOCUMENTATION.md) and
[docs/PLAN.md](docs/PLAN.md) / [docs/TODOS.md](docs/TODOS.md) for full details and
the project roadmap.

### Streak-specific options

`mode=daily|weekly`, `exclude_days` (comma list of `Sun`..`Sat` — these days neither
break nor count toward the streak), `timezone` (IANA, e.g. `Asia/Kolkata`),
`starting_year`, `hide_total_contributions`, `hide_current_streak`,
`hide_longest_streak`, `date_format` (PHP `date()`-style pattern for the date ranges
— `d j F m n Y y` tokens, `[...]` shown only when the year differs from the current
one; default `M j[, Y]`).

### Stats-specific options

`hide`/`show` (comma lists — see the builder for the full list of togglable rows),
`show_icons`, `hide_rank`, `rank_icon=default|github|percentile`,
`include_all_commits`, `line_height`, `text_bold`, `ring_color`.

### Top-languages-specific options

`layout=normal|compact|donut|donut-vertical|pie`, `langs_count` (1-20), `hide`
(language names), `exclude_repo`, `hide_progress`, `size_weight`/`count_weight`
(ranking algorithm weights).

### Pin/Gist-specific options

Pin: `repo=owner/name` (required), `show_owner`, `description_lines_count` (1-3, auto
if omitted). Gist: `id=<gist_id>` (required), `show_owner`.

### Activity-graph-specific options

`days` (14-3650, default 365) — how much history to plot; `granularity=auto|day|week|month`
(auto picks daily/weekly/monthly bucketing based on `days`); `graph_style=line|area|bar`;
`show_points` (marker at each point, line/area only); `hide_grid`.

### Heatmap-specific options

`weeks` (4-260, default 53) — how many Sun-Sat weeks of history to show, ending on the
current week; `hide_month_labels`, `hide_weekday_labels`, `hide_legend`. Cell size (and
so the card's height) is derived from `card_width` and `weeks`.

### Trophy-specific options

`title` (comma list of trophy keys — `stars`, `commits`, `followers`, `issues`, `prs`,
`repos`, plus the secret trophies `multi-language`, `multi-org`, `ancient-account`,
`long-time-account`, `new-account`, `super-rank` — omit for all currently-unlocked
trophies), `rank` (comma list of ranks to show: `SSS SS S AAA AA A B C SECRET`),
`column`/`row` (grid shape, default 6×2), `margin_w`/`margin_h`, `no_bg`, `no_frame`.
Rank thresholds are adopted verbatim from ryo-ma/github-profile-trophy (see NOTICE);
secret trophies are hidden entirely until their condition is met, matching upstream's
"won't display until unlocked" behavior. Commits always uses the full account history
(a second, more expensive query), since the current-year figure the stats widget uses
can't plausibly fill the trophy's rank scale.

### Profile-summary-specific options

`photo_quality=low|medium|high` (source avatar resolution before it's embedded),
`photo_resize` (rendered avatar diameter in pixels, 30-200, default 76), `revert`
(avatar on the right instead of the left), `custom_title` supports `{name}`/`{username}`.
The avatar is fetched once and base64-embedded directly in the SVG (via an SVG
`<pattern>`), not linked externally — README image proxies can't reach into an inline
`<image>` the way they can an `<img src>`.

### Repos-per-language / Most-commit-language options

Repos-per-language: `langs_count`, `hide`, `exclude_repo` — same aggregation as the Top
Languages widget, ranked by repo count instead of byte size. Most-commit-language:
`langs_count`, `hide` — attributes each owned repo's entire default-branch commit count
to its primary language (a proxy for "commits authored by this user", not filtered to
their commits specifically — see the doc comment on `fetchCommitLanguageData` for why).

### Productive-time-specific options

`timezone` (IANA, e.g. `Asia/Kolkata` — defaults to UTC), `hide_hour_of_day`,
`hide_day_of_week`. Sampled from the 100 most recent default-branch commits across each
of the user's 20 most-recently-pushed owned repos (up to 2000 commits) — a bounded
sample, not the account's complete commit history, for the same reason as the
first-100-repos ceiling noted in the FAQ below.

### Badges-specific options

`name` (comma list of badge types, in order — required). User badges (need `username`):
`repositories`, `followers`, `organization`, `languages`, `total-stars`,
`total-contributors`, `total-commits`, `total-code-reviews`, `total-issues`,
`total-pull-requests`, `total-joined-years`. Repo badges (need `repo=owner/name`):
`stars`, `forks`, `contributors`, `issues`, `pull-requests`, `watchers`, `size`. A badge
name that isn't recognized, or whose scope's required parameter is missing, renders as
"N/A" rather than failing the whole request. `themes` (comma list of theme names — cycles
one per badge, falling back to `theme` when omitted), `column` (badges per row, 1-50),
`size` (badge height), `p` (padding/gap), `glow`, `wave`.

### Tech-icons-specific options

`name` (comma list of simple-icons slugs — required; see https://simpleicons.org),
`columns` (1-50), `size`, `color` (comma list, index-mapped to `name`, empty entries fall
back to the icon's own brand color), `glow`, `wave`. An unrecognized slug renders as a
"?" placeholder tile instead of failing the whole grid.

### Typing-header-specific options

`lines` (comma list, required), `font` (default a monospace stack — the typing reveal's
timing assumes roughly-monospace character widths), `size`, `duration` (ms to type each
line), `pause` (ms to hold before erasing/advancing), `multiline` (types all lines and
keeps them stacked permanently, no erase/loop — default rotates through lines one at a
time, erasing and looping forever), `hide_cursor`. Text color follows `text_color`
(falling back to the theme's accent slot); the cursor follows `icon_color`. No
locale/RTL support — every line is arbitrary user-supplied text, not a translated label,
so there's nothing to translate, and mirroring the reveal direction for RTL is scoped
out as a separate future enhancement.

### WakaTime-specific options

`username` (their WakaTime — not GitHub — username; required), `api_domain` (for
self-hosted Wakapi/Hakatime instances, default `wakatime.com`), `layout=default|compact`,
`display_format=time|percent`, `langs_count`, `hide_progress`. Reads WakaTime's public,
unauthenticated stats endpoint — the user must set their coding activity to public in
their WakaTime privacy settings (Settings → visibility), the same tradeoff GitHub's own
public contribution graph makes. No API key is ever accepted as a widget parameter,
since that would leak it to anyone who views the embed URL.

### Quote/joke-specific options

`category=random|programming|motivational|humor` (default `random`). Quotes are bundled
(not fetched from a third-party API), and a new one is picked on every load — the
rendered output for this widget specifically is never cached.

## Gallery

[`/gallery`](/gallery) is a style-taxonomy showcase — Minimal, Vivid, Retro, Animated,
Badges, Icons — of example cards, each rendered from bundled mock data and linking
straight into the builder pre-configured with that example's widget and options.

## Themes

[`/themes`](/themes) previews all 77 built-in theme presets. Pass any of them as
`theme=<name>` on any widget. A second verified batch (37 of the 77) was adopted
verbatim from [anuraghazra/github-readme-stats](https://github.com/anuraghazra/github-readme-stats)'
own `themes/index.js` (MIT) — see [NOTICE](NOTICE).

## Scoping filters

`top-langs`, `repos-per-language`, and `most-commit-language` support:

- `role` — repository affiliation(s) to aggregate: `OWNER`, `ORGANIZATION_MEMBER`,
  `COLLABORATOR` (comma-separated). Defaults to `OWNER`, matching GitHub's own
  `RepositoryAffiliation` enum. Ignored when `owner` is set.
- `owner` — aggregates this organization's repositories instead of `username`'s own
  (e.g. "my language breakdown across my employer's org").
- `repo` (top-langs and repos-per-language only) — only aggregates the listed
  repositories, the inverse of the existing `exclude_repo`.

The `stats` widget additionally supports `commits_year=<year>`, scoping the commit
count to one specific calendar year instead of the past 12 months (overrides
`include_all_commits` when set).

## Local development

```bash
npm install
# copy .env.example to .env.local and set GITHUB_TOKEN to a token with public read access
npm run dev
```

Then open <http://localhost:3000/build> or <http://localhost:3000/profile>.

## Delivery modes

1. **Hosted endpoint** (default) — embed the `/api/widget/...` URL directly, as above.
2. **GitHub Action** — renders the widget on a schedule and commits the SVG into your
   own repo, so your README has zero runtime dependency on this site's uptime. Use the
   "GitHub Action" tab in the [builder](/build)'s copy-out panel to generate a
   ready-to-commit workflow for your specific widget, or start from
   [`examples/github-actions/update-widget.yml`](examples/github-actions/update-widget.yml).
3. **Self-host** — see below.

## Deployment

Deploys to Vercel (or any Next.js 15 host) with no extra configuration beyond setting
the `GITHUB_TOKEN` environment variable. `tech-icons`, `typing-header`, `quote`, and
`wakatime` don't call the GitHub API at all and work with no token configured — every
other widget still requires one.

### Scaling & hardening (optional)

None of these are required — every one is unset by default and the app behaves exactly
as it did before Phase 10.

| Variable | Effect |
| --- | --- |
| `PAT_1`, `PAT_2`, ... `PAT_N` | Additional GitHub tokens, pooled alongside `GITHUB_TOKEN` and rotated round-robin per request — spreads load across each token's own rate limit instead of exhausting one. |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` (Vercel KV) or `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (Upstash directly) | Backs the two-tier cache with Redis so entries survive cold starts and are shared across instances/regions, on top of the existing in-memory tier. |
| `RATE_LIMIT_PER_MINUTE` | Per-IP cap on uncached widget renders (default 30/minute). A cache hit never counts against it. |
| `METRICS_TOKEN` | Enables `/api/internal/metrics?token=...` — request counts, cache hit rate, upstream error rate, and render-time p50/p95. Unset disables the endpoint (404) rather than defaulting to open. |

A GitHub rate limit (primary or secondary) is now reported as a themed 429 error card
with a `Retry-After` header, instead of a generic failure.

### Self-hosting with Docker

```bash
docker build -t github-readme-stats .
docker run -p 3000:3000 -e GITHUB_TOKEN=ghp_xxx github-readme-stats
```

Set `WHITELIST` (comma-separated GitHub usernames) to restrict which accounts a
self-hosted instance will serve — useful for a private/personal deployment that
shouldn't act as a public proxy for arbitrary GitHub accounts. Unset (the default)
serves everyone. Gist requests aren't scoped by `WHITELIST` (a gist's owner isn't
known without an extra fetch); disable that widget entirely if you need a hard
guarantee.

## FAQ

**The streak/contribution numbers look off by a day.** GitHub's contribution graph
data can lag up to 24 hours behind real activity. This is a GitHub API limitation, not
a bug in this project — if a contribution isn't showing up yet, wait a day.

**My stats/languages don't include all my repos.** Aggregation only considers your
first 100 repositories (a GitHub API constraint every similar project hits). If your
account has more than that, the least-recently-touched ones won't be counted.

## License

MIT — see [LICENSE](LICENSE). See [NOTICE](NOTICE) for attribution to the upstream
projects this one's design decisions and parameter vocabulary are derived from.
