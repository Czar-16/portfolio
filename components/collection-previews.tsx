import Link from "next/link";
import { watchItems } from "@/data/watch";
import { quotes } from "@/data/quotes";
import { WatchPoster } from "@/components/watch-poster";
import { SectionHeading } from "@/components/section-heading";
export function CollectionPreviews() {
  return <>
    <section id="watch" className="section-frame">
      <SectionHeading eyebrow="Beyond the code" title="Watch" action="View all" actionHref="/watch" />
      <div className="watch-preview mt-5">
        {[...watchItems].sort((a, b) => a.rank - b.rank).slice(0, 6).map(item => <Link key={item.slug} href={`/watch#${item.slug}`} className="group min-w-0">
          <WatchPoster slug={item.slug} title={item.title} rank={`${item.type} ${item.rank}`} className="aspect-2/3 w-full rounded-md border border-line" />
          <p className="mt-2 text-xs font-medium">{item.title}</p>
          <p className="mt-1 text-[11px] text-fg-secondary">{item.year} · {item.type}</p>
        </Link>)}
      </div>
    </section>
    <section id="quotes" className="section-frame">
      <SectionHeading eyebrow="Notes to self" title="Quotes" action="View all" actionHref="/quotes" />
      <div className="mt-5 space-y-3">{quotes.slice(0, 3).map(quote => <blockquote key={quote.id} className="border-l-2 border-line pl-4 leading-7 text-fg-secondary">“{quote.text}”</blockquote>)}</div>
    </section>
  </>;
}
