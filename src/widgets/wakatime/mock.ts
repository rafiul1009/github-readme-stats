import type { RawWakaTimeData } from "@/lib/wakatime";

/** Sample WakaTime stats used by the builder's live preview — no network call. */
export function getMockWakaTimeData(): RawWakaTimeData {
  return {
    languages: [
      { name: "TypeScript", percent: 42.5, text: "18 hrs 30 mins", color: "#3178c6" },
      { name: "Python", percent: 21.3, text: "9 hrs 15 mins", color: "#3572A5" },
      { name: "Go", percent: 14.1, text: "6 hrs 5 mins", color: "#00ADD8" },
      { name: "CSS", percent: 10.8, text: "4 hrs 40 mins", color: "#663399" },
      { name: "Markdown", percent: 6.5, text: "2 hrs 50 mins", color: "#083fa1" },
      { name: "JSON", percent: 4.8, text: "2 hrs 5 mins", color: "#292929" },
    ],
    totalText: "43 hrs 25 mins",
  };
}
