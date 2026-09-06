/**
 * GitHub Action delivery mode (docs/PLAN.md §6, tasks 5.5/5.6): renders a
 * widget on a schedule and commits the SVG straight into the user's own
 * repo, so their README has zero runtime dependency on our hosting uptime
 * — the same reliability trick streak-stats itself offers. The workflow
 * uses the repo's built-in `GITHUB_TOKEN` (no PAT setup needed) since it
 * only ever commits to the same repo that runs it.
 */
export function suggestedOutputPath(widgetType: string): string {
  return `profile/${widgetType}.svg`;
}

export function buildWorkflowYaml(imageUrl: string, outputPath: string): string {
  return `name: Update GitHub README widget

on:
  schedule:
    - cron: "0 */12 * * *" # every 12 hours — adjust to taste
  workflow_dispatch: {} # lets you trigger it manually from the Actions tab

jobs:
  render:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4

      - name: Fetch the widget SVG
        run: |
          mkdir -p "$(dirname '${outputPath}')"
          curl -fsSL "${imageUrl}" -o "${outputPath}"

      - name: Commit if it changed
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add "${outputPath}"
          git diff --cached --quiet || git commit -m "chore: update ${outputPath}"
          git push
`;
}
