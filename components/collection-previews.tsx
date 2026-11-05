import Link from "next/link";
import { watchItems } from "@/data/watch";
import { WatchPoster } from "@/components/watch-poster";
import { SectionHeading } from "@/components/section-heading";
export function CollectionPreviews() {
  return <>
    <section id="watch" className="section-frame">
      <SectionHeading eyebrow="Beyond the code" title="Watch" action="View all" actionHref="/watch" />
      <div className="watch-preview mt-3" role="region" aria-label="Watch recommendations" tabIndex={0}>
        {[...watchItems].sort((a, b) => a.rank - b.rank).map(item => <Link key={item.slug} href={`/watch#${item.slug}`} className="watch-card watch-preview-card group min-w-0">
          <WatchPoster slug={item.slug} title={item.title} rank={`${item.type} ${item.rank}`} className="aspect-2/3 w-full" />
          <div className="p-2">
            <p className="text-xs font-medium">{item.title}</p>
            <p className="mt-1 text-[11px] text-fg-secondary">{item.year} · {item.type}</p>
          </div>
        </Link>)}
      </div>
    </section>
  </>;
}
