"use client";

import { VisitorEye } from "@/components/visitor-eye";
import { useVisitorCount } from "@/components/visitor-provider";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import styles from "./visitor-counter.module.css";
import { useReducedMotion } from "@/components/use-reduced-motion";

type Splash = { id: number; x: number; y: number; fall: number };

export function VisitorCounter() {
  const { status, count } = useVisitorCount();
  const cardRef = useRef<HTMLDivElement>(null);
  const [splash, setSplash] = useState<Splash | null>(null);
  const splashId = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const activate = () => {
      const card = cardRef.current;
      const eye = card?.querySelector<SVGSVGElement>("[data-visitor-eye]");
      if (!card || !eye) return;
      const cardBounds = card.getBoundingClientRect();
      const lowerLid = eye.createSVGPoint();
      lowerLid.x = 32;
      lowerLid.y = 34.3;
      const lidPosition = lowerLid.matrixTransform(eye.getScreenCTM()!);
      const x = lidPosition.x - cardBounds.left;
      const y = lidPosition.y - cardBounds.top;
      setSplash({ id: ++splashId.current, x, y, fall: Math.max(0, cardBounds.height - y - 12) });
    };
    window.addEventListener("visitor-eye-tear", activate);
    return () => window.removeEventListener("visitor-eye-tear", activate);
  }, []);

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
      <div ref={cardRef} className={styles.card} data-visitor-card>
        <VisitorEye />
        {splash && (
          <div key={splash.id} className={styles.splashOverlay} aria-hidden="true" data-reduced={reduced}>
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
            </span>
          </div>
        )}
        <p className={styles.text} aria-live="polite" aria-atomic="true" aria-busy={status === "loading"}>
          {status === "ready" ? (
            <><span className={styles.number}>{count!.toLocaleString("en-US")}</span> {count === 1 ? "visitor has" : "visitors have"} been here</>
          ) : status === "loading" ? (
            <><span className={styles.number}>—</span> visitors have been here</>
          ) : "Visitor count unavailable"}
        </p>
      </div>
    </section>
  );
}
