import { Hero } from "@/components/hero";
import { WhatIBuild } from "@/components/what-i-build";
import { FeaturedProjects } from "@/components/featured-projects";
import { DashboardSection } from "@/components/dashboard-section";
import { AboutContact } from "@/components/about-contact";
import { PlaylistCard } from "@/components/spotify/PlaylistCard";
import { VisitorCounter } from "@/components/visitor-counter";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <Hero />
      <FeaturedProjects />
      <WhatIBuild />
      <DashboardSection />
      <PlaylistCard />
      <AboutContact />
      <VisitorCounter />
    </div>
  );
}
