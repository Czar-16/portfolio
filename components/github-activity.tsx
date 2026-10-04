"use client";

import { useEffect, useState } from "react";
import { github } from "@/data/site";
import { RepoIcon, StarCountIcon } from "@/components/icons";

type RepoRow = {
  name: string;
  description: string;
  href: string;
  stars: number | null;
};

const FEATURED: RepoRow[] = [
  {
    name: "DesignArena",
    description: "AI-powered LLD practice platform",
    href: "https://github.com/Czar-16/DesignArena",
    stars: 1,
  },
  {
    name: "Buzzline",
    description: "Real-time chat platform",
    href: "https://github.com/Czar-16/BuzzLine",
    stars: 2,
  },
  {
    name: "PurePin",
    description: "Pinterest image downloader",
    href: "https://github.com/Czar-16/PurePin",
    stars: null,
  },
  {
    name: "Payloop",
    description: "Digital wallet application",
    href: "https://github.com/Czar-16/payloop",
    stars: null,
  },
];

const STATS_FALLBACK = { repos: 21, stars: 19, contributions: "400+" };

export function GitHubActivity() {
  const [stats, setStats] = useState(STATS_FALLBACK);
  const [repos, setRepos] = useState<RepoRow[]>(FEATURED);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [userRes, reposRes] = await Promise.all([
          fetch("https://api.github.com/users/Czar-16", { cache: "no-store" }),
          fetch(
            "https://api.github.com/users/Czar-16/repos?per_page=100&sort=updated",
            { cache: "no-store" },
          ),
        ]);
        if (cancelled) return;
        if (userRes.ok) {
          const u = await userRes.json();
          if (typeof u.public_repos === "number") {
            setStats((s) => ({ ...s, repos: u.public_repos }));
          }
        }
        if (reposRes.ok) {
          const list = (await reposRes.json()) as Array<{
            name: string;
            stargazers_count: number;
            description: string | null;
            html_url: string;
          }>;
          const totalStars = list.reduce(
            (a, r) => a + (r.stargazers_count ?? 0),
            0,
          );
          setStats((s) => ({ ...s, stars: totalStars }));
          const featuredLower = new Set(
            FEATURED.map((r) => r.name.toLowerCase()),
          );
          const sortedRest = list
            .filter(
              (r) =>
                !featuredLower.has(r.name.toLowerCase()) &&
                !r.name.startsWith("."),
            )
            .map<RepoRow>((r) => ({
              name: r.name,
              description: r.description?.slice(0, 80) ?? "",
              href: r.html_url,
              stars: r.stargazers_count,
            }));
          const byName = new Map(
            list.map((r) => [r.name.toLowerCase(), r] as const),
          );
          const hydratedFeatured = FEATURED.map((row) => {
            const hit = byName.get(row.name.toLowerCase());
            if (!hit) return row;
            return {
              ...row,
              href: hit.html_url,
              stars: hit.stargazers_count,
              description: hit.description?.slice(0, 80) ?? row.description,
            };
          });
          setRepos([...hydratedFeatured, ...sortedRest]);
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex h-full flex-col gap-4">
      <a
        href={github.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2"
      >
        <span
          className="h-2 w-2 shrink-0 rounded-full bg-accent"
          aria-hidden="true"
        />
        <h3 className="text-sm font-semibold tracking-tight text-fg">
          GitHub Activity
        </h3>
      </a>

      <a
        href={github.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-lg border border-line bg-card"
      >
        <div className="overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-line-strong/60 [&::-webkit-scrollbar-track]:bg-transparent">
          <img
            src={`https://ghchart.rshah.org/1e40af/Czar-16`}
            alt="Czar-16 GitHub contribution graph"
            className="h-auto max-w-none object-contain"
            style={{ width: "820px", minWidth: "820px" }}
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      </a>

      <div className="grid grid-cols-3 gap-2">
        {[
          { value: String(stats.repos), label: "Repositories" },
          { value: String(stats.stars), label: "Stars" },
          { value: stats.contributions, label: "Contributions" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-line bg-card-elevated px-2 py-3 text-center"
          >
            <p className="text-lg font-bold leading-none tracking-tight text-fg">
              {s.value}
            </p>
            <p className="mt-1 text-[11px] leading-none text-fg-muted">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-1 flex-col">
        <p className="text-xs font-semibold text-fg">Featured Repositories</p>
        <ul className="mt-2 max-h-[320px] flex flex-col divide-y divide-line overflow-y-auto rounded-lg border border-line bg-card overscroll-contain">
          {repos.map((repo) => (
            <li key={repo.name}>
              <a
                href={repo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-card-elevated"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-accent/10 text-accent">
                  <RepoIcon size={13} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium leading-none text-fg">
                    {repo.name}
                  </span>
                  <span className="block truncate text-[11px] leading-none text-fg-muted">
                    {repo.description}
                  </span>
                </span>
                {repo.stars !== null && (
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs text-fg-muted">
                    <StarCountIcon size={11} />
                    {repo.stars}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
        {repos.length > 10 && (
          <a
            href={github.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex text-xs font-medium text-accent hover:underline"
          >
            See more on GitHub →
          </a>
        )}
      </div>
    </div>
  );
}
