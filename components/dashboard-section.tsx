"use client";

import { stack } from "@/data/stack";
import { techIcons } from "@/data/tech-icons";
import { GitHubActivity } from "@/components/github-activity";
import { XPostsCard } from "@/components/x-posts-card";
import { LeetCodeStatsCard } from "@/components/leetcode-stats-card";
import styles from "./dashboard-section.module.css";
import { useId, useState } from "react";
import { motion } from "motion/react";
import { motionEase } from "@/components/motion-provider";
import { useReducedMotion } from "@/components/use-reduced-motion";

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
  const [expanded, setExpanded] = useState(true);
  const contentId = useId();
  const reduce = useReducedMotion();
  const transition = { duration: reduce ? 0 : 0.25, ease: motionEase };
  return (
    <section className="py-20 bg-bg-soft">
      <div className="shell grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
        <div className="card card-lift p-7 lg:p-8">
          <h3 className="text-lg font-semibold">
            <button
              type="button"
              className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 text-left"
              aria-expanded={expanded}
              aria-controls={contentId}
              onClick={() => setExpanded((current) => !current)}
            >
              Tech Stack
              <motion.svg
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0 text-fg-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
                initial={false}
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={transition}
              >
                <path d="m6 9 6 6 6-6" />
              </motion.svg>
            </button>
          </h3>
          <p className="mt-1 text-sm text-fg-secondary">
            Languages, frameworks and tools I use to ship products.
          </p>
          <motion.div
            id={contentId}
            aria-hidden={!expanded}
            inert={!expanded}
            className="overflow-hidden"
            initial={false}
            animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
            transition={transition}
          >
            <div className="space-y-6 pt-7">
              {stack.map((label) => (
                <div key={label.id}>
                  <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
                    {label.label}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {label.items.map((item) => (
                      <span
                        key={item}
                        className={`badge inline-flex items-center gap-1.5 px-3 py-1.5 ${styles.techBadge}`}
                      >
                        <TechIcon name={item} />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="card card-lift p-6 lg:p-7">
          <GitHubActivity />
        </div>

        <LeetCodeStatsCard />
        <XPostsCard />
      </div>
    </section>
  );
}
