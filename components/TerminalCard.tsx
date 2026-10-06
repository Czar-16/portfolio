"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { projects } from "@/data/projects";
import { contact, resume, site, socials } from "@/data/site";
import { useReducedMotion } from "@/components/use-reduced-motion";
import styles from "./TerminalCard.module.css";

type IntroLine = { kind: "command" | "output" | "prompt"; text: string };

// Display-only: intro commands never execute or open links.
const INTRO_LINES: readonly IntroLine[] = [
  { kind: "command", text: "whoami" },
  { kind: "output", text: `${site.name} — full-stack AI developer` },
  { kind: "command", text: "cat location.txt" },
  { kind: "output", text: "Delhi-NCR · open to remote" },
  { kind: "command", text: "cat philosophy.txt" },
  { kind: "output", text: "black coffee. code. repeat" },
  { kind: "command", text: "npm run ship" },
  { kind: "output", text: "✓ compiled successfully in 0.4s" },
  { kind: "output", text: "✓ 0 excuses found" },
  { kind: "command", text: "sudo hire anoop" },
  { kind: "output", text: "[sudo] permission granted ✓" },
  { kind: "output", text: "→ opening resume.pdf ..." },
  { kind: "prompt", text: "" },
];

const COMMANDS = [
  { name: "help", description: "List available commands" },
  { name: "whoami", description: "Meet the developer" },
  { name: "projects", description: "Explore projects and their links" },
  { name: "resume", description: "Open my resume" },
  { name: "contact", description: "Find my socials and email" },
  { name: "clear", description: "Clear terminal output" },
  { name: "sudo hire anoop", description: "Permission to start a conversation" },
] as const;

type TerminalLine = {
  id: number;
  kind: "command" | "output";
  text: string;
  links?: readonly { label: string; href: string }[];
};

type ResumeRequest = {
  id: number;
  finalMessage?: string;
} & (
  | { stage: "permission"; openingId: number }
  | { stage: "opening" }
);

function Prompt() {
  return <span aria-hidden="true" className="shrink-0 whitespace-nowrap"><span className="text-success">➜</span>{" "}<span className="text-accent">~</span>{" "}</span>;
}

