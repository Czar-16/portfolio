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
    <section className="py-16 sm:py-20" aria-labelledby="about-contact-heading">
      <div className="shell">
        <Reveal className="mx-auto max-w-5xl">
          <div className="card relative overflow-hidden p-6 sm:p-10 lg:p-12">
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-accent/8 blur-3xl" />
            <div className="relative grid items-center gap-7 lg:grid-cols-[1fr_auto] lg:gap-12">
              <SectionHeading
                id="about-contact-heading"
                eyebrow="Get in touch"
                title={contact.heading}
                subtitle={contact.subheading}
              />
              <div className="flex min-w-0 flex-col items-start gap-4">
                <p className="inline-flex items-start gap-2 text-xs leading-relaxed text-fg-secondary">
                  <span aria-hidden="true" className="mt-1 size-1.5 shrink-0 rounded-full bg-success" />
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
            <div className="relative mt-8 flex flex-col items-start gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/about" className="interactive group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:text-fg">
                More about me
                <ArrowRightIcon size={15} className="interaction-arrow" />
              </Link>
              <div className="flex items-center gap-2">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="icon-btn border border-line" aria-label={`Anoop on ${label}`} title={label}>
                    <Icon size={16} />
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
