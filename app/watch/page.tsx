import { watchItems } from "@/data/watch";
import { Reveal, StaggerChildren, StaggerItem } from "@/components/reveal";
import { WatchPoster } from "@/components/watch-poster";
import { FilmIcon } from "@/components/icons";

export default function WatchPage() {
  return (
    <div className="shell py-16 sm:py-20">
      <Reveal className="relative overflow-hidden rounded-2xl border border-line bg-card p-5 shadow-card sm:p-8 lg:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
        />
        <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-2xl">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              Beyond the code
            </span>
            <h1 className="mt-4 text-[clamp(1.25rem,3vw,2rem)] font-semibold leading-[1.15] tracking-[-0.035em] text-fg">
              MY RECOMMENDATIONS<span className="text-accent">.</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-fg-secondary sm:text-[15px]">
              A handpicked collection of movies and series — stories
              that stayed with me long after the credits rolled.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-line bg-elevated/70 px-4 py-3">
            <FilmIcon size={20} className="text-accent" />
            <div>
              <p className="text-xl font-semibold leading-none text-fg">
                {watchItems.length}
              </p>
              <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-fg-secondary">
                Movies &amp; series
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-9 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b border-line pb-4 sm:mt-10">
        <h2 className="text-lg font-semibold tracking-tight text-fg sm:text-xl">
          The collection
        </h2>
        <p className="text-xs leading-relaxed text-fg-secondary sm:text-sm">
          {watchItems.length} picks · Movies and series I loved
        </p>
      </Reveal>

      <StaggerChildren className="mt-6 grid grid-cols-2 gap-x-3 gap-y-5 sm:mt-7 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5">
        {watchItems.map((movie) => (
          <StaggerItem key={movie.slug} className="h-full">
            <article className="motion-card group flex h-full flex-col overflow-hidden rounded-[14px] border border-line bg-card shadow-card">
              <div className="relative overflow-hidden">
                <WatchPoster
                  slug={movie.slug}
                  title={movie.title}
                  rank={`${movie.type} ${movie.rank}`}
                  className="aspect-2/3 w-full"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent"
                />
                <span className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3 rounded-lg border border-white/20 bg-black/60 px-2 py-1 font-mono text-[11px] text-white backdrop-blur-md">
                  <span className="sr-only">Pick </span>
                  {String(movie.rank).padStart(2, "0")}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
                <p className="font-mono text-[11px] leading-5 tracking-wide text-fg-secondary">
                  {movie.year} · {movie.type}
                </p>
                <h3 className="text-[13px] font-semibold leading-5 text-fg sm:text-[15px] sm:leading-6">
                  {movie.title}
                </h3>
              </div>
            </article>
          </StaggerItem>
        ))}
      </StaggerChildren>
    </div>
  );
}
