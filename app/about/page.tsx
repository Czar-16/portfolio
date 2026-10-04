import Link from "next/link";
import { site, socials, contact } from "@/data/site";
import { stack } from "@/data/stack";
import { Reveal, StaggerChildren, StaggerItem } from "@/components/reveal";
import {
  GithubIcon,
  XIcon,
  LinkedinIcon,
  MailIcon,
  ExternalIcon,
  ArrowRightIcon,
} from "@/components/icons";

const channels = [
  { label: "Email", value: socials.email, href: contact.mailto, icon: MailIcon },
  {
    label: "GitHub",
    value: `@${site.handle}`,
    href: socials.github,
    icon: GithubIcon,
  },
  { label: "X", value: "@itsCzar16", href: socials.x, icon: XIcon },
  {
    label: "LinkedIn",
    value: "in/anoop-jha",
    href: socials.linkedin,
    icon: LinkedinIcon,
  },
] as const;

export default function AboutPage() {
  return (
    <div className="shell py-16 sm:py-20">
      <Reveal>
        <section>
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            About
          </span>
          <p className="mt-6 max-w-3xl text-2xl leading-[1.35] tracking-tight text-fg sm:text-3xl lg:text-[2.6rem]">
            I&apos;m Anoop, a Computer Science engineer who enjoys turning ideas into
            products. I like working across the stack—from interfaces and APIs to
            databases, real-time systems and AI-powered workflows.
          </p>
          <p className="mt-6 max-w-2xl text-[15px] leading-[1.75] text-fg-secondary">
            Most of my work sits where the interesting problems are: modelling state
            correctly, keeping the feedback loop honest, and shipping something that
            actually holds up after the first deploy. I care about code that the next
            person — including future me — can read.
          </p>

          <div className="mt-7 inline-flex items-center gap-2.5 rounded-full border border-success/30 bg-success/8 px-4 py-2">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-[13px] text-fg-secondary">{site.availability}</span>
          </div>
        </section>
      </Reveal>

      <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <section className="flex h-full flex-col rounded-[14px] border border-line bg-card p-6 shadow-card sm:p-8">
            <h2 className="text-lg font-semibold tracking-tight text-fg">Contact</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-fg-secondary">
              Fastest way to reach me is email. Everything else is kept active too.
            </p>

            <ul className="mt-6 flex flex-col divide-y divide-line">
              {channels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <li key={channel.label}>
                    <a
                      href={channel.href}
                      target={channel.href.startsWith("mailto:") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 py-3.5 transition-colors"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-line bg-bg-soft text-fg-secondary transition-colors group-hover:border-accent/45 group-hover:text-accent">
                        <Icon size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
                          {channel.label}
                        </span>
                        <span className="mt-0.5 block truncate text-[13px] text-fg-secondary transition-colors group-hover:text-fg">
                          {channel.value}
                        </span>
                      </span>
                      <ExternalIcon
                        size={13}
                        className="shrink-0 text-fg-muted opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex gap-2 border-t border-line pt-5">
              <a
                href={contact.mailto}
                className="icon-btn border border-line"
                aria-label="Send an email"
                title="Send an email"
              >
                <MailIcon size={16} />
              </a>
              <a
                href={socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="icon-btn border border-line"
                aria-label="GitHub"
                title="GitHub"
              >
                <GithubIcon size={16} />
              </a>
              <a
                href={socials.x}
                target="_blank"
                rel="noopener noreferrer"
                className="icon-btn border border-line"
                aria-label="X (Twitter)"
                title="X (Twitter)"
              >
                <XIcon size={15} />
              </a>
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="icon-btn border border-line"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <LinkedinIcon size={16} />
              </a>
              <a href={contact.mailto} className="btn btn-primary ml-auto">
                <MailIcon size={14} />
                Email me
              </a>
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.06}>
          <section className="flex h-full flex-col rounded-[14px] border border-line bg-card p-6 shadow-card sm:p-8">
            <h2 className="text-lg font-semibold tracking-tight text-fg">
              Where the work happens
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-fg-secondary">
              The tools behind the projects on this site.
            </p>

            <StaggerChildren className="mt-6 flex flex-col gap-4" gap={0.05}>
              {stack.slice(0, 4).map((category) => (
                <StaggerItem key={category.id}>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
                      {category.label}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {category.items.slice(0, 6).map((item) => (
                        <span key={item} className="badge">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>

            <Link
              href="/stack"
              className="group mt-6 inline-flex items-center gap-1.5 self-start border-t border-line pt-5 text-[13px] font-medium text-accent transition-colors hover:text-fg"
            >
              Full tech stack
              <ArrowRightIcon
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </section>
        </Reveal>
      </div>

      <Reveal className="mt-6">
        <section className="flex flex-col items-center gap-5 rounded-[14px] border border-line bg-card px-6 py-12 text-center sm:py-14">
          <h2 className="max-w-lg text-xl font-semibold tracking-tight text-fg sm:text-2xl">
            {contact.subheading}
          </h2>
          <p className="max-w-md text-[14px] leading-relaxed text-fg-secondary">
            I&apos;m happy to talk through architecture, review a design doc, or dig into
            something you&apos;re stuck on.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <a href={contact.mailto} className="btn btn-primary">
              <MailIcon size={15} />
              Email Anoop
            </a>
            <a
              href={socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
            >
              <GithubIcon size={15} />
              View GitHub
            </a>
            <Link href="/projects" className="btn">
              See projects
              <ArrowRightIcon size={14} />
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
}