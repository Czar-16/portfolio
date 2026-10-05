"use client";

import { stack } from "@/data/stack";
import { techIcons } from "@/data/tech-icons";
import { GitHubActivity } from "@/components/github-activity";

function TechIcon({ name }: { name: string }) {
  const icon = techIcons[name];
  if (!icon) return null;
  return (
    <svg
      viewBox={icon.viewBox}
      className="h-3.5 w-3.5 shrink-0 opacity-80"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={icon.d} />
    </svg>
  );
}

export function DashboardSection() {
  return (
    <section className="py-20 bg-bg-soft">
      <div className="shell grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="card p-7 lg:p-8">
          <h3 className="text-lg font-semibold">Tech Stack</h3>
          <p className="mt-1 text-sm text-fg-secondary">
            Languages, frameworks and tools I use to ship products.
          </p>
          <div className="mt-7 space-y-6">
            {stack.map((label) => (
              <div key={label.id}>
                <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
                  {label.label}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {label.items.map((item) => (
                    <span
                      key={item}
                      className="badge inline-flex items-center gap-1.5 px-3 py-1.5"
                    >
                      <TechIcon name={item} />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 lg:p-7">
          <GitHubActivity />
        </div>
      </div>
    </section>
  );
}
