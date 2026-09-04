# GitHub README Streak Stats — Project Documentation

A small Next.js service that reads a GitHub user's contribution calendar through the
GitHub GraphQL API, computes their current contribution streak, and serves it as
either JSON or an embeddable SVG card suitable for a README.

---

## 1. Overview

| Item | Value |
| --- | --- |
| Name | `github-readme-streak-stats` |
| Version | `0.1.0` (private) |
| Framework | Next.js 15.3.1 (App Router) |
| Language | TypeScript 5.8 (strict mode) |
| UI | React 19, Tailwind CSS v4 |
| Data source | GitHub GraphQL API v4 via `@octokit/graphql` |
| Output | JSON (`/api/streak`) and SVG (`/api/streak-svg`) |
| Status | Early prototype — API routes work; the public web page is still the stock Next.js starter |

### Purpose

Embedding a streak badge in a GitHub profile README requires a URL that returns an
image. This project provides that URL: it authenticates against GitHub with a personal
access token, pulls the last year of contribution data for a given username, reduces
it to a "current streak" number, and renders a 495×195 SVG card with a light or dark
theme.

---

## 2. Tech Stack

**Runtime / framework**
- `next@15.3.1` — App Router, Route Handlers, `--turbopack` in dev
- `react@19` / `react-dom@19`
- TypeScript with `strict: true`, path alias `@/*` → `./src/*`

**Data**
- `@octokit/graphql@8` — GraphQL client for the GitHub API

**Rendering**
- Hand-written SVG string generation (see [svg.tsx](../src/components/svg.tsx))
- `@vercel/og@0.6.8` and `satori@0.12.2` are declared dependencies but **not currently
  imported anywhere**. They appear to be reserved for a future JSX→image renderer.

**Styling / tooling**
- Tailwind CSS v4 via `@tailwindcss/postcss`
- ESLint 9 flat config extending `next/core-web-vitals` and `next/typescript`

---

## 3. Directory Structure

```
github-readme-streak-stats/
├── docs/
│   └── PROJECT-DOCUMENTATION.md   ← this file
├── public/                         # static SVG assets from the Next.js starter
│   ├── file.svg  globe.svg  next.svg  vercel.svg  window.svg
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── streak/route.ts      # GET → JSON  { currentStreak }
│   │   │   └── streak-svg/route.ts  # GET → image/svg+xml (edge runtime)
│   │   ├── favicon.ico
│   │   ├── globals.css              # Tailwind entry + CSS custom properties
│   │   ├── layout.tsx               # Root layout, Geist fonts, metadata
│   │   └── page.tsx                 # Landing page (unmodified starter template)
│   ├── components/
│   │   └── svg.tsx                  # generateStreakCard() + theme palettes
│   ├── lib/
│   │   └── github.ts                # fetchContributionData() — GraphQL query
│   └── utils/
│       └── streak.ts                # calculateStreak() + in-memory TTL cache
├── .env.local                       # GITHUB_TOKEN (placeholder, currently tracked)
├── eslint.config.mjs
├── next.config.ts                   # currently empty config
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

---

## 4. Architecture

### Request flow

```
Client (README <img> tag or fetch)
        │
        ▼
┌───────────────────────────────┐
│ Route handler                 │
│  /api/streak      (Node)      │
│  /api/streak-svg  (Edge)      │
└───────────────┬───────────────┘
                │ 1. read ?username, ?theme, ?font
                │ 2. validate username + GITHUB_TOKEN
                ▼
        getCachedStreak(username) ─── hit ──┐
                │ miss                       │
                ▼                            │
┌───────────────────────────────┐            │
│ lib/github.ts                 │            │
│ fetchContributionData()       │            │
│  → GitHub GraphQL v4          │            │
│    contributionsCollection    │            │
└───────────────┬───────────────┘            │
                ▼                            │
     weeks[].contributionDays[] flattened    │
                ▼                            │
┌───────────────────────────────┐            │
│ utils/streak.ts               │            │
│ calculateStreak()             │            │
│ setCachedStreak()             │            │
└───────────────┬───────────────┘            │
                ▼                            ▼
        ┌───────────────────────────────────────┐
        │ /api/streak      → NextResponse.json  │
        │ /api/streak-svg  → generateStreakCard │
        │                    → image/svg+xml    │
        └───────────────────────────────────────┘
