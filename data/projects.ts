export type ProjectLink = { label: string; href: string; external?: boolean };

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  imageAlt: string;
  period: string;
  role: string;
  status: "Live" | "In progress" | "Shipped";
  flagship?: boolean;
  tech: string[];
  highlights: string[];
  links: ProjectLink[];
};

export const projects: Project[] = [
  {
    slug: "designarena",
    name: "DesignArena",
    tagline: "Practice system design with a rubric instead of a rubber stamp.",
    description:
      "AI-powered LLD practice platform where users submit structured designs and receive rubric-based feedback with retry support.",
    image: "/projects/designarena.png",
    imageAlt:
      "DesignArena interface showing a structured design submission and rubric feedback",
    period: "2026",
    role: "Design, build, ship",
    status: "Live",
    flagship: true,
    tech: [
      "Next.js",
      "TypeScript",
      "PostgreSQL",
      "Prisma",
      "OpenRouter",
      "Tailwind CSS",
      "Vitest",
    ],
    highlights: [
      "Structured design submissions",
      "AI evaluation",
      "6 evaluation criteria",
      "Criterion-level feedback",
      "Retry support",
      "Persistent evaluation workflow",
      "Evaluator abstraction",
    ],
    links: [
      {
        label: "Live",
        href: "https://design-arena-omega.vercel.app",
        external: true,
      },
      {
        label: "GitHub",
        href: "https://github.com/Czar-16/DesignArena",
        external: true,
      },
    ],
  },
  {
    slug: "buzzline",
    name: "BuzzLine",
    tagline: "Real-time chat where messages land before you finish thinking.",
    description:
      "Production-grade real-time chat platform with fast messaging and live presence.",
    image: "/projects/buzzline.png",
    imageAlt:
      "BuzzLine chat interface with conversation list and message thread",
    period: "2026",
    role: "Design, build, ship",
    status: "Live",
    tech: [
      "Next.js",
      "TypeScript",
      "MongoDB",
      "Socket.io",
      "NextAuth.js",
      "Shadcn UI",
      "Tailwind CSS",
    ],
    highlights: [
      "<100ms message delivery",
      "Socket.io rooms",
      "Online presence",
      "Last-active tracking",
      "Authentication",
      "Debounced user search",
    ],
    links: [
      {
        label: "Live",
        href: "https://buzzline-seven.vercel.app",
        external: true,
      },
      {
        label: "GitHub",
        href: "https://github.com/Czar-16/BuzzLine",
        external: true,
      },
    ],
  },
  {
    slug: "purepin",
    name: "PurePin",
    tagline: "Grab the original Pinterest image, not the cached preview.",
    description:
      "Pinterest high-resolution image downloader with secure server-side image handling.",
    image: "/projects/purepin.png",
    imageAlt:
      "PurePin downloader interface showing a resolved original-resolution image",
    period: "2026",
    role: "Design, build, ship",
    status: "Live",
    tech: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Shadcn UI",
      "Zod",
      "Vercel Analytics",
    ],
    highlights: [
      "Pinterest CDN handling",
      "Original image resolution",
      "Server-side proxy",
      "CORS handling",
      "Blob downloads",
      "Production deployment",
    ],
    links: [
      { label: "Live", href: "https://purepin.vercel.app", external: true },
      {
        label: "GitHub",
        href: "https://github.com/Czar-16/PurePin",
        external: true,
      },
    ],
  },
  {
    slug: "payloop",
    name: "Payloop",
    tagline:
      "Wallet primitives: balances, transfers and webhook-driven top-ups.",
    description: "Digital wallet application inspired by Paytm and PhonePe.",
    image: "/projects/payloop.png",
    imageAlt:
      "Payloop wallet dashboard showing balance, transactions and transfer actions",
    period: "2026",
    role: "Design, build, ship",
    status: "In progress",
    tech: ["Next.js", "PostgreSQL", "Prisma", "Authentication", "Webhooks"],
    highlights: [
      "Wallet architecture",
      "Balance management",
      "Transactions",
      "Authentication",
      "Webhook workflows",
    ],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/Czar-16/payloop",
        external: true,
      },
    ],
  },
  // test

  {
    slug: "test",
    name: "test",
    tagline: "Grab the original Pinterest image, not the cached preview.",
    description:
      "Pinterest high-resolution image downloader with secure server-side image handling.",
    image: "/projects/purepin.png",
    imageAlt:
      "PurePin downloader interface showing a resolved original-resolution image",
    period: "2026",
    role: "Design, build, ship",
    status: "Live",
    tech: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Shadcn UI",
      "Zod",
      "Vercel Analytics",
    ],
    highlights: [
      "Pinterest CDN handling",
      "Original image resolution",
      "Server-side proxy",
      "CORS handling",
      "Blob downloads",
      "Production deployment",
    ],
    links: [
      { label: "Live", href: "https://purepin.vercel.app", external: true },
      {
        label: "GitHub",
        href: "https://github.com/Czar-16/PurePin",
        external: true,
      },
    ],
  },

  {
    slug: "test",
    name: "test",
    tagline: "Grab the original Pinterest image, not the cached preview.",
    description:
      "Pinterest high-resolution image downloader with secure server-side image handling.",
    image: "/projects/purepin.png",
    imageAlt:
      "PurePin downloader interface showing a resolved original-resolution image",
    period: "2026",
    role: "Design, build, ship",
    status: "Live",
    tech: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Shadcn UI",
      "Zod",
      "Vercel Analytics",
    ],
    highlights: [
      "Pinterest CDN handling",
      "Original image resolution",
      "Server-side proxy",
      "CORS handling",
      "Blob downloads",
      "Production deployment",
    ],
    links: [
      { label: "Live", href: "https://purepin.vercel.app", external: true },
      {
        label: "GitHub",
        href: "https://github.com/Czar-16/PurePin",
        external: true,
      },
    ],
  },

  {
    slug: "test",
    name: "test",
    tagline: "Grab the original Pinterest image, not the cached preview.",
    description:
      "Pinterest high-resolution image downloader with secure server-side image handling.",
    image: "/projects/purepin.png",
    imageAlt:
      "PurePin downloader interface showing a resolved original-resolution image",
    period: "2026",
    role: "Design, build, ship",
    status: "Live",
    tech: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Shadcn UI",
      "Zod",
      "Vercel Analytics",
    ],
    highlights: [
      "Pinterest CDN handling",
      "Original image resolution",
      "Server-side proxy",
      "CORS handling",
      "Blob downloads",
      "Production deployment",
    ],
    links: [
      { label: "Live", href: "https://purepin.vercel.app", external: true },
      {
        label: "GitHub",
        href: "https://github.com/Czar-16/PurePin",
        external: true,
      },
    ],
  },
];

export const flagshipProject =
  projects.find((project) => project.flagship) ?? projects[0];

export const supportingProjects = projects.filter(
  (project) => !project.flagship,
);

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
