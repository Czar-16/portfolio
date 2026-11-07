"use client";

import { VisitorEye } from "@/components/visitor-eye";
import { useVisitorCount } from "@/components/visitor-provider";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import styles from "./visitor-counter.module.css";
import { useReducedMotion } from "@/components/use-reduced-motion";
import { useInteraction } from "@/components/interaction-provider";

type Splash = { id: number; x: number; y: number; fall: number };
type Crack = { id: number; x: number; y: number; level: number };
type Point = { x: number; y: number };

// Each polygon shares its vertices with its neighbors, so the glass starts intact.
function fracturePieces(origin: Point) {
  const rays = Array.from({ length: 11 }, (_, index) => {
    const angle = (-Math.PI * 0.94) + (index * Math.PI * 2) / 11;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const distance = Math.min(
      dx > 0 ? (100 - origin.x) / dx : dx < 0 ? -origin.x / dx : Infinity,
      dy > 0 ? (100 - origin.y) / dy : dy < 0 ? -origin.y / dy : Infinity,
    );
    const edge = { x: origin.x + dx * distance, y: origin.y + dy * distance };
    const fraction = [0.46, 0.57, 0.41, 0.53, 0.48, 0.6, 0.43, 0.55, 0.45, 0.58, 0.49][index];
    const middle = { x: origin.x + dx * distance * fraction, y: origin.y + dy * distance * fraction };
    return { edge, middle, dx, dy };
  });
  const perimeter = (point: Point) => {
    if (Math.abs(point.y) < .001) return point.x;
    if (Math.abs(point.x - 100) < .001) return 100 + point.y;
    if (Math.abs(point.y - 100) < .001) return 300 - point.x;
    return 400 - point.y;
  };
  const corners: Point[] = [{ x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }, { x: 0, y: 0 }];
  return rays.flatMap((ray, index) => {
    const next = rays[(index + 1) % rays.length];
    const start = perimeter(ray.edge);
    let end = perimeter(next.edge);
    if (end <= start) end += 400;
    const boundary: Point[] = [];
    for (let marker = Math.floor(start / 100) * 100 + 100; marker < end; marker += 100) {
      boundary.push(corners[(marker / 100 - 1) % 4]);
    }
    return [
      { points: [origin, ray.middle, next.middle], dx: ray.dx * 18, dy: 35 + index % 3 * 17, spin: (index % 2 ? 1 : -1) * (25 + index * 3), delay: index * 15 },
      { points: [ray.middle, ray.edge, ...boundary, next.edge, next.middle], dx: ray.dx * 38, dy: 58 + index % 4 * 19, spin: (index % 2 ? -1 : 1) * (35 + index * 4), delay: 70 + index * 20 },
    ];
  });
}

