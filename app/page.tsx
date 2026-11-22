import { SwarmTour } from "@/components/swarm-tour";
import { Hero } from "@/components/hero";
import { FeaturedProjects } from "@/components/featured-projects";
import { DashboardSection } from "@/components/dashboard-section";
import { AboutContact } from "@/components/about-contact";
import { PlaylistCard } from "@/components/spotify/PlaylistCard";
import { VisitorCounter } from "@/components/visitor-counter";

import { CollectionPreviews } from "@/components/collection-previews";
import { ClosingQuote } from "@/components/closing-quote";
import { TerminalCard } from "@/components/TerminalCard";
import { WaveFooterBg } from "@/components/wave-footer-bg";
import type { Metadata } from "next";
import { site } from "@/data/site";

export const metadata: Metadata = { title: site.title, description: site.description, alternates: { canonical: "/" } };

export default function Home() {
  return (
    <div className="flex flex-col flex-1" data-swarm-home>
      <SwarmTour />
      <Hero />
      <FeaturedProjects />
      <DashboardSection />
      <PlaylistCard />
      <CollectionPreviews />
      <section id="terminal" className="section-frame"><h2 className="mb-5">Terminal</h2><TerminalCard /></section>
      <div className="wave-footer relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-black">
        <WaveFooterBg />
        <div className="relative z-10">
          <AboutContact />
          <VisitorCounter />
          <ClosingQuote />
        </div>
      </div>
    </div>
  );
}