```

### Layer responsibilities

| Layer | File | Responsibility |
| --- | --- | --- |
| Transport | [streak/route.ts](../src/app/api/streak/route.ts), [streak-svg/route.ts](../src/app/api/streak-svg/route.ts) | Parse query params, validate, choose cache vs. fetch, shape the response |
| Data access | [github.ts](../src/lib/github.ts) | One GraphQL query; wraps errors with context |
| Domain logic | [streak.ts](../src/utils/streak.ts) | Streak computation + module-level cache |
| Presentation | [svg.tsx](../src/components/svg.tsx) | Theme palette and SVG string template |

The separation is clean: the two route handlers share the same data-access and domain
layers and differ only in how they serialize the result.

---

## 5. Module Reference

### `src/lib/github.ts`

```ts
fetchContributionData(username: string): Promise<ContributionCalendar>
```

Creates an authenticated client with `graphql.defaults()`, injecting
`Authorization: Bearer ${process.env.GITHUB_TOKEN}`. It runs:

```graphql
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { contributionCount date } }
      }
    }
  }
}
```

`contributionsCollection` with no date arguments returns the **trailing 12 months**,
so streaks longer than one year cannot be represented by this query as written.

Errors are rethrown as `Failed to fetch contribution data: <message>`.

### `src/utils/streak.ts`

```ts
calculateStreak(days: { contributionCount: number; date: string }[]): StreakInfo
getCachedStreak(key: string): StreakInfo | null
setCachedStreak(key: string, data: StreakInfo): void
```

`calculateStreak` copies the input, sorts descending by date, normalizes both `today`
and each contribution date to midnight local time, and walks backwards. It stops at
the first day with `contributionCount === 0` or the first gap larger than the streak
accumulated so far, returning `{ currentStreak, lastContributionDate }`.

The cache is a module-level `Map` keyed by username with a 1-hour TTL
(`CACHE_TTL = 3600000`). Entries are never actively evicted — a stale entry simply
fails the freshness check and is overwritten on the next miss.

### `src/components/svg.tsx`

```ts
generateStreakCard(props: StreakCardProps): string
```

Holds a `themes` record with `light` and `dark` palettes (`background`, `text`,
`border`, `streak`) and returns a template-literal SVG: a rounded background rect, a
1px border rect, and three centered `<text>` nodes — the header
(`<username>'s Contribution Streak`), the streak count, and the formatted last
contribution date (`en-US`, e.g. `May 2, 2025`).

| Theme | background | text | border | streak |
| --- | --- | --- | --- | --- |
| light | `#ffffff` | `#333333` | `#e4e2e2` | `#4c71f2` |
| dark | `#0d1117` | `#c9d1d9` | `#30363d` | `#58a6ff` |

A commented-out `CSSProperties` style object remains in the file from an earlier
Satori-based approach.

### `src/app/api/streak/route.ts`

Node runtime. Returns `{ currentStreak: number }`.

### `src/app/api/streak-svg/route.ts`

Declares `export const runtime = 'edge'`. Returns the SVG with
`Content-Type: image/svg+xml` and `Cache-Control: public, max-age=3600`.

---

## 6. API Reference

### `GET /api/streak`

**Query parameters**

| Name | Required | Description |
| --- | --- | --- |
| `username` | yes | GitHub login to look up |

**Responses**

| Status | Body |
| --- | --- |
| 200 | `{ "currentStreak": 12 }` |
| 400 | `{ "error": "Username parameter is required" }` |
| 500 | `{ "error": "GitHub token is not configured" }` |
| 500 | `{ "error": "Failed to fetch streak data" }` |

```bash
curl "http://localhost:3000/api/streak?username=rafiul1009"
```

### `GET /api/streak-svg`

**Query parameters**

| Name | Required | Default | Description |
| --- | --- | --- | --- |
| `username` | yes | — | GitHub login to look up |
| `theme` | no | `light` | `light` or `dark` |
| `font` | no | `Inter` | Font family name injected into the SVG `<style>` block |

**Responses**

| Status | Body |
| --- | --- |
| 200 | SVG document, `image/svg+xml`, cached one hour |
| 400 | `Username parameter is required` (plain text) |
| 500 | `GitHub token is not configured` / `Failed to generate streak SVG` (plain text) |

**README embed**

```markdown
![GitHub Streak](https://your-deployment.vercel.app/api/streak-svg?username=rafiul1009&theme=dark)
```

---

## 7. Configuration

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `GITHUB_TOKEN` | yes | GitHub personal access token used as a Bearer credential for the GraphQL API |

`.env.local` currently holds a placeholder:

```
GITHUB_TOKEN=your_github_token_here
```

The token needs read access to profile/contribution data — a classic PAT with
`read:user` (add `repo` only if private contributions should be counted), or a
fine-grained token with read-only user permissions.

### Other config files

