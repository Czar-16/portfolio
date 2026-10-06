"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  type AnimationSequence,
  motion,
  useAnimate,
  useInView,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react";
import { SectionHeading } from "@/components/section-heading";
import { StaggerChildren, StaggerItem } from "@/components/reveal";
import { useDocumentVisible } from "@/components/use-document-visible";
import { useReducedMotion } from "@/components/use-reduced-motion";

/* ---------- shared frame for the artwork ---------- */

const ArtworkActive = createContext(false);

function Art({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20px" });
  const visible = useDocumentVisible();
  const reduce = useReducedMotion();
  const active = inView && visible && !reduce;
  const mask = "radial-gradient(ellipse at center, black 30%, transparent 75%)";
  return (
    <div
      ref={ref}
      data-art-active={active}
      className="artwork relative mb-5 h-44 shrink-0 overflow-hidden rounded-2xl border border-accent/15 bg-accent/5"
    >
      <div
        aria-hidden
        className="absolute inset-0 text-fg-muted opacity-25"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "16px 16px",
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      />
      <ArtworkActive.Provider value={active}>
        <div className="relative h-full w-full">{children}</div>
      </ArtworkActive.Provider>
    </div>
  );
}

function Tile({
  title,
  desc,
  className = "",
  children,
}: {
  title: string;
  desc: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`card card-lift group flex h-full flex-col p-5 ${className}`}
      data-capability-card
    >
      <Art>{children}</Art>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-md leading-snug text-fg-muted">{desc}</p>
    </div>
  );
}

/* ---------- 1. Full-stack: a tiny app saving a task, front to back ---------- */

const EASE = [0.4, 0, 0.2, 1] as const;

