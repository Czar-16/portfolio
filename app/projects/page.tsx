import Image from "next/image";
import Link from "next/link";
import {
  projects,
  flagshipProject,
  supportingProjects,
  type Project,
} from "@/data/projects";
import { Reveal, StaggerChildren, StaggerItem } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { GithubIcon, ExternalIcon, ArrowRightIcon } from "@/components/icons";

function ProjectLinks({ project, className = "" }: { project: Project; className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
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
  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-[14px] border border-line bg-card shadow-card transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-pop ${
        featured ? "lg:flex-row" : ""
      }`}
    >
      <div className={`relative shrink-0 ${featured ? "lg:w-[58%]" : "aspect-video"}`}>
        <Image
          src={project.image}
          alt={project.imageAlt}
          fill
          sizes={
            featured
              ? "(min-width: 1024px) 55vw, 100vw"
              : "(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
          }
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {project.flagship && (
          <span className="absolute left-4 top-4 rounded-md border border-accent/40 bg-black/65 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-accent backdrop-blur-sm">
            Flagship
          </span>
        )}
      </div>

      <div
        className={`flex flex-1 flex-col gap-4 p-6 ${featured ? "lg:w-[42%] lg:justify-center lg:p-10" : ""}`}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className={`font-semibold tracking-tight text-fg ${featured ? "text-2xl lg:text-3xl" : "text-lg"}`}>
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

        <p className="font-mono text-[11px] text-fg-muted">
          {project.period} · {project.role}
        </p>

        <p className={`text-fg-secondary ${featured ? "text-[15px] leading-relaxed" : "text-[13px] leading-relaxed"}`}>
          {project.description}
        </p>

        {featured && (
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {project.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2 text-[13px] text-fg-secondary">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                {highlight}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-1.5">
          {project.tech.slice(0, 4).map((tech) => (
            <span key={tech} className="badge">
              {tech}
            </span>
          ))}
          {project.tech.length > 4 && (
            <span className="badge text-fg-muted">+{project.tech.length - 4}</span>
          )}
        </div>

        <ProjectLinks project={project} className="mt-auto pt-2" />
      </div>
    </article>
  );
}

export default function ProjectsPage() {
  return (
    <div className="shell py-16 sm:py-20">
      <SectionHeading
        eyebrow="Projects"
        title="Projects"
        subtitle="Selected products I've designed, built and shipped."
      />

      <Reveal className="mt-12">
        <ProjectCard project={flagshipProject} featured />
      </Reveal>

      <StaggerChildren className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {supportingProjects.map((project) => (
          <StaggerItem key={project.slug} className="h-full">
            <ProjectCard project={project} />
          </StaggerItem>
        ))}
      </StaggerChildren>

      <Reveal className="mt-12">
        <div className="flex flex-col items-center gap-3 rounded-[14px] border border-line bg-card px-6 py-10 text-center">
          <p className="text-sm text-fg-secondary">
            All {projects.length} projects are open source — read the code, not just the
            screenshots.
          </p>
          <a
            href="https://github.com/Czar-16?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            <GithubIcon size={15} />
            Browse GitHub
          </a>
        </div>
      </Reveal>
    </div>
  );
}