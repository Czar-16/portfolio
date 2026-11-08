"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useEffectsPaused } from "./use-effects-paused";
import styles from "./swarm-tour.module.css";
import { quotes } from "@/data/quotes";
import { useDocumentVisible } from "@/components/use-document-visible";
export function ClosingQuote() {
  const [index, setIndex] = useState(0);
  const documentVisible = useDocumentVisible();
  const paused = useEffectsPaused();
  const visible = documentVisible && !paused;
  useEffect(() => {
    if (!visible) return;
    const timer = window.setInterval(() => setIndex(current => (current + 1) % quotes.length), 6000);
    return () => window.clearInterval(timer);
  }, [visible]);
  return <section className="closing-quote section-frame" data-quote-rotating={visible} aria-label="A thought to leave with">
    <Link href="/quotes" className="block cursor-pointer">
      <div className="flex flex-col items-center gap-1">
        <blockquote key={quotes[index].id} data-closing-quote={quotes[index].id}>“{quotes[index].text}”</blockquote>
        <p aria-hidden="true">— &nbsp; NOTES TO SELF &nbsp; —</p>
      </div>
    </Link>
    <button className={styles.replay} type="button" data-intro-replay data-click-sound="off" onClick={() => window.dispatchEvent(new Event("portfolio-replay-intro"))}>Rebuild</button>
  </section>;
}
