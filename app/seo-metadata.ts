import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://czar-16.dev"),
  title: "Anoop Jha — Full-Stack Developer",
  description:
    "Anoop Jha (Czar16) is a full-stack developer building real-world products with TypeScript, Next.js and scalable backend systems.",
  openGraph: {
    title: "Anoop Jha — Full-Stack Developer",
    description:
      "Anoop Jha (Czar16) is a full-stack developer building real-world products with TypeScript, Next.js and scalable backend systems.",
    url: "https://czar-16.dev",
    siteName: "Czar16",
    images: [
      {
        url: "/og-card.png",
        width: 1200,
        height: 630,
        alt: "Anoop Jha — Full-Stack Developer",
      },
    ],
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anoop Jha — Full-Stack Developer",
    description:
      "Full-stack developer building real-world products with TypeScript, Next.js and scalable backend systems.",
    images: ["/og-card.png"],
    creator: "@itsCzar16",
  },
  icons: {
    icon: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
};
