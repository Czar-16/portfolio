"use client";

import { VisitorEye } from "@/components/visitor-eye";
import { useVisitorCount } from "@/components/visitor-provider";
import styles from "./visitor-counter.module.css";

export function VisitorCounter() {
  const { status, count } = useVisitorCount();

  return (
    <div className={styles.card} aria-label="Portfolio visitors">
        <VisitorEye />
        <p className={styles.text} aria-live="polite" aria-atomic="true" aria-busy={status === "loading"}>
          {status === "ready" ? (
            <><span className={styles.number}>{count!.toLocaleString("en-US")}</span><span className={styles.label}> {count === 1 ? "visitor has" : "visitors have"} been here</span></>
          ) : status === "loading" ? (
            <><span className={styles.number}>—</span><span className={styles.label}> visitors have been here</span></>
          ) : "Visitor count unavailable"}
        </p>
    </div>
  );
}
