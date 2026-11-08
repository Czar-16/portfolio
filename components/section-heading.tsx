import { Reveal } from "@/components/reveal";
import { ArrowRightIcon } from "@/components/icons";
import Link from "next/link";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
  actionHref,
  as: Heading = "h2",
  id,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: string;
  actionHref?: string;
  as?: "h1" | "h2";
  id?: string;
}) {
  return (
    <Reveal className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-col gap-3">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.16em] uppercase text-fg-muted">
          <span className="size-1.5 rounded-full bg-accent shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent)_18%,transparent)]" />
          {eyebrow}
        </span>
        <Heading id={id} className="font-semibold tracking-tight text-fg">
          {title}
        </Heading>
        {subtitle && (
          <p className="max-w-xl text-sm leading-relaxed text-fg-secondary">
            {subtitle}
          </p>
        )}
      </div>
      {action && actionHref && (
        <Link
          href={actionHref}
          className="interactive group inline-flex shrink-0 items-center gap-1.5 self-start text-sm font-medium text-accent hover:text-fg sm:self-auto"
        >
          {action}
          <ArrowRightIcon
            size={14}
            className="transition-transform duration-180 ease-premium group-hover:translate-x-[3px]"
          />
        </Link>
      )}
    </Reveal>
  );
}
