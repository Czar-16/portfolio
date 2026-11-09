"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
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

type DayTooltip = {
  date: string;
  count: number;
  x: number;
  y: number;
  below: boolean;
  pinned: boolean;
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

  const firstDate = new Date(`${latest[0].date}T00:00:00Z`);

  /*
   * Move backwards to the Sunday of the first week.
   */
  firstDate.setUTCDate(firstDate.getUTCDate() - firstDate.getUTCDay());

  const cells: Cell[] = [];
  const byDate = new Map(sorted.map((item) => [item.date, item]));

  for (let i = 0; i < WEEKS * DAYS; i++) {
    const date = new Date(firstDate);

    date.setUTCDate(firstDate.getUTCDate() + i);

    const dateString = date.toISOString().slice(0, 10);

    const contribution = byDate.get(dateString);

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

    const date = new Date(`${first.date}T12:00:00`);

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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<DayTooltip | null>(null);
  const showLatestWeek = useCallback((element: HTMLDivElement | null) => {
    if (element) element.scrollLeft = element.scrollWidth;
  }, []);

  useEffect(() => {
    if (!tooltip?.pinned) return;
    const dismiss = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest("[data-contribution-date]")) setTooltip(null);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [tooltip?.pinned]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);

    async function loadContributions() {
      try {
        const response = await fetch(
          "/api/github-contributions",
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
  const latestDate = contributions?.reduce((latest, day) => day.date > latest ? day.date : latest, "") ?? "";
  const days = useMemo(() => weeks.flat().filter((day) => day.date <= latestDate), [weeks, latestDate]);
  const activeDate = selectedDate && days.some((day) => day.date === selectedDate) ? selectedDate : latestDate;

  function showDay(day: Cell, element: HTMLElement, pinned: boolean) {
    const rect = element.getBoundingClientRect();
    setTooltip({
      date: day.date,
      count: day.count,
      x: Math.max(90, Math.min(window.innerWidth - 90, rect.left + rect.width / 2)),
      y: rect.top < 56 ? rect.bottom + 10 : rect.top - 10,
      below: rect.top < 56,
      pinned,
    });
  }

  function selectDay(index: number, focus = false) {
    const day = days[index];
    if (!day) return;
    setSelectedDate(day.date);
    if (focus) {
      document.querySelector<HTMLButtonElement>(`[data-contribution-date="${day.date}"]`)?.focus();
    }
  }

  function handleDayKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "Escape") { setTooltip(null); return; }
    const offset = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 }[event.key];
    if (offset === undefined) return;
    event.preventDefault();
    selectDay(Math.max(0, Math.min(days.length - 1, index + offset)), true);
  }

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
      <div className="heatmap-heading">
        <span>Contribution calendar</span>
        <span>Last 12 months</span>
      </div>
      <div
        tabIndex={0}
        role="region"
        aria-label="GitHub contribution calendar, scroll horizontally for earlier weeks"
        ref={showLatestWeek}
        className="w-full overflow-x-auto overflow-y-hidden"
        onScroll={() => setTooltip(null)}
      >
        <div className="heatmap-calendar">
          <div className="heatmap-months" aria-hidden="true">
            {months.map((month, index) => <span key={index}>{month}</span>)}
          </div>
          <div className="heatmap-grid">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="heatmap-week">
                {week.map((cell, dayIndex) => (
                  <button
                    key={`${weekIndex}-${dayIndex}`}
                    type="button"
                    className="contribution-cell"
                    data-contribution-date={cell.date}
                    data-selected={cell.date === selectedDate}
                    tabIndex={cell.date === activeDate ? 0 : -1}
                    disabled={cell.date > latestDate}
                    aria-label={`${cell.count} contribution${cell.count === 1 ? "" : "s"} on ${new Date(`${cell.date}T12:00:00`).toLocaleDateString("en-US", { dateStyle: "full" })}`}
                    aria-pressed={cell.date === selectedDate}
                    onPointerEnter={(event) => { if (event.pointerType === "mouse") showDay(cell, event.currentTarget, false); }}
                    onPointerLeave={() => setTooltip(current => current?.pinned ? current : null)}
                    onFocus={(event) => showDay(cell, event.currentTarget, false)}
                    onBlur={() => setTooltip(current => current?.pinned ? current : null)}
                    onClick={(event) => { setSelectedDate(cell.date); showDay(cell, event.currentTarget, true); }}
                    onKeyDown={(event) => handleDayKeyDown(event, weekIndex * DAYS + dayIndex)}
                    style={{ backgroundColor: colors[Math.min(cell.level, 4)] }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="heatmap-legend" aria-label="Contribution intensity, from less active to more active">
        <span>Less</span>
        {colors.map((color, level) => <span key={color} className="contribution-cell" style={{ backgroundColor: color }} title={`Activity level ${level}`} />)}
        <span>More</span>
      </div>
      {tooltip && <div className="heatmap-tooltip" data-below={tooltip.below} role="status" style={{ left: tooltip.x, top: tooltip.y }}>
        {tooltip.count} contribution{tooltip.count === 1 ? "" : "s"} on {new Date(`${tooltip.date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </div>}
    </div>
  );
}
