"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { ClickSound } from "@/lib/click-sound";

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

const InteractionContext = createContext({ enabled: true, toggle: () => {}, playClick: () => {} });
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
      ctx!.strokeStyle = document.documentElement.dataset.theme === "light" ? "#171717" : "#ffffff";
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
      if (!ctx || !valid || event.detail === 0 || reduced.matches || document.hidden) return;
      bursts.push({ x: event.clientX, y: event.clientY, start: performance.now() });
      bursts = bursts.slice(-24);
      canvas!.dataset.active = "true";
      if (!frame) frame = requestAnimationFrame(draw);
    }
    function visibility() { if (document.hidden) { cancel(); clear(); } }

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
  const playClick = useCallback(() => {
    if (!getEnabled() || document.hidden) return;
    audio.current ??= new ClickSound();
    audio.current.enable();
    void audio.current.play();
  }, []);

  const toggle = useCallback(() => {
    const next = !getEnabled();
    fallbackEnabled = next;
    try { localStorage.setItem(STORAGE_KEY, next ? "on" : "off"); } catch { storageUnavailable = true; }
    window.dispatchEvent(new Event(CHANGE_EVENT));
    if (next) playClick();
    else audio.current?.stop();
  }, [playClick]);

  useEffect(() => {
    return () => {
      audio.current?.dispose();
      audio.current = null;
    };
  }, []);

  const value = useMemo(() => ({ enabled, toggle, playClick }), [enabled, toggle, playClick]);
  return <InteractionContext.Provider value={value}>{children}<InteractionEffects playClick={playClick} /></InteractionContext.Provider>;
}

export function SoundToggle() {
  const { enabled, toggle } = useInteraction();
  const label = enabled ? "Mute click sounds" : "Enable click sounds";
  return (
    <button type="button" onClick={toggle} data-click-sound="off" aria-label={label} title={label} aria-pressed={enabled} className="icon-btn">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H3v6h3l5 4V5Z" />
        {enabled ? <><path d="M15 8a6 6 0 0 1 0 8" /><path d="M18 5a10 10 0 0 1 0 14" /></> : <path d="m16 9 5 6m0-6-5 6" />}
      </svg>
    </button>
  );
}