function AppDemoArt() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-60px" });
  const artActive = useContext(ArtworkActive);
  const reduce = useReducedMotion();
  const [scope, animate] = useAnimate();
  const cx = useMotionValue(170);
  const cy = useMotionValue(120);

  useEffect(() => {
    if (!inView || reduce || !artActive) return;
    let stop = false;
    let controls: { stop: () => void } | undefined;

    (async () => {
      while (!stop) {
        const seq = [
          ["[data-ph]", { opacity: 0 }, { duration: 0.2, at: 0.25 }],
          [
            "[data-text]",
            { width: 56 },
            { duration: 1, ease: "linear", at: 0.3 },
          ],
          [cx, [170, 240], { duration: 0.8, ease: EASE, at: 1.2 }],
          [cy, [120, 50], { duration: 0.8, ease: EASE, at: 1.2 }],
          ["[data-btn]", { scale: [1, 0.94, 1] }, { duration: 0.25, at: 2.05 }],
          [
            "[data-ripple]",
            { opacity: [0.45, 0], scale: [1, 1.5] },
            { duration: 0.5, at: 2.05 },
          ],
          ["[data-save]", { opacity: 0 }, { duration: 0.12, at: 2.1 }],
          ["[data-spin]", { opacity: 1 }, { duration: 0.12, at: 2.1 }],
          ["[data-spin]", { opacity: 0 }, { duration: 0.12, at: 2.8 }],
          [
            "[data-btn]",
            { backgroundColor: "#10b981" },
            { duration: 0.3, at: 2.8 },
          ],
          ["[data-done]", { opacity: 1 }, { duration: 0.2, at: 2.85 }],
          [
            "[data-row]",
            { opacity: [0, 1], x: [-8, 0] },
            { duration: 0.5, ease: "easeOut", at: 2.9 },
          ],
          [cx, [240, 268], { duration: 0.9, ease: EASE, at: 3.2 }],
          [cy, [50, 118], { duration: 0.9, ease: EASE, at: 3.2 }],
          ["[data-done]", { opacity: 0 }, { duration: 0.3, at: 5.2 }],
          [
            "[data-btn]",
            { backgroundColor: "#0ea5e9" },
            { duration: 0.3, at: 5.2 },
          ],
          ["[data-save]", { opacity: 1 }, { duration: 0.3, at: 5.3 }],
          [
            "[data-row]",
            { opacity: [1, 0], x: [0, -8] },
            { duration: 0.4, at: 5.2 },
          ],
          ["[data-text]", { width: 0 }, { duration: 0.4, at: 5.2 }],
          ["[data-ph]", { opacity: 1 }, { duration: 0.3, at: 5.5 }],
          [cx, [268, 170], { duration: 0.7, ease: EASE, at: 5.2 }],
          [cy, [118, 120], { duration: 0.7, ease: EASE, at: 5.2 }],
        ] as AnimationSequence;
        controls = animate(seq);
        try {
          await controls;
        } catch {
          break;
        }
      }
    })();

    return () => {
      stop = true;
      controls?.stop();
    };
  }, [inView, reduce, artActive, animate, cx, cy]);

  const rows = [
    { t: "Set up auth", c: "bg-emerald-400" },
    { t: "Design schema", c: "bg-emerald-400" },
  ];

  return (
    <div ref={ref} className="relative flex h-full items-center justify-center">
      <div
        aria-hidden
        className="absolute size-44 rounded-full bg-accent/20 blur-3xl"
      />
      <div
        ref={scope}
        className="relative h-[148px] w-full max-w-[288px] overflow-hidden rounded-lg border border-white/10 bg-black text-[11px] text-zinc-200 shadow-2xl"
      >
        <div className="flex h-6 items-center gap-1.5 border-b border-white/10 px-3">
          <span className="size-2 rounded-full bg-zinc-700" />
          <span className="size-2 rounded-full bg-zinc-700" />
          <span className="size-2 rounded-full bg-zinc-700" />
          <span className="ml-2 rounded bg-white/5 px-2 text-[9px] text-zinc-500">
            app.dev/tasks
          </span>
        </div>

        <div className="absolute left-3 top-[36px] right-[92px] flex h-7 items-center rounded-md border border-white/10 bg-white/5 px-2">
          <span
            data-ph
            className="absolute text-zinc-500"
            style={{ opacity: reduce ? 0 : 1 }}
          >
            Add a task…
          </span>
          <span
            data-text
            className="block overflow-hidden whitespace-nowrap"
            style={{ width: reduce ? 56 : 0 }}
          >
            Deploy v2
          </span>
        </div>

        <div
          data-btn
          className="absolute right-3 top-[36px] h-7 w-[72px] rounded-md bg-sky-500 font-medium text-white"
        >
          <span
            data-ripple
            className="absolute inset-0 rounded-md bg-sky-500 opacity-0"
          />
          <span data-save className="absolute inset-0 grid place-items-center">
            Save
          </span>
          <span
            data-spin
            className="absolute inset-0 grid place-items-center opacity-0"
          >
            <span className="size-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </span>
          <span
            data-done
            className="absolute inset-0 grid place-items-center opacity-0"
          >
            ✓ Saved
          </span>
        </div>

        {rows.map((r, i) => (
          <div
            key={r.t}
            className="absolute left-3 right-3 flex h-[18px] items-center gap-2 rounded bg-white/[0.05] px-2 text-[10px]"
            style={{ top: 76 + i * 20 }}
          >
            <span className={`size-1.5 rounded-full ${r.c}`} />
            {r.t}
          </div>
        ))}
        <div
          data-row
          className="absolute left-3 right-3 flex h-[18px] items-center gap-2 rounded bg-white/[0.05] px-2 text-[10px]"
          style={{ top: 116, opacity: reduce ? 1 : 0 }}
        >
          <span className="size-1.5 rounded-full bg-sky-500" />
          Deploy v2
        </div>

        {!reduce && (
          <motion.svg
            aria-hidden
            width="14"
            height="14"
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-0 top-0 z-10"
            style={{ x: cx, y: cy }}
          >
            <path
              d="M5 3l14 8-6 2 4 7-3 1-4-7-5 4z"
              fill="#fff"
              stroke="#000"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </div>
    </div>
  );
}

/* ---------- 2. Real-time: a message routed through a hub and broadcast ---------- */

const HUB = { x: 150, y: 88 };
const CLIENTS = Array.from({ length: 5 }, (_, i) => {
  const a = ((-90 + 72 * i) * Math.PI) / 180;
  return { x: HUB.x + 104 * Math.cos(a), y: HUB.y + 58 * Math.sin(a) };
});
const ORDER = [0, 3, 1, 4, 2];

function RealtimeArt() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-60px" });
  const reduce = useReducedMotion();
  const artActive = useContext(ArtworkActive);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!inView || reduce || !artActive) return;
    const id = setInterval(() => setTick((t) => t + 1), 2800);
    return () => clearInterval(id);
  }, [inView, reduce, artActive]);

  const from = CLIENTS[ORDER[tick % ORDER.length]];

  return (
    <div ref={ref} className="h-full w-full">
      <svg
        viewBox="0 0 300 176"
        className="h-full w-full text-accent"
        fill="none"
      >
        {CLIENTS.map((c, i) => (
          <line
            key={i}
            x1={HUB.x}
            y1={HUB.y}
            x2={c.x}
            y2={c.y}
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeDasharray="2 4"
          />
        ))}

        <motion.g
          animate={artActive ? { rotate: 360 } : { rotate: 0 }}
          transition={
            artActive
              ? { duration: 16, repeat: Infinity, ease: "linear" }
              : { duration: 0 }
          }
          style={{ transformOrigin: `${HUB.x}px ${HUB.y}px` }}
        >
          <circle
            cx={HUB.x}
            cy={HUB.y}
            r="24"
            stroke="currentColor"
            strokeOpacity="0.4"
            strokeDasharray="4 6"
          />
        </motion.g>
        <circle
          cx={HUB.x}
          cy={HUB.y}
          r="13"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx={HUB.x} cy={HUB.y} r="5" fill="currentColor" />

        {CLIENTS.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r="7"
            fill="currentColor"
            fillOpacity="0.85"
          />
        ))}

        {artActive && (
          <g key={tick}>
            {/* sender ripple */}
            <motion.circle
              cx={from.x}
              cy={from.y}
              stroke="currentColor"
              initial={{ r: 7, opacity: 0.8 }}
              animate={{ r: 22, opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
            {/* message to hub */}
            <motion.circle
              r="3.5"
              fill="currentColor"
              style={{ filter: "drop-shadow(0 0 6px currentColor)" }}
              initial={{ cx: from.x, cy: from.y, opacity: 1 }}
              animate={{ cx: HUB.x, cy: HUB.y, opacity: [1, 1, 0] }}
              transition={{ duration: 0.5, ease: "easeIn" }}
            />
            {/* hub pulse */}
            <motion.circle
              cx={HUB.x}
              cy={HUB.y}
              stroke="currentColor"
              initial={{ r: 13, opacity: 0 }}
              animate={{ r: 38, opacity: [0, 0.7, 0] }}
              transition={{ duration: 0.8, delay: 0.45 }}
            />
            {/* broadcast */}
            {CLIENTS.map((c, j) =>
              c === from ? null : (
                <g key={j}>
                  <motion.circle
                    r="3.5"
                    fill="currentColor"
                    style={{ filter: "drop-shadow(0 0 6px currentColor)" }}
                    initial={{ cx: HUB.x, cy: HUB.y, opacity: 0 }}
                    animate={{ cx: c.x, cy: c.y, opacity: [0, 1, 1, 0] }}
                    transition={{
                      duration: 0.6,
                      delay: 0.5,
                      ease: "easeOut",
                      times: [0, 0.1, 0.85, 1],
                    }}
                  />
                  <motion.circle
                    cx={c.x}
                    cy={c.y}
                    stroke="currentColor"
                    initial={{ r: 7, opacity: 0 }}
                    animate={{ r: 20, opacity: [0, 0.7, 0] }}
                    transition={{ duration: 0.6, delay: 1.05 }}
                  />
                </g>
              ),
            )}
          </g>
        )}
      </svg>
    </div>
  );
}

