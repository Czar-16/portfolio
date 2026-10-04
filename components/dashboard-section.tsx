"use client";

import { stack } from "@/data/stack";

import { techIcons } from "@/data/tech-icons";
import {
  TrophyIcon,
  StarIcon,
  MedalIcon,
  RankIcon,
  CertificateIcon,
} from "@/components/icons";
import { GitHubActivity } from "@/components/github-activity";
import Link from "next/link";

const iconMap = {
  problems: TrophyIcon,
  rating: StarIcon,
  contest: MedalIcon,
  rank: RankIcon,
  certificate: CertificateIcon,
};

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
      <div className="shell grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card p-6">
          <h3 className="font-semibold mb-6">Tech Stack</h3>
          <div className="space-y-5">
            {stack.map((label) => (
              <div key={label.id}>
                <p className="text-xs text-fg-muted uppercase tracking-wider mb-2">
                  {label.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {label.items.map((item) => (
                    <span
                      key={item}
                      className="badge inline-flex items-center gap-1.5"
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

        <div className="card p-5">
          <GitHubActivity />
        </div>
      </div>
    </section>
  );
}
