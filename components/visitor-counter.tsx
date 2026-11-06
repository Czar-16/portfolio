"use client";

import { VisitorEye } from "@/components/visitor-eye";
import { useVisitorCount } from "@/components/visitor-provider";
import styles from "./visitor-counter.module.css";

export function VisitorCounter() {
  const { status, count } = useVisitorCount();

  return (
    <section className="section-frame flex justify-center" aria-label="Portfolio visitors">
      <div className={styles.card}>
        <VisitorEye />
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
