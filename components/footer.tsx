import Link from "next/link";
import { site, socials as s } from "@/data/site";
import { GithubIcon, XIcon, LinkedinIcon, MailIcon } from "@/components/icons";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-bg-soft">
      <div className="shell flex flex-col items-center gap-4 py-10 md:flex-row md:justify-between md:gap-8">
        <div className="flex flex-col items-center gap-1 md:items-start">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-fg"
          >
            Czar-16<span className="text-accent">.</span>
          </Link>
          <p className="text-xs text-fg-muted">{site.tagline}</p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={s.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="icon-btn"
          >
            <GithubIcon size={15} />
          </a>
          <a
            href={s.x}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter)"
            className="icon-btn"
          >
            <XIcon size={14} />
          </a>
          <a
            href={s.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="icon-btn"
          >
            <LinkedinIcon size={15} />
          </a>
          <a
            href={`mailto:${s.email}`}
            aria-label="Email"
            className="icon-btn"
          >
            <MailIcon size={15} />
          </a>
        </div>

        <p className="text-center text-[11px] text-fg-muted md:text-right">
          Built with Next.js · Deployed on Vercel
        </p>
      </div>
    </footer>
  );
}
