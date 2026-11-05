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
    <Reveal className="section-heading flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-col gap-3">
        <span className="eyebrow">
          <span className="eyebrow-dot" />
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
            className="interaction-arrow"
          />
        </Link>
      )}
    </Reveal>
  );
}
