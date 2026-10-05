import Link from "next/link";
import { stack } from "@/data/stack";
import { techIcons } from "@/data/tech-icons";
import { Reveal } from "@/components/reveal";
import { StackCard, StackTile } from "@/components/stack-motion";
import { ArrowRightIcon, CodeIcon, SparkIcon } from "@/components/icons";
import styles from "./stack.module.css";

const categoryDetails: Record<string, { description: string; symbol: string }> = {
  languages: { description: "The foundations behind every build.", symbol: "</>" },
  frontend: { description: "Interfaces that feel as good as they look.", symbol: "◇" },
  backend: { description: "The engines powering the experience.", symbol: "{ }" },
  data: { description: "Data, identity, and everything in between.", symbol: "▤" },
  devops: { description: "From the first commit to production.", symbol: ">_" },
  concepts: { description: "The thinking that holds it all together.", symbol: "✳" },
};

function TechGlyph({ name }: { name: string }) {
  const icon = techIcons[name];
  return (
    <span className={styles.glyph} aria-hidden="true">
      {icon ? (
        <svg width="19" height="19" viewBox={icon.viewBox} fill="currentColor">
          <path d={icon.d} />
        </svg>
      ) : <CodeIcon size={18} />}
    </span>
  );
}

export default function StackPage() {
  return (
    <div className="shell py-16 sm:py-20">
      <Reveal className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-semibold tracking-tight text-fg">Inside the toolkit</h1>
        <p className="text-xs text-fg-secondary sm:text-sm">Every layer, from idea to deployment.</p>
      </Reveal>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {stack.map((category, index) => {
          const detail = categoryDetails[category.id];
          return (
            <StackCard key={category.id} labelledBy={`stack-${category.id}`} className={`${styles.card} flex h-full flex-col p-5 sm:p-6`}>
              <header className="mb-5">
                <div className="mb-4 flex items-center justify-between">
                  <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/15 bg-accent/8 font-mono text-lg text-accent">{detail?.symbol ?? "</>"}</span>
                  <span aria-hidden="true" className="font-mono text-[11px] text-fg-muted">/{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <h2 id={`stack-${category.id}`} className="text-lg font-semibold tracking-tight text-fg">{category.label}</h2>
                  <span className="rounded-md border border-line px-2 py-0.5 font-mono text-[10px] text-fg-secondary">{category.items.length}</span>
                </div>
                {detail && <p className="mt-2 text-[13px] leading-6 text-fg-secondary">{detail.description}</p>}
              </header>
              <ul className="grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2">
                {category.items.map((item) => (
                  <StackTile key={item} className={styles.tile}>
                    <TechGlyph name={item} />
                    <span className="min-w-0 text-xs font-medium leading-5 text-fg sm:text-[13px]">{item}</span>
                  </StackTile>
                ))}
              </ul>
            </StackCard>
          );
        })}
      </div>

      <Reveal className="mt-8 flex flex-col items-start justify-between gap-5 rounded-2xl border border-line bg-card p-6 sm:flex-row sm:items-center sm:p-7">
        <div className="flex items-start gap-3">
          <SparkIcon size={20} className="mt-0.5 shrink-0 text-accent" />
          <div>
            <h2 className="text-sm font-semibold text-fg">Always building. Always learning.</h2>
            <p className="mt-1.5 text-[13px] leading-6 text-fg-secondary">The toolkit keeps growing with every project.</p>
          </div>
        </div>
        <Link href="/projects" className="btn group shrink-0">See what I build<ArrowRightIcon size={14} className="interaction-arrow" /></Link>
      </Reveal>
    </div>
  );
}
