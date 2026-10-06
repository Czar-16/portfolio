"use client";

import { GracefulImage } from "@/components/graceful-image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { projects } from "@/data/projects";
import { GithubIcon, ExternalIcon, ArrowRightIcon } from "@/components/icons";
import { SectionHeading } from "@/components/section-heading";
import { ProjectTechStack } from "@/components/project-tech-stack";

export function FeaturedProjects() {
  const featured = projects.slice(0, 6);

  return (
    <section id="projects" className="py-16 sm:py-20">
      <div className="shell">
        <SectionHeading
          eyebrow="Selected work"
          title="Featured Projects"
          subtitle="A selection of products I've built and shipped."
          action="All projects"
          actionHref="/projects"
        />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-12 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((project) => {
            const liveLink =
              project.links.find((l) => l.label === "Live")?.href ||
              project.links[0]?.href;
            const repoLink = project.links.find(
              (l) => l.label === "GitHub",
            )?.href;

            return (
              <Reveal key={project.slug} className="h-full">
                <div className="card card-lift group flex h-full flex-col overflow-hidden">
                  <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-white/5 bg-black/40">
                    <GracefulImage
                      src={project.image}
                      alt={project.imageAlt}
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="project-image object-cover object-top"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <h3 className="text-xl font-bold">{project.name}</h3>
                      <p className="mt-2 text-sm text-fg-secondary">
                        {project.description}
                      </p>
                      <ProjectTechStack tech={project.tech} projectName={project.name} className="mt-4 gap-2" />
                    </div>
                    <div className="mt-6 flex gap-3">
                      {liveLink && (
                        <a
                          href={liveLink}
                          className="btn btn-primary"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View <ExternalIcon size={13} />
                        </a>
                      )}
                      {repoLink && (
                        <a
                          href={repoLink}
                          className="btn"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <GithubIcon size={14} /> Code
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
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
              <span className="relative inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(59,158,255,0.35)] transition-colors group-hover:bg-accent/90">
                See more projects <ArrowRightIcon size={15} className="interaction-arrow" />
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
