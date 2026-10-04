"use client";

import { useMemo, useState } from "react";
import { movies, genres, moviesArePlaceholder, type Genre } from "@/data/movies";
import { Reveal, StaggerChildren, StaggerItem } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { MoviePoster } from "@/components/movie-poster";
import { SearchIcon, FilmIcon } from "@/components/icons";

export default function MoviesPage() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<Genre>("All");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return movies.filter((movie) => {
      const matchesGenre = genre === "All" || movie.genres.some((g) => g === genre);
      const matchesQuery =
        needle.length === 0 ||
        movie.title.toLowerCase().includes(needle) ||
        String(movie.year).includes(needle);

      return matchesGenre && matchesQuery;
    });
  }, [genre, query]);

  return (
    <div className="shell py-16 sm:py-20">
      <SectionHeading
        eyebrow="Movies"
        title="Top 50 Movie Recommendations"
        subtitle="A curated list of my all-time favourite movies across genres."
      />

      {moviesArePlaceholder && (
        <Reveal className="mt-8">
          <p className="flex items-start gap-2.5 rounded-xl border border-line bg-card px-4 py-3 text-[13px] leading-relaxed text-fg-muted">
            <FilmIcon size={15} className="mt-0.5 shrink-0 text-accent" />
            <span>
              Starter set — edit{" "}
              <code className="rounded bg-fg/5 px-1.5 py-0.5 font-mono text-[0.85em] text-fg-secondary">
                data/movies.ts
              </code>{" "}
              to make this yours. Drop posters at{" "}
              <code className="rounded bg-fg/5 px-1.5 py-0.5 font-mono text-[0.85em] text-fg-secondary">
                public/movies/&lt;slug&gt;.jpg
              </code>
              .
            </span>
          </p>
        </Reveal>
      )}

      <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <SearchIcon
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title or year"
            aria-label="Search movies by title or year"
            className="h-10 w-full rounded-[9px] border border-line bg-card pl-10 pr-3 text-[13px] text-fg outline-none transition-colors placeholder:text-fg-muted focus:border-accent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {genres.map((option) => {
            const active = option === genre;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setGenre(option)}
                aria-pressed={active}
                className={`h-8 rounded-full border px-3.5 font-mono text-[11px] transition-colors ${
                  active
                    ? "border-accent bg-accent/12 text-accent"
                    : "border-line text-fg-secondary hover:border-line-strong hover:text-fg"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-5 font-mono text-[11px] text-fg-muted">
        {filtered.length} {filtered.length === 1 ? "movie" : "movies"}
        {genre !== "All" && ` · ${genre}`}
      </p>

      {filtered.length > 0 ? (
        <StaggerChildren
          className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          gap={0.03}
        >
          {filtered.map((movie) => (
            <StaggerItem key={movie.slug} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-[14px] border border-line bg-card shadow-card transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-pop">
                <div className="relative">
                  <MoviePoster
                    slug={movie.slug}
                    title={movie.title}
                    rank={`#${movie.rank}`}
                    className="aspect-2/3 w-full"
                  />
                  <span className="absolute left-2.5 top-2.5 rounded-md border border-line bg-black/65 px-1.5 py-0.5 font-mono text-[10px] font-medium text-white backdrop-blur-sm">
                    {String(movie.rank).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-4">
                  <h2 className="line-clamp-2 text-[14px] font-semibold leading-snug text-fg">
                    {movie.title}
                  </h2>
                  <p className="font-mono text-[11px] text-fg-muted">{movie.year}</p>
                  <p className="mt-auto pt-1.5 font-mono text-[10px] text-fg-muted/80">
                    {movie.genres.join(" · ")}
                  </p>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerChildren>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-3 rounded-[14px] border border-dashed border-line bg-card/50 px-6 py-16 text-center">
          <FilmIcon size={22} className="text-fg-muted" />
          <p className="text-sm font-medium text-fg">No movies match those filters.</p>
          <p className="max-w-sm text-[13px] text-fg-muted">
            Try a different genre or clear the search box to see the full list of{" "}
            {movies.length} recommendations.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setGenre("All");
            }}
            className="btn mt-2"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}