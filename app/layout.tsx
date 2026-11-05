import type { Metadata } from "next";
import { Instrument_Sans, Public_Sans, Manrope, Geist_Mono } from "next/font/google";
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

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const publicSans = Public_Sans({ variable: "--font-public-sans", subsets: ["latin"], preload: false });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], preload: false });

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
      className={`${instrumentSans.variable} ${publicSans.variable} ${manrope.variable} ${geistMono.variable} h-full antialiased`}
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
