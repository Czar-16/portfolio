"use client";

import { useMemo, useState } from "react";
import { quotes, quoteCategories, type QuoteCategory } from "@/data/quotes";
import { StaggerChildren, StaggerItem } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { SearchIcon, QuoteIcon } from "@/components/icons";

export default function QuotesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<QuoteCategory>("All");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return quotes.filter((quote) => {
      const matchesCategory =
        category === "All" || quote.tags.some((tag) => tag === category);
      const matchesQuery =
        needle.length === 0 ||
        quote.text.toLowerCase().includes(needle) ||
        quote.author.toLowerCase().includes(needle);

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <div className="shell py-16 sm:py-20">
      <SectionHeading
        eyebrow="Quotes"
        title="Quotes"
        subtitle="A collection of quotes that I find inspiring, thought-provoking, or simply memorable."
      />

      <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <SearchIcon
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by text or author"
            aria-label="Search quotes by text or author"
            className="h-10 w-full rounded-[9px] border border-line bg-card pl-10 pr-3 text-[13px] text-fg outline-none transition-colors placeholder:text-fg-muted focus:border-accent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {quoteCategories.map((option) => {
            const active = option === category;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setCategory(option)}
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
        {filtered.length} {filtered.length === 1 ? "quote" : "quotes"}
        {category !== "All" && ` · ${category}`}
      </p>

      {filtered.length > 0 ? (
        <StaggerChildren
          className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
          gap={0.05}
        >
          {filtered.map((quote) => (
            <StaggerItem key={quote.id} className="h-full">
              <figure className="group relative flex h-full flex-col overflow-hidden rounded-[14px] border border-line bg-card p-6 shadow-card transition-[border-color,box-shadow,background-color] duration-300 hover:border-accent/45 hover:bg-elevated hover:shadow-accent">
                <QuoteIcon
                  size={28}
                  className="pointer-events-none absolute -right-1 -top-1 text-fg opacity-[0.045] transition-opacity duration-300 group-hover:text-accent group-hover:opacity-20"
                />
                <blockquote className="relative flex-1 text-[15px] leading-relaxed text-fg/90">
                  <span
                    aria-hidden="true"
                    className="absolute -left-1 -top-5 select-none font-serif text-5xl leading-none text-accent/35 transition-colors duration-300 group-hover:text-accent/70"
                  >
                    &ldquo;
                  </span>
                  <span className="relative italic">{quote.text}</span>
                </blockquote>

                <figcaption className="mt-6 flex flex-col gap-3 border-t border-line pt-4">
                  <cite className="not-italic text-[13px] font-medium text-fg-secondary">
                    — {quote.author}
                  </cite>
                  <div className="flex flex-wrap gap-1.5">
                    {quote.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-accent/30 bg-accent/8 px-2 py-0.5 font-mono text-[10px] text-accent/90"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </StaggerChildren>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-3 rounded-[14px] border border-dashed border-line bg-card/50 px-6 py-16 text-center">
          <QuoteIcon size={22} className="text-fg-muted" />
          <p className="text-sm font-medium text-fg">No quotes match those filters.</p>
          <p className="max-w-sm text-[13px] text-fg-muted">
            Try a different category, or clear the search box to browse all{" "}
            {quotes.length} quotes.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("All");
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