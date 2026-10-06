"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/components/theme-provider";

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

const DARK_COLORS = ["#161b22", "#0e2e5c", "#1a4fb5", "#2563eb", "#3b82f6"];

const LIGHT_COLORS = ["#ebedf0", "#6fd695", "#3cb35e", "#2d8f4b", "#216e39"];

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

export function GitHubHeatmap() {
  const [contributions, setContributions] = useState<Contribution[] | null>(
    null,
  );

  const { theme } = useTheme();

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
        }
      } catch {
        if (!cancelled) {
          setContributions([]);
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
  }, []);

  const weeks = useMemo(() => {
    if (!contributions) return [];

    return buildCalendar(contributions);
  }, [contributions]);

  const months = useMemo(() => {
    return getMonthLabels(weeks);
  }, [weeks]);

  const colors = theme === "dark" ? DARK_COLORS : LIGHT_COLORS;

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
                  className={`h-[11px] w-[11px] rounded-[2px] ${
                    theme === "dark" ? "bg-[#2b3038]" : "bg-[#eef1f4]"
                  }`}
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
        className={`flex h-[96px] items-center justify-center text-xs ${
          theme === "dark" ? "text-white/35" : "text-slate-400"
        }`}
      >
        GitHub activity unavailable
      </div>
    );
  }

  return (
    <div
      tabIndex={0}
      role="region"
      aria-label="GitHub contribution calendar, scroll horizontally for earlier weeks"
      data-lenis-prevent
      ref={(el) => { if (el) el.scrollLeft = el.scrollWidth; }}
      className="w-full overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent"
    >
      <div className="min-w-max">
        {/* Month labels */}
        <div className="flex h-[16px]">
          <div className="w-[27px] shrink-0" />

          <div className="flex gap-[3px]">
            {months.map((month, index) => (
              <span
                key={index}
                className={`w-[11px] shrink-0 text-[9px] leading-none ${
                  theme === "dark" ? "text-white/35" : "text-slate-400"
                }`}
              >
                {month}
              </span>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="mt-[2px] flex">
          {/* Day labels */}
          <div
            className={`flex w-[27px] shrink-0 flex-col gap-[3px] pt-[1px] text-[9px] leading-[11px] ${
              theme === "dark" ? "text-white/35" : "text-slate-400"
            }`}
          >
            <span>Mon</span>
            <span className="invisible">Tue</span>
            <span>Wed</span>
            <span className="invisible">Thu</span>
            <span>Fri</span>
            <span className="invisible">Sat</span>
            <span className="invisible">Sun</span>
          </div>

          {/* Contribution weeks */}
          <div className="flex gap-[3px]">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex shrink-0 flex-col gap-[3px]">
                {week.map((cell, dayIndex) => {
                  const level = Math.min(cell.level, 4);

                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`h-[11px] w-[11px] rounded-[2px] border ${
                        theme === "dark"
                          ? "border-white/[0.035]"
                          : "border-black/[0.04]"
                      }`}
                      style={{
                        backgroundColor: colors[level],
                      }}
                      title={`${cell.count} contribution${
                        cell.count === 1 ? "" : "s"
                      } on ${cell.date}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
