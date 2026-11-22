"use client";

import { useEffect, useRef } from "react";

const layers = [
  { y: 0.62, amp: 60, len: 900, speed: 0.12, color: "rgba(90,0,8,0.55)", phase: 0 },
  { y: 0.68, amp: 50, len: 700, speed: 0.18, color: "rgba(140,8,20,0.5)", phase: 1.4 },
  { y: 0.74, amp: 42, len: 560, speed: 0.25, color: "rgba(193,18,31,0.45)", phase: 2.8 },
  { y: 0.81, amp: 34, len: 440, speed: 0.33, color: "rgba(230,30,45,0.4)", phase: 4.1 },
  { y: 0.88, amp: 26, len: 340, speed: 0.42, color: "rgba(255,45,61,0.35)", phase: 5.5 },
];

export function WaveFooterBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const context = canvas?.getContext("2d");
    if (!canvas || !parent || !context) return;

    let width = 0;
    let height = 0;
    let time = 0;
    let animationFrame = 0;
    let inView = false;
    let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const draw = () => {
      if (!width || !height) return;

      context.fillStyle = "#000000";
      context.fillRect(0, 0, width, height);

      const glow = context.createRadialGradient(width / 2, height * 1.05, 0, width / 2, height * 1.05, height * 0.9);
      glow.addColorStop(0, "rgba(193,18,31,0.35)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      const mobileLift = width < 640 ? Math.min(height * 0.16, 90) : 0;
      for (const layer of layers) {
        const base = height * layer.y - mobileLift;
        const waveY = (x: number) => {
          const k = (x / layer.len) * Math.PI * 2;
          return base
            + Math.sin(k + time * layer.speed + layer.phase) * layer.amp
            + Math.sin(k * 0.5 - time * layer.speed * 0.7 + layer.phase) * layer.amp * 0.45;
        };

        context.beginPath();
        context.moveTo(0, height);
        for (let x = 0; x <= width; x += 6) context.lineTo(x, waveY(x));
        context.lineTo(width, height);
        context.closePath();

        const fill = context.createLinearGradient(0, base - layer.amp, 0, height);
        fill.addColorStop(0, layer.color);
        fill.addColorStop(1, "rgba(0,0,0,0.9)");
        context.fillStyle = fill;
        context.fill();

        context.beginPath();
        for (let x = 0; x <= width; x += 6) {
          const y = waveY(x);
          if (x === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.strokeStyle = "rgba(255,60,75,0.35)";
        context.lineWidth = 1.2;
        context.stroke();
      }
    };

    const stop = () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const animate = () => {
      animationFrame = 0;
      if (!inView || reducedMotion) return;
      time += 0.048;
      draw();
      animationFrame = window.requestAnimationFrame(animate);
    };

    const updateAnimation = () => {
      if (inView && !reducedMotion && !animationFrame) {
        animationFrame = window.requestAnimationFrame(animate);
      } else if (!inView || reducedMotion) {
        stop();
        draw();
      }
    };

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    });
    resizeObserver.observe(parent);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = Boolean(entry?.isIntersecting);
      updateAnimation();
    });
    intersectionObserver.observe(parent);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      updateAnimation();
    };
    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 z-0 h-full w-full pointer-events-none" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 35%, rgba(0,0,0,.75) 100%)" }}
        aria-hidden="true"
      />
    </>
  );
}
