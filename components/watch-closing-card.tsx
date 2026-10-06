"use client";

import { useRef } from "react";
import { useInView } from "motion/react";
import { useDocumentVisible } from "@/components/use-document-visible";
import { useReducedMotion } from "@/components/use-reduced-motion";
import styles from "./watch-closing-card.module.css";

export function WatchClosingCard({ count }: { count: number }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.15 });
  const visible = useDocumentVisible();
  const reduce = useReducedMotion();

  return (
    <article
      ref={ref}
      className={`card card-lift flex h-full min-h-[340px] flex-col items-center justify-center px-5 py-7 sm:px-8 ${styles.scene}`}
      data-animate={inView && visible && !reduce}
      aria-label="A note about my watchlist"
    >
      <div className={styles.thought}>
        <p className="font-mono text-xs tracking-widest text-accent">{count} / ∞</p>
        <h3 className="mt-3 text-xl font-semibold leading-tight tracking-tight text-fg sm:text-2xl">
          That&apos;s all my brain gave me.
        </h3>
        <p className="mt-3 text-sm leading-6 text-fg-secondary">
          These {count} are just what came to mind while building this route.
        </p>
      </div>
      <div className={styles.thoughtTrail} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <svg
        className={styles.developer}
        viewBox="0 0 240 160"
        shapeRendering="crispEdges"
        aria-hidden="true"
        focusable="false"
      >
        {/* Chair and seated legs. */}
        <path fill="var(--line-strong)" d="M44 66h12v52H44zM44 110h58v8H44zM50 118h6v30h-6zM88 118h6v30h-6z" />
        <path fill="var(--pixel-trousers)" d="M62 106h44v16H86v20H74v-24H62z" />
        <path fill="var(--pixel-hair)" d="M68 140h24v8H68zM94 118h12v24h-12zM94 140h24v8H94z" />
        {/* Hoodie, hood, and arms. */}
        <path fill="var(--pixel-hoodie)" d="M64 62h36v8h8v12h-8v30H58V78h6z" />
        <path fill="var(--accent)" d="M64 68h8v34h-8zM72 104h22v4H72zM82 72h4v12h-4zM92 72h4v12h-4z" />
        <path fill="var(--pixel-hoodie)" d="M100 78h12v12h12v10h-24zM62 82h12v16h30v10H62z" />
        {/* Face, hair, and slightly tired glasses. */}
        <path fill="var(--pixel-skin)" d="M74 26h32v8h8v24h-8v10H80v-8h-8V34h2z" />
        <path fill="var(--pixel-hair)" d="M72 18h32v6h8v12h-10v-6H80v16h-8zM68 26h8v26h-8z" />
        <path fill="var(--pixel-hair)" d="M86 40h12v4H86zM102 40h12v4h-12zM86 44h4v8h-4zM94 44h4v8h-4zM102 44h4v8h-4zM110 44h4v8h-4zM90 50h4v4h-4zM106 50h4v4h-4zM98 44h4v4h-4z" />
        <g className={styles.eyes} fill="var(--pixel-hair)">
          <rect x="90" y="44" width="4" height="4" />
          <rect x="106" y="44" width="4" height="4" />
        </g>
        <rect x="98" y="58" width="8" height="2" fill="var(--pixel-hair)" />
        {/* Desk, laptop base, and fingers tapping the keyboard. */}
        <path fill="var(--line-strong)" d="M100 110h108v8H100zM110 118h6v30h-6zM194 118h6v30h-6z" />
        <path fill="var(--fg-muted)" d="M116 102h72v8h-72zM132 96h52v6h-52z" />
        <rect className={styles.leftHand} x="104" y="98" width="16" height="6" fill="var(--pixel-skin)" />
        <rect className={styles.rightHand} x="120" y="94" width="16" height="6" fill="var(--pixel-skin)" />
        <path fill="var(--pixel-laptop)" d="M136 54h60v50h-60z" />
        <path fill="var(--bg)" d="M142 60h48v36h-48z" />
        <path fill="var(--accent)" d="M148 68h8v3h-8zM160 68h18v3h-18zM152 76h22v3h-22zM148 84h12v3h-12z" />
        <path fill="var(--fg-muted)" d="M178 76h6v3h-6zM164 84h12v3h-12z" />
        <rect className={styles.cursor} x="180" y="84" width="3" height="4" fill="var(--accent)" />
        <path fill="var(--line)" d="M34 148h174v2H34z" />
      </svg>
    </article>
  );
}
