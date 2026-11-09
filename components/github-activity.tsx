"use client";

import { useCallback, useEffect, useState } from "react";
import { useAutoRefresh } from "@/components/use-auto-refresh";

import { github } from "@/data/site";
import { GithubIcon } from "@/components/icons";
import { GitHubHeatmap } from "@/components/github-heatmap";

const STATS_FALLBACK = {
  repos: 22,
  stars: 22,
  contributions: "400+",
};

export function GitHubActivity() {
  const revision = useAutoRefresh();
  const [stats, setStats] = useState(STATS_FALLBACK);
  const [unavailable, setUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const updateContributions = useCallback((total: number) => {
    setStats(current => ({ ...current, contributions: total.toLocaleString("en-US") }));
  }, []);

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

        setUnavailable(!userRes.ok || !reposRes.ok);
        const user = userRes.ok ? await userRes.json() as { public_repos?: number } : null;
        const list = reposRes.ok ? await reposRes.json() as Array<{ stargazers_count?: number }> : null;
        if (cancelled) return;
        setStats(current => ({
          repos: typeof user?.public_repos === "number" ? user.public_repos : current.repos,
          stars: list ? list.reduce((total, repo) => total + (repo.stargazers_count ?? 0), 0) : current.stars,
          contributions: current.contributions,
        }));
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
  }, [revision]);

  return (
    <div className="flex h-full min-w-0 flex-col gap-4">
      <div className="github-activity-header">
        <div className="github-activity-title">
          <span className="github-activity-icon"><GithubIcon size={19} /></span>
          <div>
            <p>Developer activity</p>
            <h3>GitHub Activity</h3>
          </div>
        </div>
        <a href={github.profileUrl} target="_blank" rel="noopener noreferrer">
          View profile <span aria-hidden="true">↗</span>
        </a>
      </div>

      {/* Contribution heatmap */}
      <div
        data-heatmap-wrapper
        className="github-calendar-panel"
      >
        <GitHubHeatmap onTotal={updateContributions} />
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
