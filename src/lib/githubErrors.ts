import { WidgetRenderError } from "@/widgets/errors";

/**
 * GitHub-rate-limit classification (docs/TODOS.md 10.5 — "graceful themed
 * error cards ... on rate-limit/abuse"). GitHub's GraphQL API reports both
 * primary ("API rate limit exceeded") and secondary ("You have exceeded a
 * secondary rate limit") limits as plain error messages rather than a
 * distinct HTTP status, so detection is message-based. Mapped to 429 so
 * the themed error card reads clearly instead of a generic "failed to
 * fetch" 500, and so a client polling on a schedule knows to back off.
 */
const RATE_LIMIT_PATTERN = /rate limit|rate-limit|abuse detection/i;

export function isGithubRateLimitError(error: unknown): boolean {
  return error instanceof Error && RATE_LIMIT_PATTERN.test(error.message);
}

/**
 * REST equivalent for fetch()-based calls (githubRepo.ts's contributor
 * count / gist lookups): GitHub reports a rate limit as 403 with
 * `x-ratelimit-remaining: 0`, or plain 429 for the secondary/abuse limiter.
 * Throws a 429 WidgetRenderError (with Retry-After passed through when
 * GitHub sent one) when the response indicates a rate limit; otherwise a
 * no-op, since REST call sites handle other non-ok statuses their own way.
 */
export function throwIfRateLimitedResponse(response: Response): void {
  const isRateLimited =
    response.status === 429 ||
    (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0");
  if (!isRateLimited) return;

  const retryAfter = response.headers.get("retry-after");
  const message = retryAfter
    ? `GitHub API rate limit exceeded — please try again in ${retryAfter} seconds.`
    : "GitHub API rate limit exceeded — please try again in a few minutes.";
  throw new WidgetRenderError(message, 429);
}

/** Wraps a caught error from a GitHub API call into a WidgetRenderError, classifying rate limits as 429. */
export function wrapGithubError(error: unknown, context: string): WidgetRenderError {
  if (error instanceof WidgetRenderError) return error;
  if (isGithubRateLimitError(error)) {
    return new WidgetRenderError(
      "GitHub API rate limit exceeded — please try again in a few minutes.",
      429
    );
  }
  const message = error instanceof Error ? error.message : String(error);
  return new WidgetRenderError(`Failed to fetch ${context}: ${message}`, 500);
}
