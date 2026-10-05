"use client";

import { useEffect, useState } from "react";

import { github } from "@/data/site";
import { RepoIcon, StarCountIcon } from "@/components/icons";
import { GitHubHeatmap } from "@/components/github-heatmap";

type RepoRow = {
  name: string;
  description: string;
  href: string;
  stars: number;
};

const STATS_FALLBACK = {
  repos: 22,
  stars: 22,
  contributions: "400+",
};

const FALLBACK_REPOS: RepoRow[] = [
  {
    name: "DesignArena",
    description: "AI-powered LLD practice platform",
    href: "https://github.com/Czar-16/DesignArena",
    stars: 1,
  },
  {
    name: "BuzzLine",
    description: "Real-time chat platform",
    href: "https://github.com/Czar-16/BuzzLine",
    stars: 2,
  },
  {
    name: "PurePin",
    description: "Pinterest image downloader",
    href: "https://github.com/Czar-16/PurePin",
    stars: 0,
  },
  {
    name: "Payloop",
    description: "Digital wallet application",
    href: "https://github.com/Czar-16/payloop",
    stars: 0,
  },
  {
    name: "Corner",
    description: "Medium-style blogging platform",
    href: "https://github.com/Czar-16/Corner",
    stars: 0,
  },
  {
    name: "Blackout",
    description: "Dark mode extension",
    href: "https://github.com/Czar-16/Blackout",
    stars: 0,
  },
  {
    name: "Clixx",
    description: "YouTube-like application",
    href: "https://github.com/Czar-16/Clixx",
    stars: 0,
  },
  {
    name: "EchoNode",
    description: "Aesthetic web app",
    href: "https://github.com/Czar-16/EchoNode",
    stars: 0,
  },
];

export function GitHubActivity() {
  const [stats, setStats] = useState(STATS_FALLBACK);
  const [repos, setRepos] = useState<RepoRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [userRes, reposRes] = await Promise.all([
          fetch("https://api.github.com/users/Czar-16", {
            cache: "no-store",
          }),
          fetch(
            "https://api.github.com/users/Czar-16/repos?per_page=100&sort=updated",
            {
              cache: "no-store",
            },
          ),
        ]);

        if (cancelled) return;

        let totalRepos = STATS_FALLBACK.repos;

        if (userRes.ok) {
          const user = (await userRes.json()) as {
            public_repos?: number;
          };

          if (typeof user.public_repos === "number") {
            totalRepos = user.public_repos;
          }
        }

        if (reposRes.ok) {
          const list = (await reposRes.json()) as Array<{
            name: string;
            description: string | null;
            html_url: string;
            stargazers_count: number;
          }>;

          const rows: RepoRow[] = list
            .filter((repo) => !repo.name.startsWith("."))
            .map((repo) => ({
              name: repo.name,
              description: repo.description?.slice(0, 90) ?? "",
              href: repo.html_url,
              stars: repo.stargazers_count ?? 0,
            }));

          const totalStars = list.reduce(
            (total, repo) => total + (repo.stargazers_count ?? 0),
            0,
          );

          setStats({
            repos: totalRepos,
            stars: totalStars,
            contributions: STATS_FALLBACK.contributions,
          });

          setRepos(rows);
        } else {
          const body = await reposRes.text().catch(() => "");
          const limited = body.toLowerCase().includes("rate limit");

          setStats((current) => ({
            ...current,
            repos: totalRepos,
          }));

          if (limited) {
            setRepos(FALLBACK_REPOS);
          } else {
            setRepos([]);
          }
        }
      } catch {
        setRepos((previous) => previous ?? FALLBACK_REPOS);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleRepos = repos ?? [];
  const isLoading = repos === null;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Section heading */}
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

      {/* Contribution heatmap */}
      <div
        data-heatmap-wrapper
        className="overflow-hidden rounded-xl border border-line bg-card p-4 dark:border-[#1e293b] dark:bg-[#0d1117]"
      >
        <a
          href={github.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
          aria-label="View GitHub profile"
        >
          <GitHubHeatmap />
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            value: String(stats.repos),
            label: "Repositories",
          },
          {
            value: String(stats.stars),
            label: "Stars",
          },
          {
            value: stats.contributions,
            label: "Contributions",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-line bg-card-elevated px-2 py-3 text-center"
          >
            <p className="text-lg font-bold leading-none tracking-tight text-fg">
              {stat.value}
            </p>

            <p className="mt-1 text-[11px] leading-none text-fg-muted">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Featured repositories */}
      <div className="flex flex-1 flex-col">
        <p className="text-xs font-semibold text-fg">Featured Repositories</p>

        <ul className="mt-2 flex max-h-[320px] flex-col divide-y divide-line overflow-y-auto overscroll-contain rounded-lg border border-line bg-card">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <li key={index} className="flex items-center gap-3 px-3 py-2.5">
                <span className="h-7 w-7 shrink-0 animate-pulse rounded-md bg-line" />

                <span className="flex-1 space-y-1.5">
                  <span className="block h-3 w-24 animate-pulse rounded bg-line" />

                  <span className="block h-2.5 w-40 animate-pulse rounded bg-line/60" />
                </span>
              </li>
            ))
          ) : visibleRepos.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-fg-muted">
              Couldn&apos;t load repos right now —{" "}
              <a
                href={github.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                view on GitHub
              </a>
            </li>
          ) : (
            visibleRepos.map((repo) => (
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
                      {repo.description || "—"}
                    </span>
                  </span>

                  <span className="inline-flex shrink-0 items-center gap-1 text-xs text-fg-muted">
                    <StarCountIcon size={11} />
                    {repo.stars}
                  </span>
                </a>
              </li>
            ))
          )}
        </ul>

        {/* GitHub link */}
        <a
          href={github.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex text-xs font-medium text-accent hover:underline"
        >
          See more on GitHub →
        </a>
      </div>
    </div>
  );
}
