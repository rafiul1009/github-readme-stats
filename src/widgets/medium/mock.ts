import type { MediumPost } from "@/lib/medium";

export function getMockMediumPosts(): MediumPost[] {
  return [
    { title: "How We Rebuilt Our Rendering Pipeline From Scratch", link: "https://medium.com/@octocat/post-1", pubDate: "2026-08-20T00:00:00Z" },
    { title: "Five Lessons From a Year of Open Source Maintenance", link: "https://medium.com/@octocat/post-2", pubDate: "2026-07-02T00:00:00Z" },
    { title: "Why We Chose SVG Over Canvas for Widget Rendering", link: "https://medium.com/@octocat/post-3", pubDate: "2026-05-14T00:00:00Z" },
  ];
}
