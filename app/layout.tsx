import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat } from "next/font/google"; // Added Caveat for hand-style
import "./globals.css";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { CommandPaletteWrapper } from "@/components/command-palette-wrapper";
import { SmoothScroll } from "@/components/smooth-scroll";
import { MotionProvider } from "@/components/motion-provider";
import { BackToTop } from "@/components/back-to-top";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-hand",
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
      className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('czar-theme');if(t==='light'){document.documentElement.dataset.theme='light'}}catch(e){}})();`,
          }}
        />
        <MotionProvider>
          <ThemeProvider>
            <SmoothScroll />
            <Navbar />
            <main id="page-top" tabIndex={-1} className="flex-1 focus:outline-none">{children}</main>
            <BackToTop />
            <CommandPaletteWrapper />
          </ThemeProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
