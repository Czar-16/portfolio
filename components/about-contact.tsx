import Link from "next/link";
import Signature from "@/components/Signature";
import { ArrowRightIcon, GithubIcon, XIcon, LinkedinIcon, MailIcon } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { CopyButton } from "@/components/copy-button";
import { contact, site, socials } from "@/data/site";

const socialLinks = [
  { label: "GitHub", href: socials.github, icon: GithubIcon },
  { label: "X", href: socials.x, icon: XIcon },
  { label: "LinkedIn", href: socials.linkedin, icon: LinkedinIcon },
] as const;

export function AboutContact() {
  return (
    <section id="contact" className="section-frame contact-section" aria-labelledby="about-contact-heading">
      <div className="shell">
        <Reveal className="mx-auto max-w-5xl">
          <div className="relative">
            <div className="relative grid items-center gap-7">
              <SectionHeading
                id="about-contact-heading"
                eyebrow="Get in touch"
                title={contact.heading}
                subtitle={contact.subheading}
              />
              <div className="contact-action-row flex min-w-0 items-center justify-between gap-8">
                <div className="flex min-w-0 flex-col items-start gap-4">
                  <p className="inline-flex items-center gap-2.5 text-xs leading-relaxed text-fg-secondary">
                    <span aria-hidden="true" className="contact-availability-dot size-2 shrink-0 rounded-full" />
                    {site.availability}
                  </p>
                  <p className="max-w-full break-all font-mono text-xs text-fg-secondary">{contact.email}</p>
                  <div className="flex flex-wrap gap-3">
                    <a href={contact.mailto} className="group inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-accent-contrast font-medium text-[13px] tracking-[-0.005em] hover:bg-[color-mix(in_oklab,var(--accent)_88%,white)] hover:shadow-[0_14px_40px_-14px_color-mix(in_oklab,var(--accent-glow)_85%,transparent)]">
                      <MailIcon size={16} />
                      Email me
                      <ArrowRightIcon size={15} className="transition-transform duration-180 ease-premium group-hover:translate-x-[3px]" />
                    </a>
                    <CopyButton text={contact.email} label="Copy email" />
                  </div>
                </div>
                <Signature className="w-full max-w-[140px]" />
              </div>
            </div>
            <div className="contact-links relative mt-9 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 pt-6">
              <Link href="/about" className="interactive group inline-flex min-h-10 items-center gap-2 text-sm font-medium text-fg-secondary hover:text-fg">
                More about me
                <ArrowRightIcon size={14} className="transition-transform duration-180 ease-premium group-hover:translate-x-[3px]" />
              </Link>
              <div className="flex items-center gap-2" aria-label="Social links">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="contact-social inline-flex size-10 min-h-10 min-w-10 shrink-0 items-center justify-center rounded-md border border-line bg-card text-fg-secondary hover:border-line-strong hover:bg-card-elevated hover:text-fg max-[640px]:size-11 max-[640px]:min-h-11 max-[640px]:min-w-11" aria-label={`Anoop on ${label}`} title={label}>
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
