"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useReducedMotion } from "@/components/use-reduced-motion";
import { motionEase } from "@/components/motion-provider";
import { GracefulImage } from "@/components/graceful-image";
import { type Project } from "@/data/projects";
import { ProjectTechStack } from "@/components/project-tech-stack";
import { GithubIcon, ExternalIcon, ArrowRightIcon } from "@/components/icons";
import { PrivateRepoButton } from "@/components/private-repo-button";

function ProjectLinks({ project }: { project: Project }) {
  return <div className="project-links">
    {project.cli && <span className="sr-only">CLI / Terminal app</span>}
    {project.links.map(link => {
      if (link.private) return <PrivateRepoButton key={link.href} projectName={project.name} compact={project.links.some(item => !item.private)} />;
      const primary = link.label === "Live" || project.links.filter(item => !item.private).length === 1;
      const icon = primary ? <ArrowRightIcon size={13} /> : link.label === "GitHub" ? <GithubIcon size={14} /> : <ExternalIcon size={13} />;
      const label = link.label === "Live" ? "View Project" : link.label;
      const iconOnly = !primary && link.label === "GitHub";
      return link.external ? <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="project-link" aria-label={iconOnly ? `${project.name} on GitHub` : undefined} title={iconOnly ? "GitHub" : undefined}>{!iconOnly && label}{icon}</a> : <Link key={link.href} href={link.href} className="project-link" aria-label={iconOnly ? `${project.name} on GitHub` : undefined} title={iconOnly ? "GitHub" : undefined}>{!iconOnly && label}{icon}</Link>;
    })}
  </div>;
}

export function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const detailsId = useId();
  const open = hovered || focused;
  const destination = project.links.find(link => link.label === "Live" && !link.private)
    ?? project.links.find(link => link.label === "GitHub")
    ?? project.links[0];
  const reduce = useReducedMotion();
  const transition = { duration: reduce ? 0 : 0.24, ease: motionEase };

  return <article id={project.slug} className="project-card group" data-details-open={open}
    onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }}
    onPointerLeave={event => { if (event.pointerType === "mouse") setHovered(false); }}
    onFocusCapture={() => setFocused(true)}
    onBlurCapture={event => {
      const next = event.relatedTarget;
      if (next instanceof Element && (event.currentTarget.contains(next) ||
        next.closest("[data-project-tech-panel]")?.getAttribute("data-project-tech-panel") === project.name)) return;
      setFocused(false);
    }}
  >
    <h2 className="project-summary-heading">
      <a href={destination.href} className="project-summary"
        target={destination.external ? "_blank" : undefined} rel={destination.external ? "noopener noreferrer" : undefined}
        aria-label={`${project.name}${destination.label === "GitHub" ? " on GitHub" : " live"}`}
        aria-describedby={detailsId}
        title={destination.private ? "Private GitHub repository" : undefined}
      >
        <span className="project-preview block">
          <span className="project-preview-image block">
            <GracefulImage src={project.image} alt={project.imageAlt} sizes="(min-width: 576px) 242px, (min-width: 480px) 42vw, 100vw" className={`project-image ${project.cli ? "object-contain" : "object-cover object-top"}`} />
          </span>
        </span>
        <span className="project-title-row">
          <span className="project-title">{project.name}</span>
          <span className="project-status" data-status={project.status}><span aria-hidden="true" />{project.status}</span>
        </span>
      </a>
    </h2>
    <motion.p id={detailsId} className={`project-description ${open ? "" : "line-clamp-2"}`}
      initial={false} animate={{ height: open ? "auto" : "3.6em" }}
      style={{ overflow: "hidden", minHeight: "3.6em" }} transition={transition}
    >{project.description}</motion.p>
    <div className="project-footer">
      <ProjectTechStack tech={project.tech} projectName={project.name} />
      <ProjectLinks project={project} />
    </div>
  </article>;
}
