/**
 * Single source of truth for identity, navigation and links.
 * Everything the visitor can click or read about "who" lives here.
 */

export const site = {
  name: "Anoop Jha",
  handle: "Czar-16",
  wordmark: "Czar-16.",
  tagline: "Turning ideas into products.",
  title: "Anoop Jha — Full-Stack Developer",
  description:
    "Anoop Jha (Czar-16) is a full-stack developer building real-world products with TypeScript, Next.js and scalable backend systems.",
  positioning:
    "Full-stack developer building real-world products with TypeScript, Next.js, and scalable backend systems.",
  availability: "Open to Software Engineering opportunities",
  locale: "en_IN",
  url: "https://czar-16.dev",
} as const;

export const socials = {
  github: "https://github.com/Czar-16",
  x: "https://x.com/itsCzar16",
  linkedin: "https://linkedin.com/in/-anoop-jha-/",
  email: "anoopjha2003@gmail.com",
} as const;

export const contact = {
  email: socials.email,
  mailto: `mailto:${socials.email}`,
  heading: "Let's build something.",
  subheading:
    "Have an interesting project, opportunity, or just want to talk engineering?",
} as const;

export const resume = {
  href: "https://drive.google.com/file/d/1YCWD6quRauQiCt6l5_O6FiBZG5Efjix3/view?usp=sharing",
  available: true,
} as const;

export type NavItem = { label: string; href: string };

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Stack", href: "/stack" },
  { label: "Movies", href: "/movies" },
  { label: "Quotes", href: "/quotes" },

  { label: "About", href: "/about" },
];

export const github = {
  username: "Czar-16",
  profileUrl: "https://github.com/Czar-16",
  repositoriesUrl: "https://github.com/Czar-16?tab=repositories",
  /** Public endpoints only. No token, no fabricated numbers. */
  api: {
    user: "https://api.github.com/users/Czar-16",
    repos: "https://api.github.com/users/Czar-16/repos?per_page=100&sort=updated",
    events: "https://api.github.com/users/Czar-16/events/public?per_page=100",
    contributions: "https://github.com/users/Czar-16/contributions.json",
  },
} as const;
