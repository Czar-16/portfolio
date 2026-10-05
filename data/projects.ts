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
    description:
      "Full-stack digital wallet demo with balance management, peer-to-peer transfers and top-ups settled through a mock bank webhook service.",
    image: "/projects/payloop.png",
    imageAlt:
      "Payloop wallet dashboard showing balance, transactions and transfer actions",
    period: "2026",
    role: "Design, build, ship",
    status: "Live",
    tech: [
      "Next.js",
      "TypeScript",
      "PostgreSQL",
      "Prisma",
      "Auth.js",
      "Express",
      "Zod",
      "Turborepo",
    ],
    highlights: [
      "Balance management",
      "Peer-to-peer transfers",
      "Transaction history",
      "Authentication",
      "Mock bank top-ups",
      "Signed, idempotent webhooks",
    ],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/Czar-16/payloop",
        external: true,
      },
    ],
  },
  {
    slug: "stellar-blue",
    name: "Stellar Blue",
    tagline: "A cool, blue-toned dark theme for VS Code.",
    description:
      "Color theme for VS Code, published on the Visual Studio Marketplace.",
    image: "/projects/stellarblue.png",
    imageAlt:
      "Stellar Blue VS Code theme showing syntax-highlighted code in the editor",
    period: "2025",
    role: "Design, build, publish",
    status: "Live",
    tech: ["VS Code Themes", "JSONC", "TextMate Scopes"],
    highlights: [
      "Syntax token coloring",
      "Editor and UI theming",
      "400+ Installs in VS Code Marketplace",
      "Integrated terminal colors",
    ],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/Czar-16/Stellar-Blue",
        external: true,
      },
      {
        label: "Live",
        href: "https://marketplace.visualstudio.com/items?itemName=AnoopJha.stellar-blue",
        external: true,
      },
    ],
  },
  {
    slug: "blackout",
    name: "Blackout",
    tagline: "Toggle dark mode on any website with a single click.",
    description:
      "Lightweight browser extension that instantly switches any webpage to a dark theme.",
    image: "/projects/blackout.png",
    imageAlt: "Blackout extension popup with a dark mode toggle switch",
    period: "2026",
    role: "Design, build, ship",
    status: "Live",
    tech: ["JavaScript", "Manifest V3", "HTML", "CSS"],
    highlights: [
      "Dark mode on any site",
      "CSS color inversion",
      "Single-switch popup UI",
      "Content script injection",
      "Published on Firefox Add-ons",
    ],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/Czar-16/Blackout",
        external: true,
      },
      {
        label: "Live",
        href: "https://addons.mozilla.org/en-US/firefox/addon/blackout-toggle/",
        external: true,
      },
    ],
  },
  {
    slug: "musicmentor",
    name: "MusicMentor",
    tagline:
      "A music education site with animated, interactive course discovery.",
    description:
      "Music education frontend showcasing courses, instructors, testimonials and webinar topics with a responsive, animated interface.",
    image: "/projects/musicmentor.png",
    imageAlt:
      "MusicMentor home page with hero section and featured music courses",
    period: "2025",
    role: "Design, build, ship",
    status: "Live",
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Motion"],
    highlights: [
      "Course catalog",
      "3D interactive cards",
      "Animated backgrounds",
      "Responsive layouts",
      "Contact interface",
    ],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/Czar-16/MusicMentor",
        external: true,
      },
      {
        label: "Live",
        href: "https://musicmentor.netlify.app",
        external: true,
      },
    ],
  },

  {
    slug: "TruMsg",
    name: "TruMsg",
    tagline: "Receive anonymous feedback through a shareable profile link.",
    description:
      "Full-stack feedback platform where visitors send anonymous messages to registered users, who manage received messages through email-verified accounts.",
    image: "/projects/TruMsg.png",
    imageAlt:
      "TruMsg home page with an anonymous feedback hero and message carousel",
    period: "2026",
    role: "Design, build, ship",
    status: "Shipped",
    tech: [
      "Next.js",
      "TypeScript",
      "MongoDB",
      "Mongoose",
      "NextAuth.js",
      "Zod",
      "Resend",
      "Gemini",
      "Vercel AI SDK",
    ],
    highlights: [
      "Anonymous submissions",
      "Email verification",
      "Authentication",
      "Message management API",
      "Message acceptance controls",
      "AI-generated message suggestions",
      "Schema validation",
    ],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/Czar-16/TruMsg",
        external: true,
      },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
