export type StackCategory = { id: string; label: string; items: string[] };

/**
 * Compact, icon-led stack rows. No percentage bars — proficiency bars would
 * be a claim, not a fact.
 */
export const stack: StackCategory[] = [
  {
    id: "languages",
    label: "Languages",
    items: ["C++", "TypeScript", "JavaScript"],
  },
  {
    id: "frontend",
    label: "Frontend",
    items: ["React", "Next.js", "Tailwind CSS", "HTML5", "CSS3"],
  },
  {
    id: "backend",
    label: "Backend",
    items: [
      "Node.js",
      "Express.js",
      "Hono",
      "Cloudflare Workers",
      "Socket.io",
      "REST APIs",
    ],
  },
  {
    id: "data",
    label: "Databases & Auth",
    items: ["MongoDB", "PostgreSQL", "Prisma", "NextAuth", "JWT", "OAuth"],
  },
  {
    id: "devops",
    label: "DevOps & Tools",
    items: ["Docker", "AWS", "Git", "GitHub", "Postman", "Cursor", "Claude Code"],
  },
  {
    id: "concepts",
    label: "Concepts",
    items: ["DSA", "OOP", "System Design", "WebSockets"],
  },
];
