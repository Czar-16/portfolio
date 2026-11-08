"use client";

import { ProjectCard } from "@/components/project-card";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { projects } from "@/data/projects";
import { ArrowRightIcon } from "@/components/icons";
import { SectionHeading } from "@/components/section-heading";

export function FeaturedProjects() {
  const featuredOrder = ["mailloop", "purepin", "formpilot"];
  const featured = [
    ...featuredOrder.flatMap((slug) =>
      projects.filter((project) => project.slug === slug),
    ),
    ...projects.filter((project) => !featuredOrder.includes(project.slug)),
  ].slice(0, 6);

  return (
    <section id="projects" className="section-frame featured-projects">
      <div className="shell">
        <SectionHeading
          eyebrow="Selected work"
          title="Featured Projects"
          subtitle="A selection of products I've built and shipped."
          action="All projects"
          actionHref="/projects"
        />
        <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-8 min-[480px]:grid-cols-2">
          {featured.map(project => <Reveal key={project.slug} className="h-full"><ProjectCard project={project} /></Reveal>)}
        </div>

        {projects.length > 6 && (
          <div className="mt-10">
            <Link
              href="/projects"
              className="interactive-card group relative flex flex-col items-start justify-between gap-5 overflow-hidden rounded-[14px] border border-line bg-card px-6 py-6 shadow-card hover:border-accent/30 hover:shadow-pop sm:flex-row sm:items-center md:px-8 md:py-7"
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl"
                aria-hidden="true"
              />
              <div className="relative min-w-0 flex flex-col gap-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">
                  Keep exploring
                </p>
                <p className="text-lg font-semibold tracking-tight text-fg md:text-xl">
                  More projects hiding in the shadows.
                </p>
                <p className="text-sm text-fg-secondary">
                  All builds, experiments and shipped things live on the
                  projects page.
                </p>
              </div>
              <span className="relative inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-contrast transition-colors group-hover:bg-accent/90">
                See more projects <ArrowRightIcon size={15} className="transition-transform duration-180 ease-premium group-hover:translate-x-[3px]" />
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
