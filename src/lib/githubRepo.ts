import { graphql } from "@octokit/graphql";
import { WidgetRenderError } from "@/widgets/errors";

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  },
});

/**
 * @octokit/graphql throws (rather than just returning `data.repository:
 * null`) whenever the response includes a GraphQL `errors` array —
 * confirmed against the real API: a nonexistent repo returns HTTP 200 with
 * both `data: { repository: null }` and an `errors: [{ type: "NOT_FOUND" }]`
 * array, which the client treats as a thrown GraphqlResponseError rather
 * than a normal null result.
 */
function isNotFoundGraphqlError(error: unknown): boolean {
  const errors = (error as { errors?: { type?: string }[] } | undefined)?.errors;
  return Array.isArray(errors) && errors.some((e) => e.type === "NOT_FOUND");
}

export interface RawRepoData {
  name: string;
  owner: string;
  description: string | null;
  isArchived: boolean;
  isTemplate: boolean;
  isFork: boolean;
  stars: number;
  forks: number;
  language: { name: string; color: string } | null;
}

interface RepoQueryResult {
  repository: {
    name: string;
    description: string | null;
    isArchived: boolean;
    isTemplate: boolean;
    isFork: boolean;
    stargazerCount: number;
    forkCount: number;
    primaryLanguage: { name: string; color: string | null } | null;
    owner: { login: string };
  } | null;
}

const REPO_QUERY = `
  query($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      name
      description
      isArchived
      isTemplate
      isFork
      stargazerCount
      forkCount
      primaryLanguage { name color }
      owner { login }
    }
  }
`;

/** Parses and validates an "owner/name" repo parameter, throwing a 400 WidgetRenderError if missing/malformed. */
export function parseOwnerRepo(raw: string | undefined): { owner: string; name: string } {
  if (!raw) {
    throw new WidgetRenderError('repo parameter is required (expected "owner/name")', 400);
  }
  const parts = raw.split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new WidgetRenderError(`Invalid repo parameter "${raw}" — expected "owner/name"`, 400);
  }
  return { owner: parts[0], name: parts[1] };
}

export async function fetchRepoData(ownerRepoParam: string | undefined): Promise<RawRepoData> {
  const { owner, name } = parseOwnerRepo(ownerRepoParam);

  try {
    const data = await graphqlWithAuth<RepoQueryResult>(REPO_QUERY, { owner, name });
    const repo = data.repository;
    if (!repo) {
      throw new WidgetRenderError(`Repository "${owner}/${name}" not found`, 404);
    }

    return {
      name: repo.name,
      owner: repo.owner.login,
      description: repo.description,
      isArchived: repo.isArchived,
      isTemplate: repo.isTemplate,
      isFork: repo.isFork,
      stars: repo.stargazerCount,
      forks: repo.forkCount,
      language: repo.primaryLanguage
        ? { name: repo.primaryLanguage.name, color: repo.primaryLanguage.color ?? "#858585" }
        : null,
    };
  } catch (error) {
    if (error instanceof WidgetRenderError) throw error;
    if (isNotFoundGraphqlError(error)) {
      throw new WidgetRenderError(`Repository "${owner}/${name}" not found`, 404);
    }
    if (error instanceof Error) {
      throw new WidgetRenderError(`Failed to fetch repository: ${error.message}`, 500);
    }
    throw error;
  }
}

export interface RawGistData {
  id: string;
  owner: string;
  description: string | null;
  files: { filename: string; language: string | null }[];
}

interface GistApiFile {
  filename?: string;
  language?: string | null;
}

interface GistApiResponse {
  id: string;
  description: string | null;
  owner?: { login: string };
  files: Record<string, GistApiFile>;
}

const GIST_ID_RE = /^[a-zA-Z0-9]+$/;

export async function fetchGistData(gistId: string | undefined): Promise<RawGistData> {
  if (!gistId || !GIST_ID_RE.test(gistId)) {
    throw new WidgetRenderError(`Invalid gist id "${gistId}"`, 400);
  }

  let response: Response;
  try {
    response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        accept: "application/vnd.github+json",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new WidgetRenderError(`Failed to fetch gist: ${message}`, 502);
  }

  if (response.status === 404) {
    throw new WidgetRenderError(`Gist "${gistId}" not found`, 404);
  }
  if (!response.ok) {
    throw new WidgetRenderError(`Failed to fetch gist: GitHub returned ${response.status}`, 502);
  }

  const data = (await response.json()) as GistApiResponse;

  return {
    id: data.id,
    owner: data.owner?.login ?? "anonymous",
    description: data.description,
    files: Object.values(data.files).map((f) => ({
      filename: f.filename ?? "untitled",
      language: f.language ?? null,
    })),
  };
}
