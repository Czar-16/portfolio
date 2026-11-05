import type { Metadata } from "next";
import { Inter, Space_Grotesk, Lora, IBM_Plex_Mono, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AmbientBackground } from "@/components/ambient-background";
import { Navbar } from "@/components/navbar";
import { CommandPaletteWrapper } from "@/components/command-palette-wrapper";
import { SmoothScroll } from "@/components/smooth-scroll";
import { MotionProvider } from "@/components/motion-provider";
import { BackToTop } from "@/components/back-to-top";
import { CursorGlow } from "@/components/cursor-glow";
import { InteractionProvider } from "@/components/interaction-provider";
import { VisitorProvider } from "@/components/visitor-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], preload: false });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"], style: ["normal", "italic"], preload: false });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500", "600", "700"], preload: false });

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
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${spaceGrotesk.variable} ${lora.variable} ${plexMono.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head><script dangerouslySetInnerHTML={{ __html: `(()=>{let t,b,f;try{t=localStorage.getItem('czar-theme');b=localStorage.getItem('czar-background');f=localStorage.getItem('czar-font')}catch{}document.documentElement.dataset.font=['contrast','developer'].includes(f)?f:'clean';document.documentElement.dataset.background=['particles','constellation','bokeh','spotlight'].includes(b)?b:'aurora';document.documentElement.dataset.theme=t==='light'||t==='dark'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'})()` }} /></head>
      <body className="min-h-dvh flex flex-col">
        <AmbientBackground />
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