export function TerminalCard() {
  const reduceMotion = useReducedMotion();
  const hintId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollFrame = useRef<number | null>(null);
  const skipScrollApplied = useRef(false);
  const focusRequested = useRef(false);
  const lineId = useRef(0);
  const draft = useRef("");
  const [inView, setInView] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [progress, setProgress] = useState({ index: 0, length: 0 });
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [showIntro, setShowIntro] = useState(true);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [pendingResume, setPendingResume] = useState<ResumeRequest | null>(null);
  const finished = skipped || reduceMotion || progress.index >= INTRO_LINES.length;
  const current = !finished ? INTRO_LINES[progress.index] : undefined;
  const cursorIndex = finished ? -1 : INTRO_LINES.reduce((last, line, index) =>
    index <= progress.index && line.kind !== "output" ? index : last, -1);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => { if (media.matches) setSkipped(true); };
    media.addEventListener("change", onMotionChange);
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setInView(true);
        if (media.matches) setSkipped(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    observer.observe(card);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", onMotionChange);
    };
  }, []);

  useEffect(() => {
    if (!inView || finished) return;
    const timer = window.setTimeout(() => setIntroReady(true), 400);
    return () => window.clearTimeout(timer);
  }, [inView, finished]);

  useEffect(() => {
    if (!introReady || finished || !current) return;
    const typing = current.kind === "command" && progress.length < current.text.length;
    const timer = window.setTimeout(() => {
      setProgress(typing
        ? { index: progress.index, length: progress.length + 1 }
        : { index: progress.index + 1, length: 0 });
    }, typing ? 80 + Math.random() * 20 : current.kind === "output" ? 300 : 240);
    return () => window.clearTimeout(timer);
  }, [introReady, finished, current, progress]);

  useEffect(() => {
    if (!inView || finished) return;
    const skip = () => setSkipped(true);
    document.addEventListener("keydown", skip);
    return () => document.removeEventListener("keydown", skip);
  }, [inView, finished]);

  useLayoutEffect(() => {
    const scroll = scrollRef.current;
    if (scroll) {
      const justSkipped = skipped && !skipScrollApplied.current;
      skipScrollApplied.current = skipped;
      if (reduceMotion || justSkipped) {
        if (scrollFrame.current !== null) window.cancelAnimationFrame(scrollFrame.current);
        scrollFrame.current = null;
        scroll.scrollTop = scroll.scrollHeight;
      } else if (scrollFrame.current === null && scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop > 0.5) {
        let previousTime = performance.now();
        let scrollPosition = scroll.scrollTop;
        const followOutput = (time: number) => {
          const target = Math.max(0, scroll.scrollHeight - scroll.clientHeight);
          const distance = target - scrollPosition;
          if (Math.abs(distance) <= 0.5) {
            scroll.scrollTop = target;
            scrollFrame.current = null;
            return;
          }
          const elapsed = Math.min(64, time - previousTime);
          previousTime = time;
          const step = distance * (1 - Math.exp(-elapsed / 55));
          scrollPosition += Math.sign(step) * Math.min(Math.abs(step), elapsed * 2);
          scroll.scrollTop = scrollPosition;
          scrollFrame.current = window.requestAnimationFrame(followOutput);
        };
        scrollFrame.current = window.requestAnimationFrame(followOutput);
      }
    }
    if (finished && focusRequested.current) {
      inputRef.current?.focus({ preventScroll: true });
      focusRequested.current = false;
    }
  }, [progress, lines, finished, showIntro, reduceMotion, skipped]);

  useEffect(() => () => {
    if (scrollFrame.current !== null) window.cancelAnimationFrame(scrollFrame.current);
  }, []);

  useEffect(() => {
    if (!pendingResume) return;
    let timer: number | undefined;
    // Each stage starts after its preceding output commits and fades in.
    const frame = window.requestAnimationFrame(() => {
      timer = window.setTimeout(() => {
        if (pendingResume.stage === "permission") {
          setLines((previous) => [...previous, {
            id: pendingResume.openingId,
            kind: "output",
            text: "→ opening resume.pdf ...",
          }]);
          setPendingResume({
            id: pendingResume.id,
            finalMessage: pendingResume.finalMessage,
            stage: "opening",
          });
          return;
        }
        window.open(resume.href, "_blank", "noopener,noreferrer");
        const finalMessage = pendingResume.finalMessage;
        if (finalMessage) {
          setLines((previous) => [...previous, {
            id: pendingResume.id,
            kind: "output",
            text: finalMessage,
          }]);
        }
        setPendingResume(null);
      }, pendingResume.stage === "permission" ? 450 : 600);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [pendingResume]);

  function focusTerminal(target: EventTarget | null) {
    // Let links, the skip button, and selected text keep their normal behavior.
    if (target instanceof Element && target.closest("a, button")) return;
    if (window.getSelection()?.toString()) return;
    if (finished) inputRef.current?.focus({ preventScroll: true });
    else {
      focusRequested.current = true;
      setSkipped(true);
    }
  }

  function clear() {
    setLines([]);
    setShowIntro(false);
    setPendingResume(null);
  }

  function queueResume(stage: ResumeRequest["stage"] = "opening", finalMessage?: string) {
    const request = { id: lineId.current++, finalMessage };
    setPendingResume(stage === "permission"
      ? { ...request, stage, openingId: lineId.current++ }
      : { ...request, stage });
  }

  function runCommand() {
    const command = value.trim();
    const normalized = command.toLowerCase();
    const nextLines: TerminalLine[] = [{ id: lineId.current++, kind: "command", text: command }];
    const print = (text: string, links?: TerminalLine["links"]) => {
      nextLines.push({ id: lineId.current++, kind: "output", text, links });
    };
    setValue("");
    draft.current = "";
    if (command) {
      setHistory([...history, command]);
      setHistoryIndex(history.length + 1);
    } else setHistoryIndex(history.length);

    switch (normalized) {
      case "": break;
      case "clear": clear(); return;
      case "help":
        COMMANDS.forEach(({ name, description }) => print(`${name} — ${description}`));
        break;
      case "whoami": print(`${site.name} — full-stack AI developer`); break;
      case "projects":
        projects.forEach((project) => print(`${project.name} — ${project.tagline}`, project.links));
        break;
      case "resume": print("→ opening resume ..."); queueResume(); break;
      case "contact":
        print("GitHub", [{ label: socials.github, href: socials.github }]);
        print("X", [{ label: socials.x, href: socials.x }]);
        print("LinkedIn", [{ label: socials.linkedin, href: socials.linkedin }]);
        print("Email", [{ label: contact.email, href: contact.mailto }]);
        break;
      case "sudo hire anoop":
        print("[sudo] permission granted ✓");
        queueResume("permission", "✓ offer letter pending... just kidding. Let's talk.");
        break;
      default: print(`command not found: ${command} — try 'help'`);
    }
    setLines((previous) => [...previous, ...nextLines]);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) {
      if (event.key === "Enter") event.preventDefault();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      runCommand();
    } else if (event.ctrlKey && event.key.toLowerCase() === "l") {
      event.preventDefault();
      clear();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!history.length) return;
      if (historyIndex === history.length) draft.current = value;
      const index = Math.max(0, historyIndex - 1);
      setHistoryIndex(index);
      setValue(history[index]);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!history.length || historyIndex === history.length) return;
      const index = Math.min(history.length, historyIndex + 1);
      setHistoryIndex(index);
      setValue(index === history.length ? draft.current : history[index]);
    } else if (event.key === "Tab" && !event.shiftKey && value.trim()) {
      const match = COMMANDS.find(({ name }) => name.startsWith(value.trim().toLowerCase()) && name !== value.trim().toLowerCase());
      if (match) {
        event.preventDefault();
        setValue(match.name);
      }
    }
  }

  return (
    <div
      ref={cardRef}
      className={`card-lift-host ${styles.entrance}`}
      data-visible={inView || reduceMotion}
    >
      <div
        role="region"
        aria-label="Interactive terminal"
        className={`card-lift ${styles.card} flex h-[280px] w-full min-w-0 flex-col overflow-hidden rounded-xl border border-white/12 bg-black/50 font-mono text-[12px] leading-[1.65] text-white/65 backdrop-blur-md sm:h-[300px] sm:text-[13px] lg:text-[14px]`}
        onClick={(event) => focusTerminal(event.target)}
      >
        <p className="sr-only">Terminal introduction: {INTRO_LINES.map((line) => line.kind === "command" ? `$ ${line.text}` : line.text).join(". ")}. Type help for commands. Use arrow keys for command history, Tab to complete a partial command, and Control L to clear.</p>
        <div className="relative flex h-10 shrink-0 items-center justify-between border-b border-white/10 px-3.5">
          <div aria-hidden="true" className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/75" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/75" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/75" />
          </div>
          <span className="pointer-events-none absolute inset-x-16 text-center text-[11px] text-white/50">czar16 — zsh</span>
          {!finished ? (
            <button type="button" onClick={() => setSkipped(true)} className="rounded px-1.5 py-0.5 text-[10px] text-white/50 transition-colors hover:text-white focus-visible:text-white" aria-label="Skip terminal introduction">skip</button>
          ) : <span aria-hidden="true" className="text-[10px] text-white/35">⌨</span>}
        </div>

        <div ref={scrollRef} data-lenis-prevent className={`${styles.scroll} min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3.5 py-3 sm:px-4`}>
          {showIntro && (
            <div aria-hidden="true" className={styles.intro} data-instant={skipped || reduceMotion}>
              {INTRO_LINES.map((line, index) => {
                const complete = finished || index < progress.index;
                const active = !finished && index === progress.index && line.kind !== "output";
                if ((!complete && !active) || (finished && line.kind === "prompt")) return null;
                return (
                  <div
                    key={`intro-${index}`}
                    data-intro-line={index}
                    data-intro-kind={line.kind}
                    className={`${line.kind === "output" ? styles.line : ""} whitespace-pre-wrap break-words ${line.kind !== "output" ? "text-white" : `pl-4 ${line.text.includes("✓") ? "text-success" : ""}`}`}
                  >
                    {line.kind !== "output" && <span className="text-success">${" "}</span>}
                    <span data-intro-text>{complete ? line.text : line.text.slice(0, progress.length)}</span>
                    {line.kind !== "output" && <span className={styles.cursor} data-active={index === cursorIndex} />}
                  </div>
                );
              })}
            </div>
          )}

          <div aria-live="polite" aria-relevant="additions" aria-atomic="false">
            {lines.map((line) => (
              <div key={line.id} className={`${line.kind === "output" ? styles.line : ""} whitespace-pre-wrap [overflow-wrap:anywhere] ${line.kind === "command" ? "flex gap-1 text-white" : line.text.includes("✓") ? "pl-4 text-success" : "pl-4"}`}>
                {line.kind === "command" && <Prompt />}
                <span>{line.text}
                  {line.links && <span className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1">{line.links.map((link) => (
                    <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent">{link.label}</a>
                  ))}</span>}
                </span>
              </div>
            ))}
          </div>

          <form className={`mt-1 flex min-w-0 items-center gap-1 ${!finished ? "hidden" : ""}`} onSubmit={(event) => { event.preventDefault(); runCommand(); }}>
            <Prompt />
            <div className="min-w-0 flex-1">
              <input
                ref={inputRef}
                aria-label="Terminal command"
                aria-describedby={hintId}
                placeholder="Type a command..."
                disabled={!finished}
                value={value}
                onChange={(event) => { setValue(event.target.value); setHistoryIndex(history.length); }}
                onKeyDown={handleKeyDown}
                className={`${styles.input} w-full min-w-0 bg-transparent font-mono text-[16px] leading-[1.65] text-white placeholder:text-white/40 sm:text-[13px] lg:text-[14px]`}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint="send"
              />
            </div>
          </form>
        </div>
        <div className="flex h-10 shrink-0 items-center border-t border-white/10 px-3.5 sm:px-4">
          <p id={hintId} className="text-[11px] leading-relaxed text-white/50">
            {finished ? <>Type <code className="text-accent">help</code> to explore. Press Enter.</> : "Click or press any key to skip."}
          </p>
        </div>
      </div>
    </div>
  );
}
