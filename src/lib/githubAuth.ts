/**
 * Multi-token rotation (docs/TODOS.md 10.2). A single `GITHUB_TOKEN` is
 * still all a self-hoster needs, but a busier deployment can add
 * `PAT_1`, `PAT_2`, ... `PAT_N` — every token present is pooled and
 * handed out round-robin across requests, spreading load across each
 * token's own independent GitHub rate limit rather than exhausting one.
 */
function loadTokenPool(): string[] {
  const pool: string[] = [];
  if (process.env.GITHUB_TOKEN) pool.push(process.env.GITHUB_TOKEN);
  for (let i = 1; ; i++) {
    const value = process.env[`PAT_${i}`];
    if (!value) break;
    pool.push(value);
  }
  return pool;
}

let cursor = 0;

/** Whether any GitHub token is configured, via GITHUB_TOKEN and/or PAT_1..PAT_N. */
export function hasGithubToken(): boolean {
  return loadTokenPool().length > 0;
}

/** How many tokens are currently pooled — surfaced for observability (docs/TODOS.md 10.6). */
export function githubTokenPoolSize(): number {
  return loadTokenPool().length;
}

function nextGithubToken(): string | undefined {
  const pool = loadTokenPool();
  if (pool.length === 0) return undefined;
  const token = pool[cursor % pool.length];
  cursor++;
  return token;
}

/** Authorization header for the next token in the pool, or `{}` if none is configured. */
export function githubAuthHeaders(): Record<string, string> {
  const token = nextGithubToken();
  return token ? { authorization: `Bearer ${token}` } : {};
}
