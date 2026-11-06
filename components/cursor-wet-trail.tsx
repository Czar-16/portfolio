"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/components/use-reduced-motion";

type Drop = { x: number; y: number; born: number; size: number };
const TRACE_LIFETIME = 2400;
const TRAIL_FADE_OUT = 360;

export function CursorWetTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || reduced) return;
    const ctx = context;
    let armed = false;
    let active = false;
    let frame = 0;
    let drops: Drop[] = [];
    let previous: { x: number; y: number } | null = null;
    let lastMove = 0;
    let sessionStarted = 0;
    let sessionEnded = 0;
    const resize = () => {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = innerWidth * ratio;
      canvas.height = innerHeight * ratio;
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const arm = () => {
      armed = true;
      active = false;
      previous = null;
      lastMove = 0;
      sessionStarted = 0;
      sessionEnded = 0;
      drops = [];
      ctx.clearRect(0, 0, innerWidth, innerHeight);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (armed) { armed = false; active = true; sessionStarted = performance.now(); }
      if (active && performance.now() - sessionStarted >= TRACE_LIFETIME) {
        active = false;
        previous = null;
        sessionEnded = sessionStarted + TRACE_LIFETIME;
        if (!frame) frame = requestAnimationFrame(paint);
      }
      if (!active) return;
      if (!previous) {
        previous = { x: e.clientX, y: e.clientY };
        lastMove = performance.now();
        drops.push({ x: e.clientX, y: e.clientY, born: lastMove, size: 1.6 });
        if (!frame) frame = requestAnimationFrame(paint);
        return;
      }
      const from = previous;
      const distance = Math.hypot(e.clientX - from.x, e.clientY - from.y);
      if (distance < 1.5) return;
      lastMove = performance.now();
      const count = Math.min(5, Math.max(1, Math.ceil(distance / 9)));
      for (let i = 1; i <= count; i++) {
        const t = i / count;
        drops.push({ x: from.x + (e.clientX - from.x) * t, y: from.y + (e.clientY - from.y) * t, born: performance.now(), size: 1.1 + Math.random() * 1.1 });
      }
      if (drops.length > 700) drops.splice(0, drops.length - 700);
      previous = { x: e.clientX, y: e.clientY };
      if (!frame) frame = requestAnimationFrame(paint);
    };
    function paint(now: number) {
      frame = 0;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      if (active && sessionStarted && now - sessionStarted >= TRACE_LIFETIME) {
        active = false;
        previous = null;
        sessionEnded = sessionStarted + TRACE_LIFETIME;
      }
      // Each mark ages independently, so continuous dragging cannot keep old traces alive.
      drops = drops.filter(d => now - d.born < TRACE_LIFETIME);
      const sessionFade = sessionEnded ? Math.max(0, 1 - (now - sessionEnded) / TRAIL_FADE_OUT) : 1;
      for (const d of drops) {
        const age = (now - d.born) / TRACE_LIFETIME;
        const fade = (age < .68 ? 1 : (1 - age) / .32) * sessionFade;
        ctx.beginPath(); ctx.ellipse(d.x, d.y + age * 1.5, d.size * (1 + age * .35), d.size * .55, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 205, 220, ${fade * .22})`; ctx.fill();
        ctx.strokeStyle = `rgba(235, 250, 255, ${fade * .3})`; ctx.lineWidth = .6; ctx.stroke();
      }
      if (sessionFade === 0) {
        drops = [];
        sessionStarted = 0;
        sessionEnded = 0;
        lastMove = 0;
      }
      if (drops.length || sessionEnded) frame = requestAnimationFrame(paint);
    }
    resize();
    window.addEventListener("visitor-eye-tear", arm);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("visitor-eye-tear", arm);
      window.removeEventListener("pointermove", move); window.removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 80, pointerEvents: "none" }} />;
}
