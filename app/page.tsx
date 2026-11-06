import { SwarmTour } from "@/components/swarm-tour";
import { Hero } from "@/components/hero";
import { FeaturedProjects } from "@/components/featured-projects";
import { DashboardSection } from "@/components/dashboard-section";
import { AboutContact } from "@/components/about-contact";
import { PlaylistCard } from "@/components/spotify/PlaylistCard";

import { CollectionPreviews } from "@/components/collection-previews";
import { ClosingQuote } from "@/components/closing-quote";
import { TerminalCard } from "@/components/TerminalCard";

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
      <AboutContact />
      <ClosingQuote />
    </div>
  );
}
