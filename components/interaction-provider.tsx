"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { ClickSound } from "@/lib/click-sound";
import { ThemeSound } from "@/lib/theme-sound";

const STORAGE_KEY = "czar-sound";
const CHANGE_EVENT = "czar-sound-change";
let fallbackEnabled = true;
let storageUnavailable = false;

function getEnabled() {
  if (storageUnavailable) return fallbackEnabled;
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return fallbackEnabled;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

const InteractionContext = createContext<{
  enabled: boolean;
  toggle: () => void;
  playClick: () => void;
  playTheme: (theme: "light" | "dark") => void;
  playCrack: () => void;
}>({ enabled: true, toggle: () => {}, playClick: () => {}, playTheme: () => {}, playCrack: () => {} });
export const useInteraction = () => useContext(InteractionContext);

type Burst = { x: number; y: number; start: number };

function InteractionEffects({ playClick }: { playClick: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let bursts: Burst[] = [];
    let frame = 0;
    let pointer: { id: number; x: number; y: number; moved: boolean } | undefined;

    function clear() {
      bursts = [];
      cancelAnimationFrame(frame);
      frame = 0;
      ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight);
      canvas!.dataset.active = "false";
    }

    function resize() {
      clear();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(window.innerWidth * ratio);
      canvas!.height = Math.round(window.innerHeight * ratio);
      ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function draw(now: number) {
      ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);
      bursts = bursts.filter(burst => now - burst.start < 400);
      ctx!.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      ctx!.lineWidth = 2;
      for (const burst of bursts) {
        const progress = Math.min((now - burst.start) / 400, 1);
        const eased = progress * (2 - progress);
        const radius = eased * 15;
        const length = 10 * (1 - eased);
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 * i) / 8;
          ctx!.beginPath();
          ctx!.moveTo(burst.x + radius * Math.cos(angle), burst.y + radius * Math.sin(angle));
          ctx!.lineTo(burst.x + (radius + length) * Math.cos(angle), burst.y + (radius + length) * Math.sin(angle));
          ctx!.stroke();
        }
      }
      frame = bursts.length ? requestAnimationFrame(draw) : 0;
      canvas!.dataset.active = String(bursts.length > 0);
    }

    function down(event: PointerEvent) {
      pointer = event.isPrimary && event.button === 0
        ? { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false }
        : undefined;
    }
    function move(event: PointerEvent) {
      if (pointer?.id === event.pointerId && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 10) pointer.moved = true;
    }
    function cancel() { pointer = undefined; }
    function click(event: MouseEvent) {
      const valid = pointer && !pointer.moved;
      pointer = undefined;
      if (event.button !== 0 || (event.detail > 0 && !valid)) return;
      if (event.target instanceof Element) {
        const target = event.target;
        const excluded = target.closest('[data-click-sound="off"], [inert], [aria-disabled="true"], :disabled, input, textarea, select, [contenteditable]:not([contenteditable="false"])');
        if (!excluded && target.closest('button, a[href], summary, [role="button"], [role="link"], [role="option"], [data-click-sound="on"]')) playClick();
      }
      if (!ctx || !valid || event.detail === 0 || reduced.matches || document.hidden || document.documentElement.matches("[data-terminal-intro], [data-swarm-active], [data-motion=off]") || (event.target instanceof Element && event.target.closest('[data-click-sparks="off"]'))) return;
      bursts.push({ x: event.clientX, y: event.clientY, start: performance.now() });
      bursts = bursts.slice(-24);
      canvas!.dataset.active = "true";
      if (!frame) frame = requestAnimationFrame(draw);
    }
    function visibility() { if (document.hidden) { cancel(); clear(); } }

    const effectsObserver = new MutationObserver(clear);
    effectsObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-terminal-intro", "data-swarm-active", "data-motion"] });
    resize();
    document.addEventListener("pointerdown", down, true);
    document.addEventListener("pointermove", move, { capture: true, passive: true });
    document.addEventListener("pointercancel", cancel, true);
    document.addEventListener("scroll", cancel, { capture: true, passive: true });
    document.addEventListener("click", click, true);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("resize", resize);
    reduced.addEventListener("change", clear);
    return () => {
      clear();
      effectsObserver.disconnect();
      document.removeEventListener("pointerdown", down, true);
      document.removeEventListener("pointermove", move, true);
      document.removeEventListener("pointercancel", cancel, true);
      document.removeEventListener("scroll", cancel, true);
      document.removeEventListener("click", click, true);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("resize", resize);
      reduced.removeEventListener("change", clear);
    };
  }, [playClick]);

  return <canvas ref={canvasRef} data-click-sparks data-active="false" aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100] h-full w-full" />;
}

