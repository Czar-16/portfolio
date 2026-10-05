import Link from "next/link";
import {
  ArrowRightIcon,
  GithubIcon,
  XIcon,
  LinkedinIcon,
  MailIcon,
} from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { contact, site, socials } from "@/data/site";

const socialLinks = [
  { label: "GitHub", href: socials.github, icon: GithubIcon },
  { label: "X", href: socials.x, icon: XIcon },
  { label: "LinkedIn", href: socials.linkedin, icon: LinkedinIcon },
] as const;

export function AboutContact() {
  return (
    <section className="py-20" aria-labelledby="about-contact-heading">
      <div className="shell grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-12 lg:gap-20">
        <Reveal>
          <div className="flex flex-col items-start">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              About me
            </span>
            <h2
              id="about-contact-heading"
              className="mt-5 max-w-lg text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
            >
              Thoughtful code.
              <br />
              <span className="text-accent">Meaningful experiences.</span>
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-[1.8] text-fg-secondary">
              I&apos;m Anoop Jha also known as Czar 16, a full-stack AI
              developer passionate about building performant and accessible web
              applications. With a focus on modern technologies and clean
              design, I turn ideas into products that feel good to use.
            </p>
            <Link
              href="/about"
              className="interactive group mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-fg"
            >
              More about me
              <ArrowRightIcon size={15} className="interaction-arrow" />
            </Link>
            <div className="mt-7 flex items-center gap-2 border-t border-line pt-5">
              <a
                href={contact.mailto}
                className="icon-btn border border-line"
                aria-label="Send Anoop an email"
                title="Email"
              >
                <MailIcon size={16} />
              </a>
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="icon-btn border border-line"
                  aria-label={`Anoop on ${label}`}
                  title={label}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="h-full">
          <div className="card motion-card relative flex h-full flex-col justify-center overflow-hidden p-6 sm:p-8 lg:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-accent/10 blur-3xl"
            />
            <div className="relative flex flex-col items-start">
              <span className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-success/25 bg-success/8 px-3 py-2 text-xs leading-relaxed text-fg-secondary">
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 rounded-full bg-success shadow-[0_0_0_3px_color-mix(in_oklab,var(--success)_15%,transparent)]"
                />
                {site.availability}
              </span>
              <h3 className="mt-7 max-w-sm text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                {contact.heading}
              </h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-fg-secondary sm:text-[15px]">
                {contact.subheading}
              </p>
              <a
                href={contact.mailto}
                className="btn btn-primary group mt-7 h-11 px-5"
              >
                <MailIcon size={16} />
                Email me
                <ArrowRightIcon size={15} className="interaction-arrow" />
              </a>
              <div className="mt-8 w-full border-t border-line pt-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
                  Find me elsewhere
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {socialLinks.map(({ label, href, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn group"
                    >
                      <Icon size={14} />
                      {label}
                      <ArrowRightIcon size={13} className="interaction-arrow" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