export function VisitorCounter() {
  const { status, count } = useVisitorCount();
  const cardRef = useRef<HTMLDivElement>(null);
  const [splash, setSplash] = useState<Splash | null>(null);
  const [crack, setCrack] = useState<Crack | null>(null);
  const [recovering, setRecovering] = useState(false);
  const splashId = useRef(0);
  const [glitchId, setGlitchId] = useState(0);
  const crackId = useRef(0);
  const hits = useRef(0);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recoveryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useReducedMotion();
  const { playCrack } = useInteraction();

  useEffect(() => {
    const activate = () => {
      if (!reduced) setGlitchId((current) => current + 1);
      const card = cardRef.current;
      const eye = card?.querySelector<SVGSVGElement>("[data-visitor-eye]");
      if (!card || !eye || hits.current === 5) return;
      if (resetTimer.current) clearTimeout(resetTimer.current);
      if (recoveryTimer.current) clearTimeout(recoveryTimer.current);
      setRecovering(false);
      hits.current = Math.min(hits.current + 1, 5);
      const level = hits.current;
      playCrack();
      const cardBounds = card.getBoundingClientRect();
      const lowerLid = eye.createSVGPoint();
      lowerLid.x = 32;
      lowerLid.y = 34.3;
      const lidPosition = lowerLid.matrixTransform(eye.getScreenCTM()!);
      const x = lidPosition.x - cardBounds.left;
      const y = lidPosition.y - cardBounds.top;
      setCrack({ id: ++crackId.current, x: (x / cardBounds.width) * 100, y: (y / cardBounds.height) * 100, level });
      setSplash({ id: ++splashId.current, x, y, fall: Math.max(0, cardBounds.height - y - 12) });
      resetTimer.current = setTimeout(() => {
        if (level === 5 && !reduced) {
          setRecovering(true);
          recoveryTimer.current = setTimeout(() => {
            hits.current = 0;
            setCrack(null);
            setRecovering(false);
            recoveryTimer.current = null;
          }, 620);
        } else {
          hits.current = 0;
          setCrack(null);
        }
        resetTimer.current = null;
      }, level === 5 ? 2100 : 6000);
    };
    window.addEventListener("visitor-eye-tear", activate);
    return () => {
      window.removeEventListener("visitor-eye-tear", activate);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      if (recoveryTimer.current) clearTimeout(recoveryTimer.current);
    };
  }, [reduced, playCrack]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-x", `${(-y * 9).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 9).toFixed(2)}deg`);
      card.style.setProperty("--lift-x", `${(x * 10).toFixed(2)}px`);
      card.style.setProperty("--lift-y", `${(-y * 10).toFixed(2)}px`);
    };
    const reset = () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--lift-x", "0px");
      card.style.setProperty("--lift-y", "0px");
    };
    card.addEventListener("pointermove", move, { passive: true });
    card.addEventListener("pointerleave", reset);
    return () => { card.removeEventListener("pointermove", move); card.removeEventListener("pointerleave", reset); };
  }, []);

  return (
    <section className="section-frame flex justify-center" aria-label="Portfolio visitors">
      <div ref={cardRef} className={styles.card} data-visitor-card data-shattered={crack?.level === 5} data-recovering={recovering} style={crack ? { "--impact-x": `${crack.x}%`, "--impact-y": `${crack.y}%` } as CSSProperties : undefined}>
        <VisitorEye />
        {!reduced && glitchId > 0 && (
          <div key={`glitch-${glitchId}`} className={styles.glitch} aria-hidden="true">
            <span className={`${styles.glitchLayer} ${styles.glitchRed}`} />
            <span className={`${styles.glitchLayer} ${styles.glitchBlue}`} />
            <span className={styles.glitchScanlines} />
          </div>
        )}
        {!reduced && crack && crack.level < 5 && (
          <svg
            key={`crack-${crack.id}`}
            className={styles.crack}
            data-level={crack.level}
            style={{ "--crack-x": `${crack.x}%`, "--crack-y": `${crack.y}%` } as CSSProperties}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <g transform={`translate(${crack.x} ${crack.y})`}>
              <path className={styles.crackShadow} d="M0 0 7 -6 12 -5 19 -14 25 -15 34 -26 42 -30 51 -42 59 -44 68 -53 78 -56 M7 -6 5 -16 9 -23 6 -34 12 -42 10 -53 M12 -5 16 2 22 3 27 12 34 15 40 27 49 30 55 42 65 45 72 55 83 58 M19 -14 25 -9 31 -10 39 -4 47 -7 56 1 67 2 76 10 88 12 M34 -26 38 -18 47 -17 53 -10 M16 2 13 12 17 20 13 30 18 38 M-2 2 -9 7 -15 6 -22 14 -31 16 -39 27 -49 28 -58 39 -68 40 -78 51 -88 53 M-9 7 -11 17 -17 22 -18 33 -27 39 -29 50 -39 57 M-15 6 -19 -1 -26 -3 -32 -12 -42 -14 -50 -24 -61 -26 -70 -37 -81 -39 M-22 14 -28 9 -35 10 -43 3 -53 5 -62 -4 -72 -5 -82 -15 M-49 28 -53 19 -62 18 -68 10 M-58 39 -55 48 -63 55 -65 64 M56 1 61 -8 72 -9 79 -18 90 -20 M55 42 61 34 71 33 78 24 89 22" />
              <path className={styles.crackHighlight} d="M0 0 7 -6 12 -5 19 -14 25 -15 34 -26 42 -30 51 -42 59 -44 68 -53 78 -56 M7 -6 5 -16 9 -23 6 -34 12 -42 10 -53 M12 -5 16 2 22 3 27 12 34 15 40 27 49 30 55 42 65 45 72 55 83 58 M19 -14 25 -9 31 -10 39 -4 47 -7 56 1 67 2 76 10 88 12 M34 -26 38 -18 47 -17 53 -10 M16 2 13 12 17 20 13 30 18 38 M-2 2 -9 7 -15 6 -22 14 -31 16 -39 27 -49 28 -58 39 -68 40 -78 51 -88 53 M-9 7 -11 17 -17 22 -18 33 -27 39 -29 50 -39 57 M-15 6 -19 -1 -26 -3 -32 -12 -42 -14 -50 -24 -61 -26 -70 -37 -81 -39 M-22 14 -28 9 -35 10 -43 3 -53 5 -62 -4 -72 -5 -82 -15 M-49 28 -53 19 -62 18 -68 10 M-58 39 -55 48 -63 55 -65 64 M56 1 61 -8 72 -9 79 -18 90 -20 M55 42 61 34 71 33 78 24 89 22" />
              <path className={styles.crackFine} d="M25 -15 28 -20 34 -22 39 -32 M27 12 32 8 39 9 44 18 M-26 -3 -30 1 -37 0 -43 -7 M-31 16 -34 22 -40 24 -46 34 M5 -16 1 -21 -2 -28 -8 -34 M68 -53 69 -63 77 -68 M72 55 70 66 78 72 M-72 -5 -75 4 -84 7 M-78 51 -83 59 -92 62 M76 10 84 5 92 6 M-61 -26 -63 -35 -71 -42" />
            </g>
          </svg>
        )}
        {crack?.level === 5 && (
          <div key={`shatter-${crack.id}`} className={styles.shatter} data-reduced={reduced} data-recovering={recovering} aria-hidden="true" style={{ "--impact-x": `${crack.x}%`, "--impact-y": `${crack.y}%` } as CSSProperties}>
            <svg className={styles.fractureGlass} viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id={`glass-${crack.id}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="var(--glass-light)" />
                  <stop offset="0.5" stopColor="var(--glass-mid)" />
                  <stop offset="1" stopColor="var(--glass-dark)" />
                </linearGradient>
              </defs>
              {fracturePieces({ x: crack.x, y: crack.y }).map((piece, index) => (
                <polygon
                  key={index}
                  className={styles.glassPiece}
                  points={piece.points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ")}
                  fill={`url(#glass-${crack.id})`}
                  style={{
                    "--dx": `${piece.dx}px`,
                    "--dy": `${piece.dy}px`,
                    "--spin": `${piece.spin}deg`,
                    "--delay": `${piece.delay}ms`,
                    "--duration": `${950 + index % 5 * 115}ms`,
                    "--facet": `${index % 4 * 8}deg`,
                  } as CSSProperties}
                />
              ))}
            </svg>
          </div>
        )}
        {recovering && <div className={styles.recovery} aria-hidden="true"><span /><span /><span /></div>}
        {splash && (
          <div key={`splash-${splash.id}`} className={styles.splashOverlay} aria-hidden="true" data-reduced={reduced}>
            <span
              className={styles.dropGroup}
              style={{
                "--drop-x": `${splash.x}px`,
                "--drop-y": `${splash.y}px`,
                "--fall": `${splash.fall}px`,
              } as CSSProperties}
            >
              <span className={styles.drop} />
              <span className={styles.splashRing} />
              {!reduced && <>
                <span className={`${styles.scatterDrop} ${styles.scatterLeft}`} />
                <span className={`${styles.scatterDrop} ${styles.scatterCenter}`} />
                <span className={`${styles.scatterDrop} ${styles.scatterRight}`} />
              </>}
            </span>
          </div>
        )}
        <p className={styles.text} aria-live="polite" aria-atomic="true" aria-busy={status === "loading"}>
          {status === "ready" ? (
            <><span className={styles.number}>{count!.toLocaleString("en-US")}</span> {count === 1 ? "curious mind has" : "curious minds have"} stopped by</>
          ) : status === "loading" ? (
            <><span className={styles.number}>—</span> visitors have been here</>
          ) : "Visitor count unavailable"}
        </p>
      </div>
    </section>
  );
}
