"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { quotes, quoteCategories, type Quote, type QuoteCategoryId } from "@/data/quotes";
import { CopyButton } from "@/components/copy-button";
import { QuoteIcon } from "@/components/icons";
import { useReducedMotion } from "@/components/use-reduced-motion";
import styles from "./quotes-browser.module.css";

// Pre-computed spike trajectories: 12 spikes fanning out from the seal center.
const spikeAnim = Array.from({ length: 12 }).map((_, i) => {
  const angle = (i / 12) * 360 - 90;
  const rad = angle * Math.PI / 180;
  const mid = 60;
  const far = 110;
  return {
    id: i,
    angle,
    tx1: Math.cos(rad) * mid,
    ty1: Math.sin(rad) * mid,
    tx2: Math.cos(rad) * far,
    ty2: Math.sin(rad) * far,
    tx3: Math.cos(rad) * far * 1.15,
    ty3: Math.sin(rad) * far * 1.15,
  };
});

function ConcealedQuote({ quote }: { quote: Quote }) {
  const [revealed, setRevealed] = useState(false);
  const reduce = useReducedMotion();
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reveal = () => {
    if (revealed) return;
    if (reduce) { setRevealed(true); return; }
    setRevealed(true);
  };

  const hoverReveal = () => {
    if (revealed) return;
    if (reduce) { setRevealed(true); return; }
    // Let the spike burst play before swapping in the quote text.
    revealTimer.current = setTimeout(() => setRevealed(true), 700);
  };

  useEffect(() => () => {
    if (revealTimer.current) clearTimeout(revealTimer.current);
  }, []);

  return (
    <li>
      <figure
        className={`quote-card card-lift relative flex h-full flex-col p-6 ${styles.quote}`}
        data-click-sound="on"
        data-quote-id={quote.id}
        data-revealed={revealed}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse" && window.matchMedia("(hover: hover)").matches) hoverReveal();
        }}
        onFocusCapture={reveal}
        onClick={reveal}
      >
        <div className="mb-6 flex h-9 items-center justify-between">
          <button
            type="button"
            onClick={reveal}
            aria-expanded={revealed}
            aria-controls={`quote-${quote.id}`}
            aria-label={`${revealed ? "Revealed" : "Uncover"} quote ${quote.id}`}
            className="min-h-11 min-w-11 rounded-lg text-left font-mono text-[11px] tracking-[0.18em] text-fg-muted focus-visible:text-accent"
          >
            {String(quote.id).padStart(3, "0")}
          </button>
          {revealed ? <CopyButton text={quote.text} label={`Copy quote ${quote.id}`} iconOnly /> : <QuoteIcon size={22} className="text-accent/35" />}
        </div>

        <div id={`quote-${quote.id}`} className={styles.quoteBody}>
          {revealed ? (
            <>
              <motion.blockquote
                className={`${styles.quoteText} relative z-1 text-[17px] font-medium leading-[1.7] tracking-[-0.015em] text-fg sm:text-lg`}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.28, ease: "easeOut" }}
              >
                {quote.text}
              </motion.blockquote>
              <span className={`${styles.quoteAccentBar} mt-6 h-px w-8 bg-accent/35`} aria-hidden="true" />
            </>
          ) : (
            <div className={styles.concealedWrap} aria-hidden="true">
              <span className={styles.seal}>
                <QuoteIcon size={28} />
                <span className={styles.sealReveal} />
                <span className={styles.spikeBurst} aria-hidden="true">
                  {spikeAnim.map((s) => (
                    <span
                      key={s.id}
                      className={styles.spike}
                      style={
                        {
                          '--angle': `${s.angle}deg`,
                          '--tx1': `${s.tx1}px`,
                          '--ty1': `${s.ty1}px`,
                          '--tx2': `${s.tx2}px`,
                          '--ty2': `${s.ty2}px`,
                          '--tx3': `${s.tx3}px`,
                          '--ty3': `${s.ty3}px`,
                        } as React.CSSProperties
                      }
                    />
                  ))}
                </span>
              </span>
              <p className="text-sm font-medium text-fg-secondary">Uncover this quote</p>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">A little perspective inside</span>
            </div>
          )}
        </div>

        <span className="mt-6 h-px w-8 bg-accent/35" aria-hidden="true" />

      </figure>
    </li>
  );
}

export function QuotesBrowser() {
  const [selected, setSelected] = useState<QuoteCategoryId | null>(null);
  const category = quoteCategories.find((item) => item.id === selected);
  const filtered = quotes.filter((quote) => quote.category === selected);

  return (
    <div className="mt-10 sm:mt-12">
      <p className="mb-5 text-sm leading-6 text-fg-secondary">
        Pick a category. <span className={styles.mouseHint}>Hover a box</span><span className={styles.touchHint}>Tap a box</span> to uncover a little perspective.
      </p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Quote categories">
        {quoteCategories.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={selected === item.id}
            aria-controls="category-quotes"
            onClick={() => setSelected(item.id)}
            className={`card flex min-h-11 max-w-full items-center gap-2 px-3 py-2 text-left ${styles.category}`}
          >
            <span className="flex items-center gap-2">
              <span className="font-mono text-sm text-accent" aria-hidden="true">{item.symbol}</span>
              <span className="font-mono text-[10px] text-fg-muted">{quotes.filter((quote) => quote.category === item.id).length} lines</span>
            </span>
            <span className="text-sm font-semibold leading-5 text-fg">{item.label}</span>
            <span className="sr-only">{item.description}</span>
          </button>
        ))}
      </div>

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {category ? `${category.label}: ${filtered.length} concealed quotes. Focus or activate a quote to uncover it.` : "Choose a category to explore the quotes."}
      </p>
      <section id="category-quotes" aria-label={category ? `${category.label} quotes` : "Quotes"} className="mt-10">
        {category ? (
          <div key={category.id}>
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-4">
              <h2 className="text-lg font-semibold text-fg">{category.label}</h2>
              <p className="font-mono text-[11px] text-fg-muted">{filtered.length} boxes · Open the ones you need</p>
            </div>
            <ol className="grid list-none grid-cols-1 gap-4 min-[480px]:grid-cols-2" aria-label={`${category.label}: ${filtered.length} quotes`}>
              {filtered.map((quote) => <ConcealedQuote key={quote.id} quote={quote} />)}
            </ol>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-14 text-center text-fg-muted">
            <QuoteIcon size={32} className="text-accent/35" />
            <p className="text-sm">100 lines. Five ways in.</p>
            <p className="text-xs">Choose what&apos;s on your mind.</p>
          </div>
        )}
      </section>
    </div>
  );
}
