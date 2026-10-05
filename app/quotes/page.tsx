import { quotes } from "@/data/quotes";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { QuoteIcon } from "@/components/icons";
import { CopyButton } from "@/components/copy-button";

export default function QuotesPage() {
  return (
    <div className="shell py-16 sm:py-20">
      <div className="max-w-3xl">
        <SectionHeading
          as="h1"
          eyebrow="Words to come back to"
          title="100 Hard-Hitting Lines"
          subtitle="A little perspective for the days you need it. Inspired by Alex Hormozi and Chris Williamson."
        />
      </div>

      <ol className="mt-12 grid list-none grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="100 hard-hitting quotes">
        {quotes.map((quote, index) => (
          <li key={quote.id} className="quote-item relative h-full">
            <Reveal className="h-full" delay={(index % 3) * 0.04}>
              <figure className="quote-card motion-card group relative flex h-full min-h-52 flex-col overflow-hidden rounded-[14px] border border-line bg-card p-6 shadow-card sm:p-7">
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-mono text-[11px] font-medium tracking-[0.18em] text-fg-muted" aria-hidden="true">
                    {String(quote.id).padStart(3, "0")}
                  </span>
                  <div className="flex items-center gap-2">
                    <QuoteIcon size={22} className="text-accent/35" />
                    <CopyButton text={quote.text} label={`Copy quote ${quote.id}`} iconOnly />
                  </div>
                </div>
                <blockquote className="quote-text relative flex-1 text-[17px] font-medium leading-relaxed tracking-[-0.015em] text-fg sm:text-lg">
                  {quote.text}
                </blockquote>
                <span className="mt-7 h-px w-8 bg-accent/35" aria-hidden="true" />
              </figure>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}
