"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { useReducedMotion } from "@/components/use-reduced-motion";
import { isLeetCodeStats, type LeetCodeStats } from "@/lib/leetcode-stats";
import styles from "./leetcode-stats-card.module.css";

// Editable offline snapshot, used only if live data and a saved snapshot are unavailable.
const FALLBACK_STATS: LeetCodeStats = {
  totalSolved: 416,
  easy: { solved: 204, total: 969 },
  medium: { solved: 188, total: 2124 },
  hard: { solved: 24, total: 980 },
};

const STORAGE_KEY = "portfolio:leetcode:Czar16:v1";
const DIFFICULTIES = [
  { key: "easy", label: "Easy" },
  { key: "medium", label: "Medium" },
  { key: "hard", label: "Hard" },
] as const;
type Difficulty = (typeof DIFFICULTIES)[number]["key"];
type AnimationProps = { started: boolean; reduce: boolean };

function AnimatedNumber({ value, started, reduce, delay = 0 }: AnimationProps & { value: number; delay?: number }) {
  const number = useMotionValue(0);
  const rounded = useTransform(number, (latest) => Math.round(latest).toLocaleString("en-US"));

  useEffect(() => {
    if (reduce) {
      number.set(value);
      return;
    }
    if (!started) return;
    const controls = animate(number, value, { duration: 1.2, delay, ease: "easeOut" });
    return () => controls.stop();
  }, [value, started, reduce, delay, number]);

  return (
    <>
      <motion.span aria-hidden="true" className="tabular-nums">{rounded}</motion.span>
      <span className="sr-only">{value.toLocaleString("en-US")}</span>
    </>
  );
}

function ProgressRing({ stats, started, reduce, active }: AnimationProps & { stats: LeetCodeStats; active: Difficulty | null }) {
  const circumference = 2 * Math.PI * 82;
  const segmentCount = DIFFICULTIES.filter(({ key }) => stats[key].solved > 0).length;
  const gap = 10;

  return (
    <div className={styles.ringWrap}>
      <svg
        className={styles.ring}
        viewBox="0 0 200 200"
        role="img"
        aria-label={`${stats.totalSolved} problems solved: Easy ${stats.easy.solved} of ${stats.easy.total}, Medium ${stats.medium.solved} of ${stats.medium.total}, Hard ${stats.hard.solved} of ${stats.hard.total}. Ring shows the solved difficulty distribution.`}
      >
        <circle cx="100" cy="100" r="82" fill="none" stroke="var(--line)" strokeWidth="9" />
        {DIFFICULTIES.map(({ key }, index) => {
          const length = stats.totalSolved > 0
            ? (stats[key].solved / stats.totalSolved) * (circumference - gap * segmentCount)
            : 0;
          const position = gap / 2 + DIFFICULTIES.slice(0, index).reduce((offset, item) => {
            const count = stats[item.key].solved;
            return count > 0
              ? offset + (count / stats.totalSolved) * (circumference - gap * segmentCount) + gap
              : offset;
          }, 0);
          const rotation = -90 + (position / circumference) * 360;
          if (!length) return null;
          return (
            <motion.circle
              key={key}
              cx="100" cy="100" r="82" fill="none"
              className={styles.segment}
              data-difficulty={key}
              data-active={active === key}
              stroke={`var(--lc-${key})`}
              strokeLinecap="round"
              transform={`rotate(${rotation} 100 100)`}
              initial={{ strokeDasharray: `0 ${circumference}`, strokeDashoffset: length }}
              animate={{
                strokeDasharray: `${started || reduce ? length : 0} ${circumference}`,
                strokeDashoffset: started || reduce ? 0 : length,
                strokeWidth: active === key ? 12 : 9,
                opacity: active && active !== key ? 0.25 : 1,
              }}
              transition={{
                strokeDasharray: { duration: reduce ? 0 : 1.2, delay: reduce ? 0 : index * 0.15, ease: "easeOut" },
                strokeDashoffset: { duration: reduce ? 0 : 1.2, delay: reduce ? 0 : index * 0.15, ease: "easeOut" },
                strokeWidth: { duration: reduce ? 0 : 0.18 },
                opacity: { duration: reduce ? 0 : 0.18 },
              }}
            />
          );
        })}
      </svg>
      <div className={styles.ringCenter}>
        <p className="text-4xl font-semibold tracking-tight text-fg tabular-nums">
          <AnimatedNumber value={stats.totalSolved} started={started} reduce={reduce} />
        </p>
        <p className="mt-2 text-xs text-fg-secondary">Problems solved</p>
      </div>
    </div>
  );
}

