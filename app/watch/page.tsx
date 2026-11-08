import { groupOf, watchItems } from "@/data/watch";
import { Reveal } from "@/components/reveal";
import { WatchGrid } from "@/components/watch-grid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movies, Documentaries & Series",
  description: "Anoop Jha's handpicked collection of movies, documentaries, and series.",
  alternates: { canonical: "/watch" },
};

type Stat = { label: string; count: number };

export default function WatchPage() {
  const counts: Record<string, number> = { Films: 0, Series: 0, Docs: 0 };
  watchItems.forEach((item) => {
    counts[groupOf(item.type)] += 1;
  });
  const stats: Stat[] = [
    { label: "Films", count: counts.Films },
    { label: "Series", count: counts.Series },
    { label: "Docs", count: counts.Docs },
  ];

  return (
    <div className="shell py-16 sm:py-20">
      <Reveal>
        <div className="flex flex-col gap-4 border-b border-dashed border-line pb-8">
          <p className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            Beyond the code
          </p>
          <h1 className="font-semibold text-[clamp(2.4rem,7vw,3.75rem)] leading-none tracking-[-0.045em] text-balance hyphens-none text-fg">
            My recommendations.
          </h1>
          <p className="max-w-[34rem] text-sm leading-7 text-fg-secondary">
            A handpicked collection of movies, documentaries and series — stories that stayed
            with me long after the credits rolled.
          </p>
          <div className="mt-4 flex w-fit max-w-full rounded-[14px] border border-line bg-card">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`flex flex-col gap-1 px-5 py-3 ${index > 0 ? "border-l border-dashed border-line" : ""}`}
              >
                <dd className="m-0 text-xl font-semibold tabular-nums leading-none text-fg">
                  {stat.count}
                </dd>
                <dt className="font-mono text-xs uppercase tracking-widest text-fg-muted">
                  {stat.label}
                </dt>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <WatchGrid items={watchItems} />

      <footer className="mt-12 border-t border-dashed border-line pt-6">
        <p className="mb-3 font-mono text-xs tracking-widest text-fg-secondary">
          {watchItems.length} / ∞
        </p>
        <h2 className="font-semibold tracking-tight text-fg sm:text-xl">
          That&rsquo;s all my brain gave me.
        </h2>
        <p className="mt-3 text-sm leading-6 text-fg-secondary">
          These {watchItems.length} are just what came to mind while building this route.
        </p>
      </footer>
    </div>
  );
}
