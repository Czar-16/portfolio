import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Instrument_Sans, Public_Sans, Manrope, Geist_Mono, Bangers } from "next/font/google";
import "./globals.css";
import { AmbientBackground } from "@/components/ambient-background";
import { CursorCompanion } from "@/components/cursor-companion";
import { Navbar } from "@/components/navbar";
import { CommandPaletteWrapper } from "@/components/command-palette-wrapper";
import { MotionProvider } from "@/components/motion-provider";
import { BackToTop } from "@/components/back-to-top";
import { CursorGlow } from "@/components/cursor-glow";
import { InteractionProvider } from "@/components/interaction-provider";
import { INTRO_BOOTSTRAP } from "@/components/intro-preferences";
import { VisitorProvider } from "@/components/visitor-provider";
import { CursorWetTrail } from "@/components/cursor-wet-trail";
import { site, socials } from "@/data/site";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bangers = Bangers({
  variable: "--font-bangers",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const publicSans = Public_Sans({ variable: "--font-public-sans", subsets: ["latin"], preload: false });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  category: "technology",
  creator: site.name,
  publisher: site.name,
  openGraph: {
    title: site.title,
    description: site.description,
    type: "website",
    url: site.url,
    siteName: site.name,
    locale: site.locale,
    images: [{ url: "/profile/profile.jpg", width: 600, height: 600, alt: "Anoop Jha" }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: [{ url: "/profile/profile.jpg", alt: "Anoop Jha" }],
    creator: "@itsCzar16",
  },
  authors: [{ name: site.name, url: site.url }],
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
      data-background="particles"
      data-scroll-behavior="smooth"
      className={`${instrumentSans.variable} ${publicSans.variable} ${manrope.variable} ${geistMono.variable} ${bangers.variable} h-full antialiased`}
    >
      <head><script dangerouslySetInnerHTML={{ __html: `(()=>{let t,b,f;try{t=localStorage.getItem('czar-theme');b=localStorage.getItem('czar-background');f=localStorage.getItem('czar-font')}catch{}document.documentElement.dataset.font=['contrast','developer'].includes(f)?f:'clean';document.documentElement.dataset.background=['aurora','constellation','bokeh','spotlight'].includes(b)?b:'particles';document.documentElement.dataset.theme=t==='light'||t==='dark'?t:'dark'})()` }} /><script dangerouslySetInnerHTML={{ __html: INTRO_BOOTSTRAP }} /></head>
      <body className="min-h-dvh flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "Person", "@id": `${site.url}/#person`, name: site.name, alternateName: site.handle, url: site.url, image: `${site.url}/profile/profile.jpg`, jobTitle: "Full-Stack Developer", description: site.positioning, sameAs: [socials.github, socials.x, socials.linkedin] },
            { "@type": "WebSite", "@id": `${site.url}/#website`, name: site.title, url: site.url, description: site.description, inLanguage: site.locale, author: { "@id": `${site.url}/#person` } },
          ],
        }).replace(/</g, "\\u003c") }} />
        <AmbientBackground />
        <MotionProvider>
          <InteractionProvider>
            <VisitorProvider>
              <CursorCompanion>
                <Navbar />
                <main id="page-top" tabIndex={-1} className="portfolio-column flex-1 focus:outline-none">{children}</main>
                <BackToTop />
                <CommandPaletteWrapper />
              </CursorCompanion>
            </VisitorProvider>
          </InteractionProvider>
        </MotionProvider>
        <CursorGlow />
        <CursorWetTrail />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
