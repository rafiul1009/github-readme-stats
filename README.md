# github-readme-stats

A customizable widget generator for GitHub profile READMEs. Pick a card, configure it
in the live builder, and copy the embed — no more hand-editing query strings.

**[Open the builder →](/build)**

## Widgets

| Widget | Endpoint | Example |
| --- | --- | --- |
| Contribution Streak | `/api/widget/streak` | `?username=octocat` |
| Stats Overview | `/api/widget/stats` | `?username=octocat&show_icons=true` |
| Top Languages | `/api/widget/top-langs` | `?username=octocat&layout=donut` |
| Pinned Repository | `/api/widget/pin` | `?repo=octocat/Hello-World` |
| Gist | `/api/widget/gist` | `?id=<gist_id>` |

Every widget accepts `format=svg` (default) or `format=json` (raw computed data, no
rendering). `/api/widget/<type>/preview` renders the same widget from bundled sample
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
`number_format=short|long`, `cache_seconds`.

Each widget also has its own options — the builder's form is generated directly from
the same schema the API validates against, so it's always in sync. See
[docs/PROJECT-DOCUMENTATION.md](docs/PROJECT-DOCUMENTATION.md) and
[docs/PLAN.md](docs/PLAN.md) / [docs/TODOS.md](docs/TODOS.md) for full details and
the project roadmap.

### Streak-specific options

`mode=daily|weekly`, `exclude_days` (comma list of `Sun`..`Sat` — these days neither
break nor count toward the streak), `timezone` (IANA, e.g. `Asia/Kolkata`),
`starting_year`, `hide_total_contributions`, `hide_current_streak`,
`hide_longest_streak`.

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

Then open <http://localhost:3000/build>.

## Deployment

Deploys to Vercel (or any Next.js 15 host) with no extra configuration beyond setting
the `GITHUB_TOKEN` environment variable.
