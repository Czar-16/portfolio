import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";

export function CurrentlyBuildingCard() {
  return (
    <Link
      href="/projects/designarena"
      className="group relative flex w-full flex-col gap-3 rounded-xl border border-white/12 bg-black/55 p-4 backdrop-blur-md transition-colors hover:border-accent/30 hover:bg-black/65 md:p-5"
    >
      <span className="absolute inset-0 rounded-xl shadow-[0_0_22px_rgba(59,158,255,0.12)] opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
      <div className="relative flex items-center gap-2">
        <span className="h-2 w-2 shrink-0 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]" aria-hidden="true" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
          Currently building
        </span>
      </div>

      <div className="relative">
        <h3 className="text-[18px] font-semibold leading-tight text-white md:text-[20px]">
          LLD Practice Platform
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-white/60">
          An AI-powered platform for practicing Low-Level Design problems, submitting designs, and
          getting structured feedback.
        </p>
      </div>

      <div className="relative flex flex-wrap items-center gap-1.5 pt-1">
        <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-[11px] font-medium text-white/70">
          Next.js
        </span>
        <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-[11px] font-medium text-white/70">
          TypeScript
        </span>
        <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-[11px] font-medium text-white/70">
          AI
        </span>
      </div>

      <span className="relative mt-0.5 inline-flex items-center gap-1.5 text-xs font-medium text-white/70 transition-colors group-hover:text-white">
        View project <ArrowRightIcon size={12} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
