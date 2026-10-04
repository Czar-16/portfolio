import Image from "next/image";
import Link from "next/link";
import {
  flagshipProject,
  supportingProjects,
  type Project,
} from "@/data/projects";
import { Reveal, StaggerChildren, StaggerItem } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { GithubIcon, ExternalIcon, ArrowRightIcon } from "@/components/icons";

const GITHUB_REPOS_URL = "https://github.com/Czar-16?tab=repositories";

function ProjectLinks({ project }: { project: Project }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {project.links.map((link) => {
        const icon =
          link.label === "GitHub" ? (
            <GithubIcon size={14} />
          ) : link.external ? (
            <ExternalIcon size={13} />
          ) : (
            <ArrowRightIcon size={14} />
          );

        return link.external ? (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            {icon}
            {link.label}
          </a>
        ) : (
          <Link key={link.href} href={link.href} className="btn">
            {icon}
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}

function ProjectCard({
  project,
  featured = false,
}: {
  project: Project;
  featured?: boolean;
}) {
  const visibleTech = project.tech.slice(0, featured ? 5 : 4);
  const hiddenTech = project.tech.length - visibleTech.length;

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-[14px] border border-line bg-card shadow-card transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-pop ${
        featured ? "lg:flex-row" : ""
      }`}
    >
      {/* Media */}
      <div
        className={`relative aspect-video shrink-0 overflow-hidden ${
          featured ? "lg:aspect-auto lg:min-h-[420px] lg:w-[56%]" : ""
        }`}
      >
        <Image
          src={project.image}
          alt={project.imageAlt}
          fill
          priority={featured}
          sizes={
            featured
              ? "(min-width: 1024px) 56vw, 100vw"
              : "(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
          }
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {project.flagship && (
          <span className="absolute left-4 top-4 rounded-md border border-accent/40 bg-black/65 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-accent backdrop-blur-sm">
            Flagship
          </span>
        )}
      </div>

      {/* Content */}
      <div
        className={`flex flex-1 flex-col gap-4 p-6 ${
          featured ? "lg:w-[44%] lg:p-10" : ""
        }`}
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2
              className={`font-semibold tracking-tight text-fg ${
                featured ? "text-2xl lg:text-3xl" : "text-lg"
              }`}
            >
              {project.name}
            </h2>
            <span
              className={`badge ${
                project.status === "Live"
                  ? "border-success/40 text-success"
                  : "text-fg-muted"
              }`}
            >
              {project.status}
            </span>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-fg-muted">
            {project.period}
          </p>
        </div>

        <p
          className={`text-fg-secondary ${
            featured
              ? "text-[15px] leading-relaxed"
              : "line-clamp-3 text-[13px] leading-relaxed"
          }`}
        >
          {project.description}
        </p>

        {featured && (
          <ul className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {project.highlights.slice(0, 4).map((highlight) => (
              <li
                key={highlight}
                className="flex items-start gap-2 text-[13px] leading-snug text-fg-secondary"
              >
                <span
                  className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-accent"
                  aria-hidden="true"
                />
                {highlight}
              </li>
            ))}
          </ul>
        )}

        {/* Bottom block: always aligned across cards */}
        <div className="mt-auto flex flex-col gap-4 pt-2">
          <div className="flex flex-wrap gap-1.5">
            {visibleTech.map((tech) => (
              <span key={tech} className="badge">
                {tech}
              </span>
            ))}
            {hiddenTech > 0 && (
              <span className="badge text-fg-muted">+{hiddenTech}</span>
            )}
          </div>

          <div className="border-t border-line pt-4">
            <ProjectLinks project={project} />
          </div>
        </div>
      </div>
    </article>
  );
}

function SeeMoreBox() {
  return (
    <div className="relative overflow-hidden rounded-[14px] border border-line bg-card shadow-card">
      {/* Soft glow */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:gap-14">
        {/* Left: text + button */}
        <div className="flex flex-col items-start gap-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">
            There&apos;s more
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            You've seen the good stuff. Now see the chaos
          </h2>
          <p className="max-w-md text-[15px] leading-relaxed text-fg-secondary">
            The bugs are free. The code is open source.
          </p>
          <a
            href={GITHUB_REPOS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary mt-2"
          >
            <GithubIcon size={15} />
            Enter the chaos
            <ArrowRightIcon size={14} />
          </a>
        </div>

        {/* Right: fake terminal */}
        <div
          className="overflow-hidden rounded-xl border border-line bg-black/30 shadow-card"
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
        eyebrow="Selected work"
        title="Projects"
        subtitle="Selected products I've designed, built and shipped."
      />

      {/* Flagship */}
      <Reveal className="mt-12">
        <ProjectCard project={flagshipProject} featured />
      </Reveal>

      {/* Supporting projects */}
      <StaggerChildren className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {supportingProjects.map((project) => (
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
