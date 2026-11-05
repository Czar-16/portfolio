"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useDocumentVisible } from "@/components/use-document-visible";
import { useReducedMotion } from "@/components/use-reduced-motion";
import { useEffectsPaused } from "./use-effects-paused";
import styles from "./ambient-background.module.css";

type Background = "aurora" | "particles" | "constellation" | "bokeh" | "spotlight";

function normalizeBackground(value: string | null | undefined): Background {
  return value === "aurora" || value === "constellation" || value === "bokeh" || value === "spotlight" ? value : "particles";
}

function subscribe(notify: () => void) {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-background"] });
  const sync = (event: StorageEvent) => {
    if (event.key === "czar-background" || event.key === null) {
      document.documentElement.dataset.background = normalizeBackground(event.newValue);
    }
  };
  window.addEventListener("storage", sync);
  return () => { observer.disconnect(); window.removeEventListener("storage", sync); };
}

function useBackground() {
  return useSyncExternalStore<Background>(subscribe, () => normalizeBackground(document.documentElement.dataset.background), () => "particles");
}

export function BackgroundToggle() {
  const background = useBackground();
  const next = { aurora: "particles", particles: "constellation", constellation: "bokeh", bokeh: "spotlight", spotlight: "aurora" }[background];
  const label = `Switch to ${next} background`;
  return <button type="button" className="icon-btn" aria-label={label} title={label} onClick={() => {
    document.documentElement.dataset.background = next;
    try { localStorage.setItem("czar-background", next); } catch { /* The selection still works for this visit. */ }
  }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      {next === "particles" ? <><path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6Z" /><circle cx="20" cy="19" r="1" /><circle cx="4" cy="4" r="1" /></> : next === "constellation" ? <><path d="m5 6 13 3-8 10L5 6Z" /><circle cx="5" cy="6" r="2" /><circle cx="18" cy="9" r="2" /><circle cx="10" cy="19" r="2" /></> : next === "bokeh" ? <><circle cx="8" cy="8" r="5" /><circle cx="16" cy="15" r="6" /><circle cx="5" cy="19" r="2" /></> : next === "spotlight" ? <><path d="m8 3 8 3-3 5-6-2 1-6ZM7 12 2 21m11-8 7 8M10 13l-1 8" /></> : <><path d="M3 8c4-7 7 7 11 0s6-3 7-2M3 14c4-7 7 7 11 0s6-3 7-2M3 20c4-7 7 7 11 0s6-3 7-2" /></>}
    </svg>
  </button>;
}

export function AmbientBackground() {
  const background = useBackground();
  const visible = useDocumentVisible();
  const reduced = useReducedMotion();
  const paused = useEffectsPaused();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (background !== "particles" && background !== "constellation") return;
    const canvas = canvasRef.current;
    let ctx: CanvasRenderingContext2D | null = null;
    try { ctx = canvas?.getContext("2d") ?? null; } catch { /* Keep the CSS fallback if canvas is unavailable. */ }
    if (!canvas || !ctx) return;
    let frame = 0;
    let width = 0;
    let height = 0;
    let elapsed = elapsedRef.current;
    const constellation = background === "constellation";
    let previous = 0;
    let color = "";
    let particles: { x: number; y: number; radius: number; speed: number; opacity: number }[] = [];

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.fillStyle = color;
      const points = particles.map(particle => ({
        ...particle,
        x: (particle.x * width + Math.sin(elapsed * .12 + particle.y * 10) * 12 + width) % width,
        y: (particle.y * height - elapsed * particle.speed % height + height) % height,
      }));
      if (constellation) {
        ctx!.strokeStyle = color;
        ctx!.lineWidth = .7;
        const connections = new Array(points.length).fill(0);
        for (let i = 0; i < points.length; i++) {
          for (let j = i + 1; j < points.length && connections[i] < 2; j++) {
            if (connections[j] >= 2) continue;
            const distance = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
            const reach = width < 640 ? 135 : 110;
            if (distance >= reach) continue;
            ctx!.globalAlpha = (1 - distance / reach) * (width < 640 ? .38 : .28);
            ctx!.beginPath();
            ctx!.moveTo(points[i].x, points[i].y);
            ctx!.lineTo(points[j].x, points[j].y);
            ctx!.stroke();
            connections[i]++;
            connections[j]++;
          }
        }
      }
      for (const point of points) {
        ctx!.globalAlpha = point.opacity;
        ctx!.beginPath();
        ctx!.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
    }

    function tick(time: number) {
      if (time - previous >= 1000 / 30) {
        elapsed += previous ? Math.min((time - previous) / 1000, .1) : 0;
        previous = time;
        draw();
      }
      frame = requestAnimationFrame(tick);
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, matchMedia("(pointer: fine)").matches ? 1.5 : 1);
      canvas!.width = Math.round(width * ratio);
      canvas!.height = Math.round(height * ratio);
      ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
      // A fixed seed scatters stars without forming a grid or jumping on redraw.
      let seed = 173;
      const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
        return (seed >>> 0) / 4294967296;
      };
      // Stable placement avoids hydration differences and random jumps on theme changes.
      particles = Array.from({ length: constellation ? (width < 640 ? 38 : 48) : (width < 640 ? 54 : 80) }, (_, i) => ({
        x: constellation ? random() : ((i * 73 + 19) % 997) / 997,
        y: constellation ? random() : ((i * 137 + 47) % 991) / 991,
        radius: (width < 640 ? .95 : .7) + (i % 4) * .35,
        speed: 2 + (i % 5) * .7,
        opacity: (width < 640 ? .3 : .18) + (i % 5) * .09,
      }));
      draw();
    }

    function themeChanged() {
      color = getComputedStyle(document.documentElement).getPropertyValue(constellation ? "--constellation-point" : "--ambient-particle").trim();
      draw();
    }
    themeChanged();
    resize();
    canvas.dataset.ready = "true";
    const observer = new MutationObserver(themeChanged);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-accent"] });
    window.addEventListener("resize", resize, { passive: true });
    if (visible && !reduced && !paused) frame = requestAnimationFrame(tick);
    return () => {
      elapsedRef.current = elapsed;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      delete canvas.dataset.ready;
    };
  }, [background, reduced, visible, paused]);

  return <div className={styles.background} aria-hidden="true" data-ambient-background data-paused={!visible || reduced || paused}>
    <div className={styles.aurora}><div /><div /><div /></div>
    <div className={styles.points} data-point-background><canvas ref={canvasRef} /></div>
    <div className={styles.bokeh} data-bokeh-background>{Array.from({ length: 6 }, (_, i) => <div key={i} />)}</div>
    <div className={styles.spotlight} data-spotlight-background><div /><div /></div>
  </div>;
}
