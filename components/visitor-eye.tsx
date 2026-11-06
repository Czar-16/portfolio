"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { useDocumentVisible } from "@/components/use-document-visible";
import { useReducedMotion } from "@/components/use-reduced-motion";
import styles from "./visitor-counter.module.css";

const outline = "M4 20C10.5 11.4 18.6 6.9 27.2 5.7c1.6-.2 3.2-.3 4.8-.3s3.2.1 4.8.3C45.4 6.9 53.5 11.4 60 20c-6.5 8.6-14.6 13.1-23.2 14.3-1.6.2-3.2.3-4.8.3s-3.2-.1-4.8-.3C18.6 33.1 10.5 28.6 4 20Z";
const reactions = ["OUCH!", "YIKES!", "EEK!", "OW!", "ZAP!"];
const hintStorageKey = "visitor-eye-hint-dismissed";
const hintChangeEvent = "visitor-eye-hint-change";
let hintDismissedThisVisit = false;

function subscribeToHint(callback: () => void) {
  window.addEventListener(hintChangeEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(hintChangeEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

function getHintSnapshot() {
  if (hintDismissedThisVisit) return false;
  try {
    return window.localStorage.getItem(hintStorageKey) !== "true";
  } catch {
    return true;
  }
}

function dismissHint() {
  hintDismissedThisVisit = true;
  try {
    window.localStorage.setItem(hintStorageKey, "true");
  } catch {
    // The hint still dismisses for this visit when storage is unavailable.
  }
  window.dispatchEvent(new Event(hintChangeEvent));
}

export function VisitorEye() {
  const id = useId();
  const ref = useRef<SVGSVGElement>(null);
  const [inView, setInView] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [reaction, setReaction] = useState(0);
  const showHint = useSyncExternalStore(subscribeToHint, getHintSnapshot, () => false);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visible = useDocumentVisible();
  const reduced = useReducedMotion();
  const paused = !visible || !inView;

  useEffect(() => () => {
    if (clickTimer.current) clearTimeout(clickTimer.current);
  }, []);

  const blinkOnDemand = () => {
    dismissHint();
    setReaction(Math.floor(Math.random() * reactions.length));
    window.dispatchEvent(new Event("visitor-eye-tear"));
    if (clickTimer.current) clearTimeout(clickTimer.current);
    setClicked(true);
    clickTimer.current = setTimeout(() => {
      setClicked(false);
      clickTimer.current = null;
    }, reduced ? 2200 : 2200);
  };

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
        eye.style.setProperty("--gaze-x", `${(Math.tanh(dx / 180) * 2).toFixed(2)}px`);
        eye.style.setProperty("--gaze-y", `${(Math.tanh(dy / 160) * 1).toFixed(2)}px`);
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
    <button type="button" className={styles.eyeButton} aria-label="Make the eye blink" onClick={blinkOnDemand} data-clicked={clicked}>
      {showHint && <span className={styles.eyeHint} aria-hidden="true">Poke the eyeball</span>}
      <span key={reaction} aria-hidden="true" className={styles.comicText}>{reactions[reaction]}</span>
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
          <stop offset="0%" stopColor="#a9c1c0" />
          <stop offset="24%" stopColor="#78999a" />
          <stop offset="58%" stopColor="#52747c" />
          <stop offset="84%" stopColor="#304c56" />
          <stop offset="100%" stopColor="#172b34" />
        </radialGradient>
        <radialGradient id={`${id}-cornea`} cx="35%" cy="28%" r="75%">
          <stop offset="0%" stopColor="white" stopOpacity=".24" />
          <stop offset="55%" stopColor="white" stopOpacity=".04" />
          <stop offset="100%" stopColor="#10212a" stopOpacity=".2" />
        </radialGradient>
        <linearGradient id={`${id}-lid-shadow`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity=".18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id}-opening)`}>
        <path d={outline} fill={`url(#${id}-white)`} />
        <g className={styles.gaze} data-eye-gaze>
          <g className={styles.idle}>
            <circle cx="32" cy="20" r="10.7" fill={`url(#${id}-iris)`} />
            <circle cx="32" cy="20" r="9.1" stroke="#c3d4cb" strokeWidth=".55" strokeDasharray=".35 .8" opacity=".58" />
            <circle cx="32" cy="20" r="7.4" stroke="#d2d7c2" strokeWidth="1.1" strokeDasharray=".4 1.2" opacity=".32" />
            <circle cx="32" cy="20" r="4.25" fill="#07131b" className={styles.pupil} />
            <circle cx="32" cy="20" r="4.55" stroke="#d4e0d5" strokeWidth=".45" opacity=".5" />
            <ellipse cx="28.3" cy="15.8" rx="2.5" ry="1.8" fill="white" opacity=".96" />
            <circle cx="35.7" cy="23.2" r=".9" fill="white" opacity=".72" />
          </g>
        </g>
        <path d="M4 19.5C13 7.9 22.8 4.8 32 4.8s19 3.1 28 14.7" stroke={`url(#${id}-lid-shadow)`} strokeWidth="5.5" />
        <path d="M22 6.7C25.2 5.9 28.6 5.5 32 5.5s6.8.4 10 1.2" stroke="white" strokeWidth=".7" strokeLinecap="round" opacity=".16" />
        <path d={outline} fill={`url(#${id}-cornea)`} />
      </g>
      <path d={outline} className={styles.lids} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <g className={styles.lashes} fill="none" stroke="currentColor" strokeLinecap="round">
        <path d="M8 15.5 5.8 12.7M12.5 11.7 11.2 8.5M18 8.8 17.4 5.5M24 6.8 24.2 3.7M31 5.2 31.3 2.2M38 5.4 38.8 2.6M45 7 46.2 4.1M51 9.7 53 7.3M56 13.2 58.5 11.4" strokeWidth="1.25" />
        <path d="M13 29.5 11.7 31.1M20 32.5 19.5 34.2M28 34.1 28 35.7M36 34.1 36.3 35.7M44 32.5 45 34.1M51 29.5 52.5 31" strokeWidth=".8" opacity=".72" />
      </g>
      <g className={styles.alert} aria-hidden="true">
        <path d="M55 2.8c0-.8.65-1.45 1.45-1.45S58 2 58 2.8l-.38 7.1h-2.25L55 2.8Z" fill="#ef4444" />
        <circle cx="56.45" cy="12.5" r="1.25" fill="#ef4444" />
      </g>
    </svg>
    </button>
  );
}
