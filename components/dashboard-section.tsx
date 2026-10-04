"use client";

import { stack } from "@/data/stack";
import { achievements } from "@/data/achievements";
import { github } from "@/data/site";
import { techIcons } from "@/data/tech-icons";
import { TrophyIcon, StarIcon, MedalIcon, RankIcon, CertificateIcon } from "@/components/icons";
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
    <svg viewBox={icon.viewBox} className="h-3.5 w-3.5 shrink-0 opacity-80" fill="currentColor" aria-hidden="true">
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
                <p className="text-xs text-fg-muted uppercase tracking-wider mb-2">{label.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {label.items.map((item) => (
                    <span key={item} className="badge inline-flex items-center gap-1.5">
                      <TechIcon name={item} />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 flex flex-col">
          <h3 className="font-semibold mb-4">GitHub Activity</h3>
          <a
            href={github.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block overflow-hidden rounded-lg border border-line bg-card"
          >
            <img
              src={`https://ghchart.rshah.org/3B9EFF/${github.username.replace("https://github.com/", "")}`}
              alt={`${github.username} GitHub contribution graph`}
              className="w-full object-contain"
              loading="lazy"
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                el.style.display = "none";
              }}
            />
            <noscript>
              <img
                src="https://ghchart.rshah.org/3B9EFF/Czar-16"
                alt="GitHub contribution graph"
                className="w-full"
              />
            </noscript>
          </a>
          <p className="mt-2 text-[11px] text-fg-muted">Contribution graph via GitHub · click to view profile</p>
          <div className="mt-3 flex items-center justify-between text-[10px] text-fg-muted">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-[2px] border border-line bg-card" />
              <span className="h-2.5 w-2.5 rounded-[2px] bg-[#93c5fd]" />
              <span className="h-2.5 w-2.5 rounded-[2px] bg-[#3b82f6]" />
              <span className="h-2.5 w-2.5 rounded-[2px] bg-[#1d4ed8]" />
            </div>
            <span>More</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-fg-secondary">
            <a href={github.profileUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
              @{github.username.replace("https://github.com/", "")}
            </a>
            <span className="text-fg-muted">·</span>
            <a href={github.repositoriesUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
              Repositories
            </a>
          </div>
          <Link href={github.profileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-accent mt-auto pt-4 block">
            View GitHub →
          </Link>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-1">Achievements</h3>
          <p className="text-xs text-fg-muted mb-5">Coding milestones &amp; recognitions</p>
          <div className="space-y-3">
            {achievements.map((item) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap] || TrophyIcon;
              const isFeatured = item.id === "nptel";
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
                    isFeatured ? "border-accent/30 bg-accent/5" : "border-line bg-card-elevated"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      isFeatured ? "bg-accent text-accent-contrast" : "bg-accent/10 text-accent"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold leading-none">{item.value}</p>
                    <p className="text-xs text-fg-secondary leading-tight">{item.label}</p>
                    {item.detail && <p className="text-[11px] text-fg-muted">{item.detail}</p>}
                  </div>
                </div>
              );
            })}
          </div>
          <Link href="/achievements" className="text-sm text-accent mt-6 block">
            View All Achievements →
          </Link>
        </div>
      </div>
    </section>
  );
}