/* ---------- 3. AI: a glowing core with particles orbiting it ---------- */

const CORE = { x: 150, y: 88 };

const ORBITS = [
  { rx: 120, ry: 34, rot: -18, speed: 0.5, size: 4, phases: [0, Math.PI] },
  {
    rx: 98,
    ry: 54,
    rot: 32,
    speed: -0.38,
    size: 3.5,
    phases: [1.2, 1.2 + Math.PI],
  },
  {
    rx: 74,
    ry: 22,
    rot: 82,
    speed: 0.7,
    size: 3,
    phases: [2.4, 2.4 + Math.PI],
  },
];

function Particle({
  orbit,
  phase,
  time,
}: {
  orbit: (typeof ORBITS)[number];
  phase: number;
  time: MotionValue<number>;
}) {
  const rad = (orbit.rot * Math.PI) / 180;
  const angle = (t: number) => (t / 1000) * orbit.speed + phase;
  const x = useTransform(time, (t) => {
    const a = angle(t);
    const px = orbit.rx * Math.cos(a);
    const py = orbit.ry * Math.sin(a);
    return CORE.x + px * Math.cos(rad) - py * Math.sin(rad);
  });
  const y = useTransform(time, (t) => {
    const a = angle(t);
    const px = orbit.rx * Math.cos(a);
    const py = orbit.ry * Math.sin(a);
    return CORE.y + px * Math.sin(rad) + py * Math.cos(rad);
  });
  // particles on the "far" half of the orbit are smaller and fainter
  const depth = useTransform(time, (t) => Math.sin(angle(t)));
  const r = useTransform(depth, (d) => orbit.size * (0.75 + 0.35 * d));
  const opacity = useTransform(depth, (d) => 0.65 + 0.35 * d);

  return (
    <motion.circle
      cx={x}
      cy={y}
      r={r}
      fill="currentColor"
      style={{ opacity, filter: "drop-shadow(0 0 5px currentColor)" }}
    />
  );
}

