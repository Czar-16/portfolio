import { ProjectCard } from "@/components/project-card";
import { projects } from "@/data/projects";
import { Reveal, StaggerChildren, StaggerItem } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { GithubIcon, ArrowRightIcon } from "@/components/icons";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Projects", description: "Selected products designed, built, and shipped by Anoop Jha, including their technologies, roles, and project details.", alternates: { canonical: "/projects" } };

const GITHUB_REPOS_URL = "https://github.com/Czar-16?tab=repositories";

function SeeMoreBox() {
  return (
    <div className="card-lift relative overflow-hidden rounded-[14px] border border-line bg-card shadow-card">
      {/* Soft glow */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative grid items-center gap-6 p-5">
        {/* Left: text + button */}
        <div className="flex flex-col items-start gap-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">
            There&apos;s more
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            You&apos;ve seen the good stuff. Now see the chaos
          </h2>
          <p className="max-w-md text-[15px] leading-relaxed text-fg-secondary">
            The bugs are free. The code is open source.
          </p>
          <a
            href={GITHUB_REPOS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-11 items-center justify-center rounded-md border border-[color-mix(in_oklab,var(--line)_18%,transparent)] bg-accent px-5 text-accent-contrast font-medium text-[13px] tracking-[-0.005em] hover:bg-[color-mix(in_oklab,var(--accent)_88%,white)] hover:shadow-[0_14px_40px_-14px_color-mix(in_oklab,var(--accent-glow)_85%,transparent)]"
          >
            <GithubIcon size={15} />
            Enter the chaos
            <ArrowRightIcon size={14} />
          </a>
        </div>

        {/* Right: fake terminal */}
        <div
          className="overflow-hidden rounded-xl border border-line bg-bg-soft shadow-card"
          aria-hidden="true"
        >
          <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-fg-muted/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-fg-muted/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-fg-muted/40" />
            <span className="ml-3 font-mono text-[11px] text-fg-muted">
              ~/czar-16/repos
            </span>
          </div>

          <div className="space-y-2 p-5 font-mono text-[12px] leading-relaxed sm:text-[13px]">
            <p className="text-fg-secondary">
              <span className="text-success">$</span> git log --oneline
            </p>
            <p className="text-fg-secondary">
              <span className="text-accent">a1b2c3d</span> fix: no idea what I
              changed, but it works now
            </p>
            <p className="text-fg-secondary">
              <span className="text-accent">e4f5a6b</span> feat: coffee-driven
              development
            </p>
            <p className="text-fg-secondary">
              <span className="text-accent">9c8d7e6</span> style: made the
              button 2px to the left, life changed
            </p>
            <p className="pt-1 text-fg-secondary">
              <span className="text-success">$</span> open github.com/Czar-16
              <span className="ml-1 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-accent" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <div className="shell py-16 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Selected work"
        title="Projects"
        subtitle="Selected products I've designed, built and shipped."
      />

      <StaggerChildren className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:mt-12 min-[480px]:grid-cols-2">
        {projects.map((project) => (
          <StaggerItem key={project.slug} className="h-full">
            <ProjectCard project={project} />
          </StaggerItem>
        ))}
      </StaggerChildren>

      {/* See more */}
      <Reveal className="mt-16">
        <SeeMoreBox />
      </Reveal>
    </div>
  );
}
