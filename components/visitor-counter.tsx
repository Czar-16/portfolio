"use client";

import { useDocumentVisible } from "@/components/use-document-visible";
import { useVisitorCount } from "@/components/visitor-provider";
import styles from "./visitor-counter.module.css";

export function VisitorCounter() {
  const { status, count } = useVisitorCount();
  const visible = useDocumentVisible();

  return (
    <section className="shell flex justify-center pb-12 sm:pb-16" aria-label="Portfolio visitors">
      <div className={styles.card}>
        <svg viewBox="0 0 64 40" width="52" height="34" fill="none" aria-hidden="true" className={styles.eye} data-paused={!visible}>
          <g className={styles.lids}>
            <path d="M4 20C11 8 21 4 32 4s21 4 28 16c-7 12-17 16-28 16S11 32 4 20Z" stroke="currentColor" strokeWidth="2" />
            <circle cx="32" cy="20" r="9" fill="currentColor" fillOpacity=".22" stroke="currentColor" strokeWidth="2" />
            <circle cx="32" cy="20" r="4" fill="currentColor" />
            <circle cx="29" cy="17" r="2" fill="white" fillOpacity=".9" />
          </g>
        </svg>
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