function DifficultyBar({ difficulty, label, solved, total, index, started, reduce, onHover, onFocusHighlight }: AnimationProps & {
  difficulty: Difficulty; label: string; solved: number; total: number; index: number;
  onHover: (difficulty: Difficulty | null) => void;
  onFocusHighlight: (difficulty: Difficulty | null) => void;
}) {
  const percentage = total > 0 ? (solved / total) * 100 : 0;
  return (
    <div
      className={styles.difficultyRow}
      data-difficulty={difficulty}
      tabIndex={0}
      onMouseEnter={() => onHover(difficulty)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onFocusHighlight(difficulty)}
      onBlur={() => onFocusHighlight(null)}
      aria-label={`${label}: ${solved} of ${total} problems solved`}
    >
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className={styles.difficultyLabel}><span className={styles.dot} aria-hidden="true" />{label}</span>
        <span className="font-mono text-xs tabular-nums text-fg-secondary">
          <span className="text-fg"><AnimatedNumber value={solved} started={started} reduce={reduce} delay={index * 0.15} /></span>
          <span className="mx-1.5">/</span>{total.toLocaleString("en-US")}
        </span>
      </div>
      <div className={styles.barTrack} aria-hidden="true">
        <motion.div
          className={styles.barFill}
          initial={{ width: "0%" }}
          animate={{ width: `${started || reduce ? percentage : 0}%` }}
          transition={{ duration: reduce ? 0 : 1.2, delay: reduce ? 0 : index * 0.15, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function LeetCodeCardSkeleton() {
  return (
    <div className={styles.body} aria-hidden="true">
      <div className={styles.ringWrap}>
        <div className={`${styles.skeletonRing} ${styles.shimmer}`} />
        <div className={styles.ringCenter}>
          <div className={`${styles.skeletonNumber} ${styles.shimmer}`} />
          <div className={`${styles.skeletonCaption} ${styles.shimmer}`} />
        </div>
      </div>
      <div className={styles.rows}>
        {DIFFICULTIES.map(({ key }) => (
          <div key={key} className={styles.difficultyRow}>
            <div className="flex items-center justify-between">
              <div className={`${styles.skeletonLabel} ${styles.shimmer}`} />
              <div className={`${styles.skeletonCount} ${styles.shimmer}`} />
            </div>
            <div className={`${styles.barTrack} ${styles.shimmer}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeetCodeStatsCard() {
  const cardRef = useRef<HTMLElement>(null);
  const started = useInView(cardRef, { once: true, amount: 0.25 });
  const reduce = useReducedMotion();
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [source, setSource] = useState<"live" | "saved" | "fallback">("live");
  const [hovered, setHovered] = useState<Difficulty | null>(null);
  const [focused, setFocused] = useState<Difficulty | null>(null);
  const active = hovered ?? focused;

  useEffect(() => {
    let disposed = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6500);

    async function load() {
      try {
        const response = await fetch("/api/leetcode", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Stats unavailable");
        const fresh: unknown = await response.json();
        if (!isLeetCodeStats(fresh)) throw new Error("Invalid statistics");
        if (disposed) return;
        setStats(fresh);
        setSource("live");
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)); } catch { /* Storage may be disabled. */ }
      } catch {
        if (disposed) return;
        let saved: unknown;
        try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null"); } catch { /* Use offline snapshot. */ }
        const snapshot = isLeetCodeStats(saved) ? saved : null;
        setStats(snapshot ?? FALLBACK_STATS);
        setSource(snapshot ? "saved" : "fallback");
      } finally {
        window.clearTimeout(timeout);
      }
    }

    void load();
    return () => { disposed = true; controller.abort(); window.clearTimeout(timeout); };
  }, []);

  return (
    <article ref={cardRef} className={`card card-lift rounded-2xl ${styles.card}`} data-cursor-glow-border aria-label="LeetCode problem-solving statistics" aria-busy={stats === null}>
      <header className="flex h-7 items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <svg className="h-6 w-6 text-[#FFA116]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m16 3-9 9a4 4 0 0 0 0 6l3 3a4 4 0 0 0 6 0l2-2" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m8 11 3-3a4 4 0 0 1 6 0l2 2M11 16h10" stroke="var(--fg)" strokeWidth="2.3" strokeLinecap="round" />
          </svg>
          <h3 className="text-sm font-semibold tracking-tight">LeetCode</h3>
        </div>
        <a href="https://leetcode.com/u/Czar16/" target="_blank" rel="noopener noreferrer" className={styles.profileLink} aria-label="View Czar16 on LeetCode (opens in a new tab)">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </a>
      </header>
      {stats ? (
        <div className={styles.body}>
          <ProgressRing stats={stats} started={started} reduce={reduce} active={active} />
          <div className={styles.rows}>
            {DIFFICULTIES.map(({ key, label }, index) => (
              <DifficultyBar key={key} difficulty={key} label={label} {...stats[key]} index={index} started={started} reduce={reduce} onHover={setHovered} onFocusHighlight={setFocused} />
            ))}
          </div>
        </div>
      ) : <LeetCodeCardSkeleton />}
      <footer className={styles.footer}>
        <span className="font-mono text-xs text-fg-secondary">@Czar16</span>
        <span className="text-xs text-fg-secondary">One problem at a time</span>
      </footer>
      <span className="sr-only" role="status">
        {stats === null ? "Loading LeetCode statistics" : source === "live" ? "Live LeetCode statistics loaded" : source === "saved" ? "Offline: showing the last saved LeetCode statistics" : "Offline: showing a fallback LeetCode snapshot"}
      </span>
      {source !== "live" && <span className={styles.offline} title={source === "saved" ? "Showing last saved statistics" : "Showing offline snapshot"} aria-hidden="true" />}
    </article>
  );
}
