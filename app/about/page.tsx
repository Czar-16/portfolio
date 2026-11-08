import Image from "next/image";
import Link from "next/link";
import { site, socials, contact, resume } from "@/data/site";
import { Reveal } from "@/components/reveal";
import { AnimatedName } from "@/components/animated-name";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About Anoop Jha", description: "Learn about Anoop Jha, a full-stack developer building fast, intuitive products, and find contact and professional links.", alternates: { canonical: "/about" } };
import { CopyButton } from "@/components/copy-button";
import {
  GithubIcon,
  XIcon,
  LinkedinIcon,
  MailIcon,
  ArrowRightIcon,
  DownloadIcon,
} from "@/components/icons";

const socialLinks = [
  { label: "GitHub", href: socials.github, icon: GithubIcon },
  { label: "LinkedIn", href: socials.linkedin, icon: LinkedinIcon },
  { label: "X", href: socials.x, icon: XIcon },
] as const;

export default function AboutPage() {
  return (
    <div className="shell py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <section
            aria-labelledby="about-heading"
            className="relative overflow-hidden rounded-3xl border border-line bg-card shadow-card transition-transform duration-180 ease-premium hover:-translate-y-2 hover:shadow-pop hover:border-[color-mix(in_oklab,var(--accent)_50%,transparent)]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-32 size-96 rounded-full bg-accent/6 blur-3xl"
            />

            <div className="relative grid items-center gap-6 p-5">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.16em] uppercase text-fg-muted">
                  <span className="size-1.5 rounded-full bg-accent shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent)_18%,transparent)]" />
                  About me
                </span>
                <h1
                  id="about-heading"
                  className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-fg sm:text-5xl lg:text-6xl"
                >
                  <AnimatedName />
                </h1>
                <p className="mt-4 text-sm font-medium tracking-tight text-fg-secondary">
                  Full-stack developer.
                </p>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-fg-secondary sm:text-[15px]">
                  I turn ideas into fast, intuitive products—from thoughtful
                  interfaces to reliable backends.
                </p>

                <div className="mt-7 inline-flex items-start gap-2.5 text-xs leading-relaxed text-fg-secondary">
                  <span
                    aria-hidden="true"
                    className="mt-1 size-1.5 shrink-0 rounded-full bg-success shadow-[0_0_0_3px_color-mix(in_oklab,var(--success)_12%,transparent)]"
                  />
                  {site.availability}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a href={contact.mailto} className="group inline-flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-5 text-accent-contrast font-medium text-[13px] tracking-[-0.005em] hover:bg-[color-mix(in_oklab,var(--accent)_88%,white)] hover:shadow-[0_14px_40px_-14px_color-mix(in_oklab,var(--accent-glow)_85%,transparent)]">
                    <MailIcon size={15} />
                    Get in touch
                    <ArrowRightIcon size={14} className="transition-transform duration-180 ease-premium group-hover:translate-x-[3px]" />
                  </a>
                  <CopyButton text={contact.email} label="Copy email" />
                  {resume.available && (
                    <a
                      href={resume.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-[color-mix(in_oklab,var(--card-elevated)_82%,transparent)] px-5 text-fg font-medium text-[13px] tracking-[-0.005em] hover:border-[color-mix(in_oklab,var(--line-strong)] hover:bg-[var(--card-elevated)]"
                    >
                      <DownloadIcon size={15} />
                      Resume
                    </a>
                  )}
                </div>

                <p className="mt-4 break-all font-mono text-xs text-fg-secondary">{contact.email}</p>

                <div className="mt-8 flex items-center gap-3 border-t border-line pt-5">
                  <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
                    Elsewhere
                  </span>
                  {socialLinks.map(({ label, href, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full p-1.5 bg-[color-mix(in_oklab,var(--card-elevated)_6%,transparent)] border border-[color-mix(in_oklab,var(--line)_18%,transparent)] text-fg-secondary hover:text-fg hover:border-[color-mix(in_oklab,var(--line)_70%,transparent)] hover:bg-[color-mix(in_oklab,var(--card-elevated)_8%,transparent)] focus-visible:outline-2 focus-visible:outline-[color-mix(in_oklab,var(--accent)_50%,transparent)] focus-visible:outline-offset-2"
                      aria-label={label}
                      title={label}
                    >
                      <Icon size={17} />
                    </a>
                  ))}
                </div>
              </div>

              <div className="order-first mx-auto w-full max-w-[220px] ">
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-bg-soft">
                  <Image
                    src="/profile/profile.jpg"
                    alt="Anoop's profile avatar"
                    fill
                    preload
                    sizes="(min-width: 768px) 280px, 220px"
                    className="object-cover"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between px-1">
                  <span className="font-mono text-[11px] tracking-wide text-fg-secondary">
                    {site.handle}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
                    Build. Learn. Repeat.
                  </span>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal className="mt-5" delay={0.04}>
          <nav aria-label="Explore my work" className="grid gap-4 sm:grid-cols-2">
            {[
              { href: "/projects", label: "Selected work", title: "Explore my projects" },
              { href: "/stack", label: "My toolkit", title: "See what I build with" },
            ].map(({ href, label, title }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-card px-6 py-5 shadow-card transition-transform duration-180 ease-premium hover:-translate-y-2 hover:shadow-pop hover:border-[color-mix(in_oklab,var(--accent)_50%,transparent)]"
              >
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-medium text-fg">{title}</p>
                </div>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-bg-soft text-accent">
                  <ArrowRightIcon size={16} className="transition-transform duration-180 ease-premium group-hover:translate-x-[3px]" />
                </span>
              </Link>
            ))}
          </nav>
        </Reveal>
      </div>
    </div>
  );
}