- `next.config.ts` — empty `NextConfig`; no rewrites, headers, or image config yet.
- `tsconfig.json` — `strict`, `target: ES2017`, `moduleResolution: bundler`,
  `@/*` path alias.
- `postcss.config.mjs` — the single `@tailwindcss/postcss` plugin (Tailwind v4 style).
- `eslint.config.mjs` — flat config bridging the legacy Next shareable configs via
  `FlatCompat`.

---

## 8. Local Development

```bash
# 1. install
npm install

# 2. configure — replace the placeholder token in .env.local
#    GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# 3. run (Turbopack)
npm run dev          # http://localhost:3000

# 4. verify
curl "http://localhost:3000/api/streak?username=<login>"
curl "http://localhost:3000/api/streak-svg?username=<login>&theme=dark" -o card.svg
```

**Scripts**

| Script | Command | Purpose |
| --- | --- | --- |
| `dev` | `next dev --turbopack` | Development server |
| `build` | `next build` | Production build |
| `start` | `next start` | Serve the production build |
| `lint` | `next lint` | ESLint over the project |

---

## 9. Deployment

The project is a stock Next.js app and deploys to Vercel with no extra configuration.
The only step beyond connecting the repository is setting `GITHUB_TOKEN` as an
environment variable in the project settings (Production, Preview, and Development as
needed).

Any host that runs Next.js 15 works equally well, with one caveat: `/api/streak-svg`
declares the edge runtime, so the platform must support edge route handlers or that
declaration should be removed.

---

## 10. Known Issues and Limitations

Observations from reading the current code, roughly by impact.

1. **The streak calculation is incorrect.** In `calculateStreak`, the line
   `currentStreak = dayDifference === 0 ? 1 : dayDifference` derives the streak from
   the *distance between today and the contribution date* rather than incrementing a
   counter. A user whose last contribution was 5 days ago gets a streak taken from that
   gap, not from the number of consecutive contributed days. This should be a
   `currentStreak++` walk against an explicit expected-date cursor.

2. **The in-memory cache does not survive serverless invocations.** `cache` is a
   module-level `Map`. On Vercel each cold start gets a fresh module instance, and the
   edge and Node routes have entirely separate memory, so the two endpoints never share
   cached data. A durable store (Vercel KV, Redis) or reliance on HTTP caching would be
   needed for a real cache.

3. **`runtime = 'edge'` on the SVG route is risky.** It shares `@octokit/graphql` and
   the `process.env` access path with the Node route; edge runtime restrictions can
   surface at deploy time rather than locally.

4. **No output escaping in the SVG.** `username` and `font` are interpolated straight
   into the SVG markup and its `<style>` block in [svg.tsx](../src/components/svg.tsx).
   A value containing `<`, `&`, or `"` produces malformed SVG — an injection surface
   worth closing before the endpoint is public.

5. **Only 12 months of history.** The GraphQL query takes no `from`/`to` arguments, so
   streaks that started more than a year ago are truncated.

6. **`lastContributionDate` may be empty.** When the streak is zero it is `''`, and
   `new Date('').toLocaleDateString()` renders `Invalid Date` on the card.

7. **Timezone handling is local-machine dependent.** Dates are normalized with
   `setHours(0,0,0,0)` in server-local time while GitHub returns UTC-based dates, so
   the boundary day can be off by one depending on where the server runs.

8. **`.env.local` is tracked despite `.gitignore` containing `.env*`.** It holds only a
   placeholder today, but it should be untracked and replaced with a committed
   `.env.example` before a real token is ever placed in it.

9. **The landing page is the unmodified Next.js starter.** `page.tsx` and the root
   layout metadata (`title: "Create Next App"`) still ship template content.

10. **`@vercel/og` and `satori` are unused dependencies**, adding install weight without
    contributing to the build.

11. **No tests.** No test runner is configured; `calculateStreak` in particular is pure
    and cheap to unit-test.

---

## 11. Suggested Roadmap

- Rewrite `calculateStreak` with a correct consecutive-day walk and cover it with unit
  tests (contributed today, contributed yesterday only, gap in the middle, no
  contributions at all).
- Add `longestStreak`, `totalContributions`, and streak start/end dates to both
  responses — the GraphQL query already returns `totalContributions`.
- Escape user-controlled values before interpolating them into the SVG.
- Replace the in-memory `Map` with a shared cache, or lean on `Cache-Control` plus a
  CDN and drop the map entirely.
- Paginate the contributions query across multiple years for long streaks.
- Build the real landing page: a username input that previews the card and emits a
  copyable Markdown embed snippet; update the layout metadata.
- Either use `satori`/`@vercel/og` to render a richer card, or remove them.
- Add `.env.example` and untrack `.env.local`.