export function InteractionProvider({ children }: { children: React.ReactNode }) {
  const enabled = useSyncExternalStore(subscribe, getEnabled, () => true);
  const audio = useRef<ClickSound | null>(null);
  const themeAudio = useRef<ThemeSound | null>(null);
  const playCrack = useCallback(() => {
    if (!getEnabled() || document.hidden) return;
    try {
      if (typeof AudioContext === "undefined") return;
      const context = new AudioContext();
      if (context.state === "suspended") void context.resume();
      const now = context.currentTime;
      const compressor = context.createDynamicsCompressor();
      const master = context.createGain();
      compressor.threshold.value = -15;
      compressor.knee.value = 16;
      compressor.ratio.value = 5;
      compressor.attack.value = 0.002;
      compressor.release.value = 0.22;
      master.gain.value = 1.15;
      compressor.connect(master).connect(context.destination);

      // A forceful, noisy impact gives the crack its initial glass-break transient.
      const length = Math.ceil(context.sampleRate * 0.42);
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        const t = i / context.sampleRate;
        samples[i] = (Math.random() * 2 - 1) * Math.exp(-t * 19) * (0.72 + 0.28 * Math.sin(t * 2100));
      }
      const impact = context.createBufferSource();
      const lowGlass = context.createBiquadFilter();
      const impactGain = context.createGain();
      impact.buffer = buffer;
      lowGlass.type = "highpass";
      lowGlass.frequency.value = 420;
      impactGain.gain.setValueAtTime(0.9, now);
      impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      impact.connect(lowGlass).connect(impactGain).connect(compressor);
      impact.start(now);

      // Staggered inharmonic partials make the impact ring like fractured glass.
      for (let i = 0; i < 13; i++) {
        const start = now + Math.random() * 0.09;
        const oscillator = context.createOscillator();
        const shardGain = context.createGain();
        oscillator.type = i % 3 === 0 ? "triangle" : "sine";
        oscillator.frequency.setValueAtTime(950 + Math.random() * 5200, start);
        oscillator.detune.value = (Math.random() - 0.5) * 38;
        const peak = 0.22 + Math.random() * 0.38;
        shardGain.gain.setValueAtTime(0.0001, start);
        shardGain.gain.linearRampToValueAtTime(peak, start + 0.003);
        shardGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16 + Math.random() * 0.62);
        oscillator.connect(shardGain).connect(compressor);
        oscillator.start(start);
        oscillator.stop(start + 0.85);
      }
      window.setTimeout(() => { void context.close().catch(() => {}); }, 1100);
    } catch {
      // Sound support must never interrupt the eye interaction.
    }
  }, []);
  const playClick = useCallback(() => {
    if (!getEnabled() || document.hidden) return;
    audio.current ??= new ClickSound();
    audio.current.enable();
    void audio.current.play();
  }, []);

  const playTheme = useCallback((theme: "light" | "dark") => {
    if (!getEnabled() || document.hidden) return;
    themeAudio.current ??= new ThemeSound();
    void themeAudio.current.play(theme);
  }, []);

  const toggle = useCallback(() => {
    const next = !getEnabled();
    fallbackEnabled = next;
    try { localStorage.setItem(STORAGE_KEY, next ? "on" : "off"); } catch { storageUnavailable = true; }
    window.dispatchEvent(new Event(CHANGE_EVENT));
    if (next) playClick();
    else {
      audio.current?.stop();
      themeAudio.current?.stop();
    }
  }, [playClick]);

  useEffect(() => {
    return () => {
      audio.current?.dispose();
      audio.current = null;
      themeAudio.current?.dispose();
      themeAudio.current = null;
    };
  }, []);

  const value = useMemo(() => ({ enabled, toggle, playClick, playTheme, playCrack }), [enabled, toggle, playClick, playTheme, playCrack]);
  return <InteractionContext.Provider value={value}>{children}<InteractionEffects playClick={playClick} /></InteractionContext.Provider>;
}

export function SoundToggle() {
  const { enabled, toggle } = useInteraction();
  const label = enabled ? "Mute click sounds" : "Enable click sounds";
  return (
    <button type="button" onClick={toggle} data-click-sound="off" aria-label={label} title={label} aria-pressed={enabled} className="rounded-full p-1.5 bg-[color-mix(in_oklab,var(--card-elevated)_6%,transparent)] border border-[color-mix(in_oklab,var(--line)_18%,transparent)] text-fg-secondary hover:text-fg hover:border-[color-mix(in_oklab,var(--line)_70%,transparent)] hover:bg-[color-mix(in_oklab,var(--card-elevated)_8%,transparent)] focus-visible:outline-2 focus-visible:outline-[color-mix(in_oklab,var(--accent)_50%,transparent)] focus-visible:outline-offset-2">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H3v6h3l5 4V5Z" />
        {enabled ? <><path d="M15 8a6 6 0 0 1 0 8" /><path d="M18 5a10 10 0 0 1 0 14" /></> : <path d="m16 9 5 6m0-6-5 6" />}
      </svg>
    </button>
  );
}
