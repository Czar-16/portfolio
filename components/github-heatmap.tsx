"use client";

import { useEffect, useMemo, useState } from "react";
import { useAutoRefresh } from "@/components/use-auto-refresh";

type Contribution = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

type ApiResponse = {
  total: Record<string, number>;
  contributions: Contribution[];
};

type Cell = {
  date: string;
  count: number;
  level: number;
};

const WEEKS = 53;
const DAYS = 7;

const COLORS = Array.from({ length: 5 }, (_, level) => `var(--heat-${level})`);

function buildCalendar(contributions: Contribution[]): Cell[][] {
  const sorted = [...contributions].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  /*
   * GitHub's contribution graph is a Sunday → Saturday
   * grid. We take the latest 53 weeks.
   */
  const latest = sorted.slice(-(WEEKS * DAYS));

  if (latest.length === 0) {
    return [];
  }

  const firstDate = new Date(`${latest[0].date}T00:00:00`);

  /*
   * Move backwards to the Sunday of the first week.
   */
  firstDate.setDate(firstDate.getDate() - firstDate.getDay());

  const cells: Cell[] = [];

  for (let i = 0; i < WEEKS * DAYS; i++) {
    const date = new Date(firstDate);

    date.setDate(firstDate.getDate() + i);

    const dateString = date.toISOString().slice(0, 10);

    const contribution = sorted.find((item) => item.date === dateString);

    cells.push({
      date: dateString,
      count: contribution?.count ?? 0,
      level: contribution?.level ?? 0,
    });
  }

  return Array.from({ length: WEEKS }, (_, week) =>
    cells.slice(week * DAYS, (week + 1) * DAYS),
  );
}

function getMonthLabels(weeks: Cell[][]) {
  return weeks.map((week) => {
    const first = week.find((cell) => cell.date);

    if (!first) return "";

    const date = new Date(`${first.date}T00:00:00`);

    /*
     * Only show the month when we're in the first
     * seven days of that month.
     */
    if (date.getDate() > 7) {
      return "";
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
    });
  });
}

export function GitHubHeatmap({ onTotal }: { onTotal?: (total: number) => void }) {
  const revision = useAutoRefresh();
  const [contributions, setContributions] = useState<Contribution[] | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);

    async function loadContributions() {
      try {
        const response = await fetch(
          "https://github-contributions-api.jogruber.de/v4/Czar-16?y=last",
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Unable to load GitHub contributions");
        }

        const data = (await response.json()) as ApiResponse;

        if (!cancelled) {
          if (!Array.isArray(data.contributions) || !data.contributions.every((item) =>
            typeof item.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
            Number.isFinite(Date.parse(item.date)) && Number.isFinite(item.count) &&
            Number.isInteger(item.level) && item.level >= 0 && item.level <= 4
          )) throw new Error("Invalid contributions");
          setContributions(data.contributions);
          onTotal?.(data.contributions.reduce((total, day) => total + day.count, 0));
        }
      } catch {
        if (!cancelled) {
          setContributions(current => current ?? []);
        }
      } finally {
        window.clearTimeout(timeout);
      }
    }

    loadContributions();

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [revision, onTotal]);

  const weeks = useMemo(() => {
    if (!contributions) return [];

    return buildCalendar(contributions);
  }, [contributions]);

  const months = useMemo(() => {
    return getMonthLabels(weeks);
  }, [weeks]);

  const colors = COLORS;

  /*
   * Loading state
   */
  if (contributions === null) {
    return (
      <div role="status" aria-label="Loading GitHub contributions" className="w-full overflow-hidden">
        <div className="flex gap-[3px]">
          <div className="w-[27px] shrink-0" />

          {Array.from({
            length: WEEKS,
          }).map((_, week) => (
            <div key={week} className="flex shrink-0 flex-col gap-[3px]">
              {Array.from({
                length: DAYS,
              }).map((_, day) => (
                <div
                  key={day}
                  className="h-[11px] w-[11px] rounded-[2px] bg-[var(--heat-0)]"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /*
   * API failed
   */
  if (!weeks.length) {
    return (
      <div
        role="status"
        className="flex h-[96px] items-center justify-center text-xs text-fg-muted"
      >
        GitHub activity unavailable
      </div>
    );
  }

  return (
    <div>
      <div
        tabIndex={0}
        role="region"
        aria-label="GitHub contribution calendar, scroll horizontally for earlier weeks"
        ref={(el) => { if (el) el.scrollLeft = el.scrollWidth; }}
        className="w-full overflow-x-auto overflow-y-hidden"
      >
        <div className="heatmap-calendar">
          <div className="heatmap-months" aria-hidden="true">
            {months.map((month, index) => <span key={index}>{month}</span>)}
          </div>
          <div className="heatmap-grid">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="heatmap-week">
                {week.map((cell, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className="contribution-cell"
                    style={{ backgroundColor: colors[Math.min(cell.level, 4)] }}
                    title={`${cell.count} contribution${cell.count === 1 ? "" : "s"} on ${cell.date}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="heatmap-legend" aria-label="Contribution intensity, from less active to more active">
        <span className="mr-1">Less</span>
        {colors.map((color, level) => <span key={color} className="contribution-cell size-2.5" style={{ backgroundColor: color }} title={`Activity level ${level}`} />)}
        <span className="ml-1">More</span>
      </div>
    </div>
  );
}
