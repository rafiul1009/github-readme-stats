import { WidgetRenderError } from "@/widgets/errors";

/**
 * npm's public registry + download-counts APIs (docs/TODOS.md 11.6) — both
 * fully public, no auth, no API key, ever.
 */

export interface NpmPackageStats {
  name: string;
  version: string;
  weeklyDownloads: number;
}

interface NpmDownloadsResponse {
  downloads: number;
}

interface NpmRegistryResponse {
  "dist-tags"?: { latest?: string };
}

export async function fetchNpmPackageStats(packageName: string): Promise<NpmPackageStats> {
  const encoded = encodeURIComponent(packageName);

  let downloadsResponse: Response;
  let registryResponse: Response;
  try {
    [downloadsResponse, registryResponse] = await Promise.all([
      fetch(`https://api.npmjs.org/downloads/point/last-week/${encoded}`),
      fetch(`https://registry.npmjs.org/${encoded}`),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new WidgetRenderError(`Failed to fetch npm stats: ${message}`, 502);
  }

  if (downloadsResponse.status === 404 || registryResponse.status === 404) {
    throw new WidgetRenderError(`npm package "${packageName}" not found`, 404);
  }
  if (!downloadsResponse.ok || !registryResponse.ok) {
    throw new WidgetRenderError(
      `Failed to fetch npm stats: registry returned ${downloadsResponse.status}/${registryResponse.status}`,
      502
    );
  }

  const downloads = (await downloadsResponse.json()) as NpmDownloadsResponse;
  const registry = (await registryResponse.json()) as NpmRegistryResponse;

  return {
    name: packageName,
    version: registry["dist-tags"]?.latest ?? "unknown",
    weeklyDownloads: downloads.downloads,
  };
}
