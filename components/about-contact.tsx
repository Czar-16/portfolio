import Link from "next/link";
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
              <div className="flex min-w-0 flex-col items-start gap-4">
                <p className="inline-flex items-center gap-2.5 text-xs leading-relaxed text-fg-secondary">
                  <span aria-hidden="true" className="contact-availability-dot size-2 shrink-0 rounded-full" />
                  {site.availability}
                </p>
                <p className="max-w-full break-all font-mono text-xs text-fg-secondary">{contact.email}</p>
                <div className="flex flex-wrap gap-3">
                  <a href={contact.mailto} className="btn btn-primary group h-11 px-5">
                    <MailIcon size={16} />
                    Email me
                    <ArrowRightIcon size={15} className="interaction-arrow" />
                  </a>
                  <CopyButton text={contact.email} label="Copy email" />
                </div>
              </div>
            </div>
            <div className="contact-links relative mt-9 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 pt-6">
              <Link href="/about" className="interactive group inline-flex min-h-10 items-center gap-2 text-sm font-medium text-fg-secondary hover:text-fg">
                More about me
                <ArrowRightIcon size={14} className="interaction-arrow" />
              </Link>
              <div className="flex items-center gap-2" aria-label="Social links">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="icon-btn contact-social" aria-label={`Anoop on ${label}`} title={label}>
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
