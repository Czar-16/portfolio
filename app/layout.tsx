import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { CommandPaletteWrapper } from "@/components/command-palette-wrapper";
import { SmoothScroll } from "@/components/smooth-scroll";
import { MotionProvider } from "@/components/motion-provider";
import { BackToTop } from "@/components/back-to-top";
import { CursorGlow } from "@/components/cursor-glow";
import { InteractionProvider } from "@/components/interaction-provider";
import { VisitorProvider } from "@/components/visitor-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anoop Jha — Full-Stack Developer",
  description: "Portfolio of Anoop Jha, a full-stack developer.",
  openGraph: {
    title: "Anoop Jha — Full-Stack Developer",
    description: "Portfolio of Anoop Jha, a full-stack developer.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col">
        <MotionProvider>
          <InteractionProvider>
            <VisitorProvider>
              <SmoothScroll />
              <Navbar />
              <main id="page-top" tabIndex={-1} className="portfolio-column flex-1 focus:outline-none">{children}</main>
              <BackToTop />
              <CommandPaletteWrapper />
            </VisitorProvider>
          </InteractionProvider>
        </MotionProvider>
        <CursorGlow />
      </body>
    </html>
  );
}
