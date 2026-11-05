"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import localFont from "next/font/local";
import type { IntroPreferences } from "./intro-preferences";

const redaction50 = localFont({
  src: "./fonts/Redaction50-Regular.ttf",
  weight: "400",
  style: "normal",
  display: "swap",
});

type Flags = { music: boolean; motion: boolean };

const COLORS = [
  { name: "green", rgb: "74 222 128" },
  { name: "red", rgb: "255 59 59" },
  { name: "blue", rgb: "59 130 246" },
  { name: "yellow", rgb: "255 214 102" },
] as const;
type Phase = "boot" | "ready" | "launching";

const BOOT: { cmd: string; out: string[]; ok?: boolean }[] = [
  { cmd: "whoami", out: ["Anoop Jha — full-stack AI developer"] },
  { cmd: "cat location.txt", out: ["Delhi-NCR · open to remote"] },
  { cmd: "cat philosophy.txt", out: ["black coffee. code. repeat"] },
  {
    cmd: "npm run ship",
    out: ["✓ compiled successfully in 0.4s", "✓ 0 excuses found"],
    ok: true,
  },
];

export default function TerminalIntro({
  onStart,
  initialPreferences,
}: {
  initialPreferences?: Partial<IntroPreferences>;
  onStart: (opts: Flags & { color: (typeof COLORS)[number]["name"] }) => void;
}) {
  const systemReduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("boot");
  const [pos, setPos] = useState({ line: 0, chars: 0, out: false });
  const [flags, setFlags] = useState<Flags>({ music: true, motion: initialPreferences?.motion ?? true });
  const [ci, setCi] = useState(() => Math.max(0, COLORS.findIndex(color => color.name === initialPreferences?.color)));
  const reduce = systemReduced || !flags.motion;
  const [open, setOpen] = useState(true);
  const skipRef = useRef(false);
  const launchedRef = useRef(false);
  const completedRef = useRef(false);
  const launchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Boot sequence. State is set absolutely (never appended), so React
  // Strict Mode's double-mount in dev can't corrupt it.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let line = 0, chars = 0;
    const finish = () => {
      setPos({ line: BOOT.length, chars: 0, out: true });
      setPhase("ready");
    };
    function type() {
      if (skipRef.current) return finish();
      if (line === BOOT.length) return finish();
      chars++;
      setPos({ line, chars, out: false });
      if (chars < BOOT[line].cmd.length) timer = setTimeout(type, 24);
      else timer = setTimeout(() => {
        if (skipRef.current) return finish();
        setPos({ line, chars, out: true });
        timer = setTimeout(() => { line++; chars = 0; type(); }, 160);
      }, 80);
    }
    if (!launchedRef.current) {
      if (systemReduced) finish();
      else timer = setTimeout(type, 24);
    }
    return () => clearTimeout(timer);
  }, [systemReduced]);

  useEffect(() => () => {
    if (launchTimer.current !== null) clearTimeout(launchTimer.current);
  }, []);

  const lines = BOOT.flatMap((b, i) =>
    i < pos.line
      ? [{ cmd: b.cmd, out: true }]
      : i === pos.line
        ? [{ cmd: b.cmd.slice(0, pos.chars), out: pos.out }]
        : []
  );

  const launch = useCallback(() => {
    if (launchedRef.current) return;
    launchedRef.current = true;
    setPhase("launching");
    launchTimer.current = setTimeout(() => setOpen(false), reduce ? 0 : 650);
  }, [reduce]);

  // Enter: skip the boot, or launch once ready. Esc: skip the boot.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (e.repeat) return;
        if (phase === "boot") skipRef.current = true;
        else if (phase === "ready") launch();
      }
      if (e.key === "Escape" && phase === "boot") skipRef.current = true;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, launch]);

  const flagString = [
    flags.music && "--music",
    flags.motion && "--motion",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AnimatePresence onExitComplete={() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onStart({ ...flags, color: COLORS[ci].name });
    }}>
      {open && (
        <motion.div
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Portfolio intro"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          style={{
            "--a": COLORS[ci].rgb,
            backgroundImage: "radial-gradient(ellipse at 50% 45%, rgb(var(--a)/0.16), transparent 70%), radial-gradient(ellipse at 10% 90%, rgb(var(--a)/0.09), transparent 55%)",
          } as React.CSSProperties}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.25 } }}
        >
          <motion.div
            className="relative w-full max-w-[560px] overflow-hidden rounded-xl border border-white/10 bg-[#0a0c0b] font-mono shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_30px_90px_-20px_rgb(var(--a)/0.18)]"
            initial={reduce ? false : { opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduce
                ? undefined
                : { scale: 1.02, opacity: 0, transition: { duration: 0.25 } }
            }
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            {/* faint scanlines */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 3px)",
              }}
            />

            {/* title bar */}
            <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-3">
              <span className="size-2.5 shrink-0 rounded-full bg-white/15" />
              <span className="size-2.5 shrink-0 rounded-full bg-white/15" />
              <span className="size-2.5 shrink-0 rounded-full bg-white/15" />
              <span className="ml-3 min-w-0 truncate text-xs text-white/40">
                czar16@portfolio: ~
              </span>
              <button
                onClick={() => (phase === "boot" ? (skipRef.current = true) : launch())}
                disabled={phase === "launching"}
                className="ml-auto shrink-0 rounded px-1.5 py-0.5 text-[11px] text-white/35 transition-colors hover:text-white/70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[rgb(var(--a))]"
              >
                skip
              </button>
            </div>

            <div className="px-5 pb-5 pt-4 sm:px-6">
              {/* boot output */}
              <div className="min-h-[212px] space-y-3 text-xs leading-relaxed sm:text-[13px]">
                {lines.map((l, i) => (
                  <div key={i}>
                    <div className="text-white/90">
                      <span className="mr-2 text-[rgb(var(--a))]">$</span>
                      {l.cmd}
                      {phase === "boot" && i === lines.length - 1 && !l.out && (
                        <span className="ml-0.5 inline-block h-[1em] w-[0.55em] translate-y-[2px] animate-pulse bg-[rgb(var(--a))]" />
                      )}
                    </div>
                    {l.out && (
                      <motion.div
                        initial={reduce ? false : { opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`pl-5 ${
                          BOOT[i].ok ? "text-[rgb(var(--a))]" : "text-white/55"
                        }`}
                      >
                        {BOOT[i].out.map((line) => (
                          <div key={line}>{line}</div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>

              {/* headline + prompt */}
              <motion.div
                animate={{
                  opacity: phase === "boot" ? 0.25 : 1,
                  y: !reduce && phase === "boot" ? 6 : 0,
                }}
                transition={{ duration: reduce ? 0 : 0.4 }}
                className="mt-6"
              >
                <h2 className="text-[26px] font-normal tracking-tight text-white sm:text-[30px]"
                  style={{ fontFamily: redaction50.style.fontFamily, fontWeight: 400 }}>
                  Start the Experience
                </h2>

                {/* flag toggles */}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]"
                  style={{ fontFamily: "var(--font-public-sans), ui-sans-serif, system-ui, sans-serif" }}>
                  <span className="text-white/35">make it yours</span>
                  {(["music", "motion"] as const).map((k) => (
                    <button
                      key={k}
                      role="switch"
                      aria-checked={flags[k]}
                      disabled={phase !== "ready"}
                      onClick={() => setFlags((f) => ({ ...f, [k]: !f[k] }))}
                      style={{ fontFamily: "inherit" }}
                      className={`rounded-md border px-2.5 py-1 transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[rgb(var(--a))] ${
                        flags[k]
                          ? "border-[rgb(var(--a)/0.40)] bg-[rgb(var(--a)/0.10)] text-[rgb(var(--a))]"
                          : "border-white/10 text-white/35 line-through"
                      }`}
                    >
                      --{k}
                    </button>
                  ))}

                  {/* accent color */}
                  <div
                    role="radiogroup"
                    aria-label="Accent color"
                    className="flex items-center gap-2 sm:ml-auto"
                  >
                    {COLORS.map((c, i) => (
                      <button
                        key={c.name}
                        role="radio"
                        aria-checked={ci === i}
                        aria-label={c.name}
                        disabled={phase !== "ready"}
                        onClick={() => setCi(i)}
                        style={{ backgroundColor: `rgb(${c.rgb})`, color: `rgb(${c.rgb})` }}
                        className={`size-5 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                          ci === i
                            ? "scale-110 shadow-[0_0_0_2px_#0a0c0b,0_0_0_4px_currentColor]"
                            : "opacity-60 hover:opacity-100"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* command line */}
                <button
                  onClick={() => phase === "boot" ? (skipRef.current = true) : launch()}
                  disabled={phase === "launching"}
                  className="group relative mt-4 flex w-full items-center gap-3 overflow-hidden rounded-lg border border-[rgb(var(--a)/0.35)] bg-[rgb(var(--a)/0.04)] px-4 py-3.5 text-left text-[13px] text-[rgb(var(--a))] transition-colors hover:border-[rgb(var(--a)/0.70)] hover:bg-[rgb(var(--a)/0.08)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[rgb(var(--a))] disabled:cursor-default"
                >
                  <span className="opacity-60">&gt;</span>
                  <span className="min-w-0 truncate">run portfolio.sh{flagString ? ` ${flagString}` : ""}</span>
                  <kbd className="ml-auto shrink-0 rounded border border-[rgb(var(--a)/0.30)] px-1.5 py-0.5 text-[11px] text-[rgb(var(--a)/0.80)]">enter</kbd>
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 origin-left bg-[rgb(var(--a)/0.20)]"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: phase === "launching" ? 1 : 0 }}
                    transition={{ duration: reduce ? 0 : 0.6, ease: [0.65, 0, 0.35, 1] }}
                  />
                </button>
                <p className="mt-3 text-center text-[11px] text-white/35">
                  {phase === "launching"
                    ? "Compiling…"
                    : flags.music && flags.motion
                      ? "Best with headphones. Press Enter to begin."
                      : flags.music
                        ? "Sound on. Press Enter to begin."
                        : flags.motion
                          ? "Animations on, sound off. Press Enter to begin."
                          : "Quiet mode. Press Enter to begin."}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
