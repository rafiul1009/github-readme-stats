export interface TechDef {
  slug: string;
  label: string;
  /** shields.io badge logo slug (simple-icons name); defaults to the slug itself when omitted. */
  logo?: string;
  color: string;
  category: string;
}

/**
 * Curated tech-stack picker (task 4.5). Renders as shields.io badges until
 * the native icon grid (Phase 8) replaces it.
 */
export const TECH_STACK: TechDef[] = [
  // Languages
  { slug: "javascript", label: "JavaScript", color: "F7DF1E", category: "Languages" },
  { slug: "typescript", label: "TypeScript", color: "3178C6", category: "Languages" },
  { slug: "python", label: "Python", color: "3776AB", category: "Languages" },
  { slug: "java", label: "Java", logo: "openjdk", color: "437291", category: "Languages" },
  { slug: "go", label: "Go", color: "00ADD8", category: "Languages" },
  { slug: "rust", label: "Rust", color: "000000", category: "Languages" },
  { slug: "c", label: "C", color: "A8B9CC", category: "Languages" },
  { slug: "cplusplus", label: "C++", color: "00599C", category: "Languages" },
  { slug: "csharp", label: "C#", logo: "csharp", color: "239120", category: "Languages" },
  { slug: "php", label: "PHP", color: "777BB4", category: "Languages" },
  { slug: "ruby", label: "Ruby", color: "CC342D", category: "Languages" },
  { slug: "kotlin", label: "Kotlin", color: "7F52FF", category: "Languages" },
  { slug: "swift", label: "Swift", color: "F05138", category: "Languages" },
  { slug: "dart", label: "Dart", color: "0175C2", category: "Languages" },

  // Frontend
  { slug: "react", label: "React", color: "61DAFB", category: "Frontend" },
  { slug: "nextdotjs", label: "Next.js", color: "000000", category: "Frontend" },
  { slug: "vuedotjs", label: "Vue.js", color: "4FC08D", category: "Frontend" },
  { slug: "svelte", label: "Svelte", color: "FF3E00", category: "Frontend" },
  { slug: "angular", label: "Angular", color: "DD0031", category: "Frontend" },
  { slug: "tailwindcss", label: "Tailwind CSS", color: "06B6D4", category: "Frontend" },
  { slug: "html5", label: "HTML5", color: "E34F26", category: "Frontend" },
  { slug: "css3", label: "CSS3", color: "1572B6", category: "Frontend" },

  // Backend
  { slug: "nodedotjs", label: "Node.js", color: "339933", category: "Backend" },
  { slug: "express", label: "Express", color: "000000", category: "Backend" },
  { slug: "django", label: "Django", color: "092E20", category: "Backend" },
  { slug: "flask", label: "Flask", color: "000000", category: "Backend" },
  { slug: "spring", label: "Spring", color: "6DB33F", category: "Backend" },
  { slug: "graphql", label: "GraphQL", color: "E10098", category: "Backend" },
  { slug: "fastapi", label: "FastAPI", color: "009688", category: "Backend" },

  // Databases
  { slug: "postgresql", label: "PostgreSQL", color: "4169E1", category: "Databases" },
  { slug: "mysql", label: "MySQL", color: "4479A1", category: "Databases" },
  { slug: "mongodb", label: "MongoDB", color: "47A248", category: "Databases" },
  { slug: "redis", label: "Redis", color: "FF4438", category: "Databases" },
  { slug: "sqlite", label: "SQLite", color: "003B57", category: "Databases" },

  // DevOps / Cloud
  { slug: "docker", label: "Docker", color: "2496ED", category: "DevOps" },
  { slug: "kubernetes", label: "Kubernetes", color: "326CE5", category: "DevOps" },
  { slug: "amazonaws", label: "AWS", color: "232F3E", category: "DevOps" },
  { slug: "googlecloud", label: "Google Cloud", color: "4285F4", category: "DevOps" },
  { slug: "vercel", label: "Vercel", color: "000000", category: "DevOps" },
  { slug: "githubactions", label: "GitHub Actions", color: "2088FF", category: "DevOps" },
  { slug: "terraform", label: "Terraform", color: "7B42BC", category: "DevOps" },
  { slug: "linux", label: "Linux", color: "FCC624", category: "DevOps" },

  // Tools
  { slug: "git", label: "Git", color: "F05032", category: "Tools" },
  { slug: "figma", label: "Figma", color: "F24E1E", category: "Tools" },
  { slug: "jest", label: "Jest", color: "C21325", category: "Tools" },
  { slug: "webpack", label: "Webpack", color: "8DD6F9", category: "Tools" },
  { slug: "vite", label: "Vite", color: "646CFF", category: "Tools" },

  // Data / ML
  { slug: "tensorflow", label: "TensorFlow", color: "FF6F00", category: "Data & ML" },
  { slug: "pytorch", label: "PyTorch", color: "EE4C2C", category: "Data & ML" },
  { slug: "pandas", label: "pandas", color: "150458", category: "Data & ML" },
  { slug: "numpy", label: "NumPy", color: "013243", category: "Data & ML" },
  { slug: "jupyter", label: "Jupyter", color: "F37626", category: "Data & ML" },
];

export function getTech(slug: string): TechDef | undefined {
  return TECH_STACK.find((t) => t.slug === slug);
}

export function techCategories(): string[] {
  return Array.from(new Set(TECH_STACK.map((t) => t.category)));
}
