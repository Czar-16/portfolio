import { stack } from "@/data/stack";
import { techIcons } from "@/data/tech-icons";
import { SectionHeading } from "@/components/section-heading";
import { StaggerChildren, StaggerItem } from "@/components/reveal";
import { SparkIcon } from "@/components/icons";

function TechGlyph({ name }: { name: string }) {
  const icon = techIcons[name];

  if (!icon) {
    return (
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line bg-bg-soft text-fg-muted"
        aria-hidden="true"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="6" />
        </svg>
      </span>
    );
  }

  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line bg-bg-soft text-fg-secondary transition-colors group-hover:text-accent"
      aria-hidden="true"
    >
      <svg width="14" height="14" viewBox={icon.viewBox} fill="currentColor">
        <path d={icon.d} />
      </svg>
    </span>
  );
}

export default function StackPage() {
  const total = stack.reduce((count, category) => count + category.items.length, 0);

  return (
    <div className="shell py-16 sm:py-20">
      <SectionHeading
        eyebrow="Stack"
        title="Tech Stack"
        subtitle="The languages, frameworks, databases and tools I reach for — grouped by what they do, not by how much I use them."
      />

      <StaggerChildren
        className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        gap={0.06}
      >
        {stack.map((category) => (
          <StaggerItem key={category.id} className="h-full">
            <section className="flex h-full flex-col overflow-hidden rounded-[14px] border border-line bg-card shadow-card transition-[border-color,box-shadow] duration-300 hover:border-line-strong hover:shadow-pop">
              <header className="flex items-baseline justify-between gap-3 border-b border-line px-5 py-4">
                <h2 className="text-[15px] font-semibold tracking-tight text-fg">
                  {category.label}
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
                  {category.items.length}
                </span>
              </header>

              <ul className="flex flex-1 flex-col">
                {category.items.map((item) => (
                  <li
                    key={item}
                    className="group flex items-center gap-3 border-b border-line/70 px-5 py-2.5 transition-colors last:border-b-0 hover:bg-elevated"
                  >
                    <TechGlyph name={item} />
                    <span className="text-[13px] font-medium text-fg-secondary transition-colors group-hover:text-fg">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </StaggerItem>
        ))}
      </StaggerChildren>

      <div className="mt-10 flex flex-col items-center gap-3 rounded-[14px] border border-line bg-card px-6 py-10 text-center">
        <SparkIcon size={18} className="text-accent" />
        <p className="text-sm text-fg-secondary">
          {total} technologies across {stack.length} categories — the list grows with every
          project.
        </p>
      </div>
    </div>
  );
}