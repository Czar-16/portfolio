"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useDocumentVisible } from "@/components/use-document-visible";
import { useReducedMotion } from "@/components/use-reduced-motion";
import styles from "./visitor-counter.module.css";

const outline = "M4 20C11 9 21 5 32 5s21 4 28 15c-7 10-17 15-28 15S11 30 4 20Z";

export function VisitorEye() {
  const id = useId();
  const ref = useRef<SVGSVGElement>(null);
  const [inView, setInView] = useState(false);
  const visible = useDocumentVisible();
  const reduced = useReducedMotion();
  const paused = !visible || !inView;

  useEffect(() => {
    const eye = ref.current;
    if (!eye) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(eye);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const eye = ref.current;
    if (!eye || paused || reduced) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      eye.style.setProperty("--gaze-x", "0px");
      eye.style.setProperty("--gaze-y", "0px");
      delete eye.dataset.tracking;
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      x = event.clientX;
      y = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const bounds = eye.getBoundingClientRect();
        const dx = x - (bounds.left + bounds.width / 2);
        const dy = y - (bounds.top + bounds.height / 2);
        // Saturating movement keeps the iris inside the lids, even at viewport edges.
        eye.style.setProperty("--gaze-x", `${(Math.tanh(dx / 180) * 4.5).toFixed(2)}px`);
        eye.style.setProperty("--gaze-y", `${(Math.tanh(dy / 160) * 2.5).toFixed(2)}px`);
        eye.dataset.tracking = "true";
      });
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);
    return () => {
      reset();
      document.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", reset);
      window.removeEventListener("blur", reset);
    };
  }, [paused, reduced]);

  return (
    <svg ref={ref} viewBox="0 0 64 40" width="52" height="34" fill="none" aria-hidden="true" className={styles.eye} data-paused={paused} data-visitor-eye>
      <defs>
        <clipPath id={`${id}-opening`}>
          <path d={outline} className={styles.lids} data-eye-aperture />
        </clipPath>
        <radialGradient id={`${id}-white`} cx="48%" cy="60%" r="65%">
          <stop offset="25%" stopColor="var(--eye-white)" />
          <stop offset="100%" stopColor="var(--eye-shadow)" />
        </radialGradient>
        <radialGradient id={`${id}-iris`} cx="45%" cy="58%" r="55%">
          <stop offset="20%" stopColor="#879a9f" />
          <stop offset="58%" stopColor="#667f88" />
          <stop offset="82%" stopColor="#3d555f" />
          <stop offset="100%" stopColor="#1c303a" />
        </radialGradient>
      </defs>
      <g clipPath={`url(#${id}-opening)`}>
        <path d={outline} fill={`url(#${id}-white)`} />
        <g className={styles.gaze} data-eye-gaze>
          <g className={styles.idle}>
            <circle cx="32" cy="20" r="10.5" fill={`url(#${id}-iris)`} />
            <circle cx="32" cy="20" r="7.8" stroke="#adc1c3" strokeWidth="3.3" strokeDasharray=".35 1.3" opacity=".28" />
            <circle cx="32" cy="20" r="4.2" fill="#080f15" className={styles.pupil} />
            <ellipse cx="28.7" cy="16.5" rx="2.2" ry="1.7" fill="white" opacity=".92" />
            <circle cx="35.3" cy="23.4" r=".85" fill="white" opacity=".5" />
          </g>
        </g>
        <path d="M3 19C16 1 48 1 61 19" stroke="#101c24" strokeWidth="4" opacity=".15" />
      </g>
      <path d={outline} className={styles.lids} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
