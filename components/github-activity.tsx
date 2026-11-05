"use client";

import { useEffect, useState } from "react";

import { github } from "@/data/site";
import { GithubIcon } from "@/components/icons";
import { GitHubHeatmap } from "@/components/github-heatmap";

const STATS_FALLBACK = {
  repos: 22,
  stars: 22,
  contributions: "400+",
};

export function GitHubActivity() {
  const [stats, setStats] = useState(STATS_FALLBACK);
  const [unavailable, setUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);

    (async () => {
      try {
        const [userRes, reposRes] = await Promise.all([
          fetch("https://api.github.com/users/Czar-16", {
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch(
            "https://api.github.com/users/Czar-16/repos?per_page=100&sort=updated",
            {
              cache: "no-store",
              signal: controller.signal,
            },
          ),
        ]);

        if (cancelled) return;

        if (!userRes.ok || !reposRes.ok) setUnavailable(true);
        const user = userRes.ok ? await userRes.json() as { public_repos?: number } : null;
        const list = reposRes.ok ? await reposRes.json() as Array<{ stargazers_count?: number }> : null;
        if (cancelled) return;
        setStats({
          repos: typeof user?.public_repos === "number" ? user.public_repos : STATS_FALLBACK.repos,
          stars: list ? list.reduce((total, repo) => total + (repo.stargazers_count ?? 0), 0) : STATS_FALLBACK.stars,
          contributions: STATS_FALLBACK.contributions,
        });
      } catch {
        if (cancelled) return;
        setUnavailable(true);
      } finally {
        if (!cancelled) setLoading(false);
        window.clearTimeout(timeout);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="flex h-full min-w-0 flex-col gap-4">
      {/* Section heading */}
      <a
        href={github.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2"
      >
        <GithubIcon size={16} className="text-fg-secondary" />

        <h3 className="text-sm font-semibold tracking-tight text-fg">
          GitHub Activity
        </h3>
      </a>

      {/* Contribution heatmap */}
      <div
        data-heatmap-wrapper
        className="github-calendar-panel"
      >
        <GitHubHeatmap />
      </div>

      {/* Stats */}
      <div className="github-stats" role="group" aria-label="GitHub statistics" aria-busy={loading}>
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
            className="github-stat"
          >
            <p className="text-sm font-semibold leading-none tracking-tight text-fg">
              {stat.value}
            </p>

            <p className="text-[10px] leading-4 text-fg-secondary">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <p role="status" className="sr-only">
        {unavailable ? "Live GitHub statistics unavailable. Showing fallback totals where needed." : ""}
      </p>
    </div>
  );
}