function CoreArt() {
  const reduce = useReducedMotion();
  const artActive = useContext(ArtworkActive);
  const clock = useMotionValue(0);
  const still = useMotionValue(0);
  const time = reduce ? still : clock;

  useEffect(() => {
    if (!artActive) return;
    let frame: number;
    let previous: number | undefined;
    const tick = (timestamp: number) => {
      if (previous !== undefined)
        clock.set(clock.get() + Math.min(timestamp - previous, 64));
      previous = timestamp;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [artActive, clock]);

  return (
    <svg
      viewBox="0 0 300 176"
      className="h-full w-full text-accent"
      fill="none"
    >
      <defs>
        <radialGradient id="ai-core-halo">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.55" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ai-core-body" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="35%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
        </radialGradient>
      </defs>

      {ORBITS.map((o, i) => (
        <ellipse
          key={i}
          cx={CORE.x}
          cy={CORE.y}
          rx={o.rx}
          ry={o.ry}
          transform={`rotate(${o.rot} ${CORE.x} ${CORE.y})`}
          stroke="currentColor"
          strokeOpacity="0.2"
        />
      ))}

      {artActive &&
        [0, 1.6].map((delay) => (
          <motion.circle
            key={delay}
            cx={CORE.x}
            cy={CORE.y}
            stroke="currentColor"
            initial={{ r: 18, opacity: 0 }}
            animate={{ r: [18, 74], opacity: [0.5, 0] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeOut",
              delay,
            }}
          />
        ))}

      <motion.g
        animate={artActive ? { scale: [1, 1.07, 1] } : { scale: 1 }}
        transition={
          artActive
            ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0 }
        }
        style={{ transformOrigin: `${CORE.x}px ${CORE.y}px` }}
      >
        <circle cx={CORE.x} cy={CORE.y} r="38" fill="url(#ai-core-halo)" />
        <circle cx={CORE.x} cy={CORE.y} r="17" fill="url(#ai-core-body)" />
      </motion.g>

      <motion.g
        animate={artActive ? { rotate: 360 } : { rotate: 0 }}
        transition={
          artActive
            ? { duration: 22, repeat: Infinity, ease: "linear" }
            : { duration: 0 }
        }
        style={{ transformOrigin: `${CORE.x}px ${CORE.y}px` }}
      >
        <path
          d={`M${CORE.x} ${CORE.y - 9} L${CORE.x + 2.2} ${CORE.y - 2.2} L${CORE.x + 9} ${CORE.y} L${CORE.x + 2.2} ${CORE.y + 2.2} L${CORE.x} ${CORE.y + 9} L${CORE.x - 2.2} ${CORE.y + 2.2} L${CORE.x - 9} ${CORE.y} L${CORE.x - 2.2} ${CORE.y - 2.2} Z`}
          fill="#fff"
          fillOpacity="0.95"
        />
      </motion.g>

      {ORBITS.flatMap((o, i) =>
        o.phases.map((ph, j) => (
          <Particle key={`${i}-${j}`} orbit={o} phase={ph} time={time} />
        )),
      )}
    </svg>
  );
}

/* ---------- 4. Dev tools: a terminal that builds, ships and loops ---------- */

type Step =
  | { kind: "type"; text: string }
  | { kind: "bar" }
  | { kind: "out"; text: string };

const STEPS: Step[] = [
  { kind: "type", text: "$ npm run build" },
  { kind: "bar" },
  { kind: "out", text: "✓ compiled in 0.4s" },
  { kind: "type", text: "$ git push origin main" },
  { kind: "out", text: "✓ shipped" },
];

function TerminalArt() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-40px" });
  const reduce = useReducedMotion();
  const artActive = useContext(ArtworkActive);
  const [idx, setIdx] = useState(0);
  const [chars, setChars] = useState(0);
  const [bar, setBar] = useState(0);

  useEffect(() => {
    if (!inView || reduce || !artActive) return;
    const step = STEPS[idx];
    let timer: ReturnType<typeof setTimeout>;
    let iv: ReturnType<typeof setInterval> | undefined;

    if (!step) {
      timer = setTimeout(() => {
        setIdx(0);
        setChars(0);
        setBar(0);
      }, 2600);
    } else if (step.kind === "type") {
      let c = 0;
      iv = setInterval(() => {
        c += 1;
        setChars(c);
        if (c >= step.text.length) {
          clearInterval(iv);
          timer = setTimeout(() => {
            setChars(0);
            setIdx((i) => i + 1);
          }, 300);
        }
      }, 45);
    } else if (step.kind === "bar") {
      let b = 0;
      iv = setInterval(() => {
        b += 5;
        setBar(Math.min(b, 100));
        if (b >= 100) {
          clearInterval(iv);
          timer = setTimeout(() => setIdx((i) => i + 1), 200);
        }
      }, 45);
    } else {
      timer = setTimeout(() => setIdx((i) => i + 1), 350);
    }
    return () => {
      clearTimeout(timer);
      if (iv) clearInterval(iv);
    };
  }, [idx, inView, reduce, artActive]);

  const upto = reduce ? STEPS.length : Math.min(idx + 1, STEPS.length);

  return (
    <div
      ref={ref}
      className="relative flex h-full items-center justify-center px-6"
    >
      <div
        aria-hidden
        className="absolute size-44 rounded-full bg-accent/20 blur-3xl"
      />
      <div className="relative w-full max-w-xs overflow-hidden rounded-lg border border-white/10 bg-black font-mono text-[11px] leading-[18px] text-zinc-200 shadow-2xl">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
          <span className="size-2 rounded-full bg-zinc-700" />
          <span className="size-2 rounded-full bg-zinc-700" />
          <span className="size-2 rounded-full bg-zinc-700" />
          <span className="ml-2 text-[10px] text-zinc-500">~/portfolio</span>
        </div>
        <div className="h-[104px] p-3">
          {STEPS.slice(0, upto).map((s, i) => {
            const done = reduce || i < idx;
            const active = !reduce && i === idx;
            if (s.kind === "bar") {
              const p = done ? 100 : bar;
              return (
                <div key={i} className="flex items-center gap-2 text-zinc-400">
                  <span>building</span>
                  <span className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                    <span
                      className="block h-full rounded-full bg-sky-400"
                      style={{ width: `${p}%` }}
                    />
                  </span>
                  <span>{p}%</span>
                </div>
              );
            }
            const text =
              s.kind === "type" && active ? s.text.slice(0, chars) : s.text;
            return (
              <p key={i} className={s.kind === "out" ? "text-emerald-400" : ""}>
                {text}
                {active && s.kind === "type" && (
                  <motion.span
                    className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 bg-sky-400"
                    animate={
                      artActive ? { opacity: [1, 0, 1] } : { opacity: 1 }
                    }
                    transition={
                      artActive
                        ? { duration: 0.9, repeat: Infinity }
                        : { duration: 0 }
                    }
                  />
                )}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- section ---------- */

export function WhatIBuild() {
  return (
    <section className="py-16 sm:py-20">
      <div className="shell">
        <SectionHeading
          eyebrow="Capabilities"
          title="What I Build"
          subtitle="Four areas I keep coming back to."
        />

        <StaggerChildren className="mt-10 grid auto-rows-fr grid-cols-1 gap-6 sm:mt-12 md:grid-cols-2">
          <StaggerItem className="h-full">
            <Tile
              title="Full-stack Applications"
              desc="Modern web applications with scalable frontend and backend architecture."
            >
              <AppDemoArt />
            </Tile>
          </StaggerItem>
          <StaggerItem className="h-full">
            <Tile
              title="Real-time Systems"
              desc="WebSockets, event-driven communication and real-time state."
            >
              <RealtimeArt />
            </Tile>
          </StaggerItem>
          <StaggerItem className="h-full">
            <Tile
              title="AI-powered Products"
              desc="Applications that use AI for actual workflows and real problems."
            >
              <CoreArt />
            </Tile>
          </StaggerItem>
          <StaggerItem className="h-full">
            <Tile
              title="Developer Tools"
              desc="Tools that solve problems for developers and learners."
            >
              <TerminalArt />
            </Tile>
          </StaggerItem>
        </StaggerChildren>
      </div>
    </section>
  );
}
