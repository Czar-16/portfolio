import { Hero } from "@/components/hero";
import { WhatIBuild } from "@/components/what-i-build";
import { FeaturedProjects } from "@/components/featured-projects";
import { DashboardSection } from "@/components/dashboard-section";
import { AboutContact } from "@/components/about-contact";
import { PlaylistCard } from "@/components/spotify/PlaylistCard";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <Hero />
      <WhatIBuild />
      <FeaturedProjects />
      <DashboardSection />
      <PlaylistCard />
      <AboutContact />
    </div>
  );
}
