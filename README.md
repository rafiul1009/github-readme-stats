# github-readme-stats

A customizable widget generator for GitHub profile READMEs. Pick a card, configure it
in the live builder, and copy the embed — no more hand-editing query strings.

**[Open the widget builder →](/build)** · **[Build a full README →](/profile)**

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
the `GITHUB_TOKEN` environment variable.

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
