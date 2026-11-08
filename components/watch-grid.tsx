"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { groupOf } from "@/data/watch";

const FILTERS = ["All", "Films", "Series", "Docs"] as const;
type Filter = (typeof FILTERS)[number];

interface WatchGridProps {
  items: { rank: number; title: string; year: number; slug: string; type: string }[];
}

export function WatchGrid({ items }: WatchGridProps) {
  const [filter, setFilter] = useState<Filter>("All");

  const picks = useMemo(
    () => items.map((it) => ({ ...it, group: groupOf(it.type) as Filter })),
    [items],
  );

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { All: picks.length, Films: 0, Series: 0, Docs: 0 };
    picks.forEach((p) => (c[p.group] += 1));
    return c;
  }, [picks]);

  const visible = filter === "All" ? picks : picks.filter((p) => p.group === filter);

  return (
    <section aria-labelledby="collection">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-4">
        <h2 id="collection" className="font-semibold tracking-tight text-fg sm:text-xl">
          The collection
        </h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter picks by type">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-mono transition-colors ${
                filter === f
                  ? "border-line-strong bg-elevated text-fg"
                  : "border-line text-fg-secondary hover:text-fg hover:border-line-strong"
              }`}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f}
              <span className="opacity-60 tabular-nums">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-4" role="list">
        {visible.map((p) => (
          <li
            key={p.slug}
            id={p.slug}
            className="card-lift group relative flex h-full flex-col overflow-hidden rounded-[14px] border border-line bg-card shadow-card scroll-mt-[92px] [&:target]:border-line-strong [&:target]:shadow-[0_0_0_4px_var(--line-strong)]"
          >
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[14px]">
              <Image
                src={`/watch/${p.slug}.jpg`}
                alt={`${p.title} poster`}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                priority={p.rank <= 6}
                className="image-reveal project-image object-cover transition-transform duration-400 ease-premium group-hover:scale-[1.025]"
              />
              <span className="absolute left-2.5 top-2.5 rounded-lg border border-white/20 bg-black/60 px-2 py-1 font-mono text-[11px] text-white backdrop-blur-md tabular-nums">
                {String(p.rank).padStart(2, "0")}
              </span>
            </div>
            <div className="mt-3 flex flex-col gap-1.5 px-1">
              <p className="font-mono text-[11px] leading-5 tracking-wide uppercase text-fg-secondary">
                {p.year} · {p.type}
              </p>
              <h3 className="font-semibold leading-5 text-fg line-clamp-2 sm:text-[15px] sm:leading-6">
                {p.title}
              </h3>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
