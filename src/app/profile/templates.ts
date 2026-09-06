import { newWidgetInstance, type ProfileConfig } from "./types";

export interface ProfileTemplate {
  key: string;
  label: string;
  description: string;
  build: () => Omit<ProfileConfig, "username" | "name">;
}

/** Starter templates (task 4.7) — apply on top of whatever username/name the user already entered. */
export const PROFILE_TEMPLATES: ProfileTemplate[] = [
  {
    key: "minimal",
    label: "Minimal",
    description: "A short bio and a single streak card.",
    build: () => ({
      bio: "Building things, one commit at a time.",
      socials: [],
      techStack: [],
      widgets: [newWidgetInstance("streak", "")],
      theme: "default",
      layout: "stacked",
      align: "center",
    }),
  },
  {
    key: "developer",
    label: "Developer",
    description: "Stats, top languages, and a pinned repo, with common language badges.",
    build: () => ({
      bio: "Full-stack developer who loves clean code and open source.",
      socials: [
        { id: "s1", platform: "github", value: "" },
        { id: "s2", platform: "linkedin", value: "" },
      ],
      techStack: ["javascript", "typescript", "react", "nodedotjs", "postgresql", "docker"],
      widgets: [newWidgetInstance("stats", ""), newWidgetInstance("top-langs", ""), newWidgetInstance("pin", "")],
      theme: "default",
      layout: "side-by-side",
      align: "center",
    }),
  },
  {
    key: "data-scientist",
    label: "Data Scientist",
    description: "Stats and top languages, with a data/ML tech stack.",
    build: () => ({
      bio: "Data scientist turning numbers into decisions.",
      socials: [
        { id: "s1", platform: "github", value: "" },
        { id: "s2", platform: "medium", value: "" },
      ],
      techStack: ["python", "pandas", "numpy", "pytorch", "tensorflow", "jupyter"],
      widgets: [newWidgetInstance("stats", ""), newWidgetInstance("top-langs", "")],
      theme: "tokyonight",
      layout: "side-by-side",
      align: "center",
    }),
  },
  {
    key: "oss-maintainer",
    label: "Open-Source Maintainer",
    description: "Streak, stats, and pinned project cards to show off maintained work.",
    build: () => ({
      bio: "Maintaining open-source projects, one issue at a time.",
      socials: [
        { id: "s1", platform: "github", value: "" },
        { id: "s2", platform: "x", value: "" },
      ],
      techStack: ["git", "githubactions", "typescript"],
      widgets: [newWidgetInstance("streak", ""), newWidgetInstance("stats", ""), newWidgetInstance("pin", "")],
      theme: "dracula",
      layout: "stacked",
      align: "center",
    }),
  },
  {
    key: "student",
    label: "Student",
    description: "A friendly intro with a streak card and languages you're learning.",
    build: () => ({
      bio: "Computer science student, always learning something new.",
      socials: [
        { id: "s1", platform: "github", value: "" },
        { id: "s2", platform: "linkedin", value: "" },
      ],
      techStack: ["python", "java", "javascript", "git"],
      widgets: [newWidgetInstance("streak", ""), newWidgetInstance("top-langs", "")],
      theme: "radical",
      layout: "stacked",
      align: "center",
    }),
  },
];

export function getProfileTemplate(key: string): ProfileTemplate | undefined {
  return PROFILE_TEMPLATES.find((t) => t.key === key);
}
