import type { Metadata } from "next";
import { resume, site, socials, contact } from "@/data/site";
import { projects } from "@/data/projects";
import { stack } from "@/data/stack";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import {
  DownloadIcon,
  MailIcon,
  GithubIcon,
  LinkedinIcon,
  ArrowRightIcon,
} from "@/components/icons";

function FileTextIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume and professional summary for ${site.name}.`,
};

const experienceHighlights = [
  "Shipped production apps end to end — schema, API, interface and deployment.",
  "Built real-time systems where delivery latency is a product requirement, not a metric.",
  "Designed AI-backed workflows with structured contracts instead of one-shot prompts.",
  "Comfortable owning a feature from data model to deployed UI.",
];

export default function ResumePage() {
  const grouped = projects.map((project) => ({
    name: project.name,
    period: project.period,
    status: project.status,
    tagline: project.tagline,
    tech: project.tech.slice(0, 4),
    href: `/projects/${project.slug}`,
  }));

  return (
    <div className="shell py-16 sm:py-20">
      <SectionHeading
        eyebrow="Resume"
        title="Resume"
        subtitle="A written summary that stays useful whether or not a PDF exists."
      />

      <Reveal className="mt-10">
        {resume.available ? (
          <div className="flex flex-col items-start gap-4 rounded-[14px] border border-success/35 bg-success/8 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-fg">
                Your resume PDF is ready to download.
              </p>
              <p className="mt-1 font-mono text-[11px] text-fg-muted">{resume.href}</p>
            </div>
            <a href={resume.href} download className="btn btn-primary shrink-0">
              <DownloadIcon size={15} />
              Download resume
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-4 rounded-[14px] border border-dashed border-line bg-card/60 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-line bg-bg-soft text-fg-muted">
                <FileTextIcon size={16} />
              </span>
              <div>
                <p className="text-sm font-medium text-fg">
                  Your resume PDF hasn&apos;t been added yet.
                </p>
                <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-fg-secondary">
                  Add it at{" "}
                  <code className="rounded bg-fg/5 px-1.5 py-0.5 font-mono text-[0.85em] text-fg-secondary">
                    public/resume.pdf
                  </code>{" "}
                  and set{" "}
                  <code className="rounded bg-fg/5 px-1.5 py-0.5 font-mono text-[0.85em] text-fg-secondary">
                    resume.available = true
                  </code>{" "}
                  in{" "}
                  <code className="rounded bg-fg/5 px-1.5 py-0.5 font-mono text-[0.85em] text-fg-secondary">
                    data/site.ts
                  </code>
                  . Everything below is the same summary in the meantime.
                </p>
              </div>
            </div>
            <a href={contact.mailto} className="btn shrink-0">
              <MailIcon size={14} />
              Ask for a copy
            </a>
          </div>
        )}
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr] lg:gap-8">
        <div className="flex flex-col gap-6">
          <Reveal>
            <section className="rounded-[14px] border border-line bg-card p-6 shadow-card sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-fg">{site.name}</h2>
              <p className="mt-1.5 text-sm text-accent">{site.positioning}</p>
              <div className="mt-5 border-t border-line pt-5">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
                  Summary
                </h3>
                <p className="mt-3 text-[14px] leading-[1.75] text-fg-secondary">
                  {site.description}
                </p>
                <ul className="mt-5 flex flex-col gap-2.5">
                  {experienceHighlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-start gap-3 text-[14px] leading-relaxed text-fg-secondary"
                    >
                      <span
                        className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                        aria-hidden="true"
                      />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section className="rounded-[14px] border border-line bg-card p-6 shadow-card sm:p-8">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
                Projects
              </h3>
              <div className="mt-4 flex flex-col divide-y divide-line">
                {grouped.map((project) => (
                  <div key={project.name} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h4 className="text-[15px] font-medium text-fg">{project.name}</h4>
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
                        {project.period} · {project.status}
                      </span>
                    </div>
                    <p className="text-[13px] leading-relaxed text-fg-secondary">
                      {project.tagline}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {project.tech.map((tech) => (
                        <span key={tech} className="badge">
                          {tech}
                        </span>
                      ))}
                      <a
                        href={project.href}
                        className="group inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-accent transition-colors hover:text-fg"
                      >
                        Case study
                        <ArrowRightIcon
                          size={12}
                          className="transition-transform duration-200 group-hover:translate-x-0.5"
                        />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        </div>

        <div className="flex flex-col gap-6">
          <Reveal delay={0.05}>
            <section className="rounded-[14px] border border-line bg-card p-6 shadow-card">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
                Tech
              </h3>
              <div className="mt-4 flex flex-col gap-4">
                {stack.map((category) => (
                  <div key={category.id}>
                    <p className="text-[12px] font-medium text-fg-secondary">
                      {category.label}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {category.items.map((item) => (
                        <span key={item} className="badge">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal delay={0.1}>
            <section className="flex flex-col gap-3 rounded-[14px] border border-line bg-card p-6 shadow-card">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
                Get in touch
              </h3>
              <a href={contact.mailto} className="btn btn-primary w-full">
                <MailIcon size={15} />
                Email Anoop
              </a>
              <a
                href={socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn w-full"
              >
                <GithubIcon size={15} />
                View GitHub
              </a>
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="btn w-full"
              >
                <LinkedinIcon size={15} />
                View LinkedIn
              </a>
            </section>
          </Reveal>
        </div>
      </div>
    </div>
  );
}