"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { quotes, quoteCategories, type Quote, type QuoteCategoryId } from "@/data/quotes";
import { CopyButton } from "@/components/copy-button";
import { QuoteIcon } from "@/components/icons";
import { useReducedMotion } from "@/components/use-reduced-motion";
import styles from "./quotes-browser.module.css";

function ConcealedQuote({ quote }: { quote: Quote }) {
  const [revealed, setRevealed] = useState(false);
  const reduce = useReducedMotion();
  const reveal = () => setRevealed(true);

  return (
    <li>
      <figure
        className={`quote-card card-lift relative flex h-full flex-col p-6 ${styles.quote}`}
        data-quote-id={quote.id}
        data-revealed={revealed}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse" && window.matchMedia("(hover: hover)").matches) reveal();
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
            className="min-h-9 min-w-11 rounded-lg text-left font-mono text-[11px] tracking-[0.18em] text-fg-muted focus-visible:text-accent"
          >
            {String(quote.id).padStart(3, "0")}
          </button>
          {revealed ? <CopyButton text={quote.text} label={`Copy quote ${quote.id}`} iconOnly /> : <QuoteIcon size={22} className="text-accent/35" />}
        </div>

        <div id={`quote-${quote.id}`} className={styles.quoteBody}>
          {revealed ? (
            <motion.blockquote
              className="relative z-1 text-[17px] font-medium leading-[1.7] tracking-[-0.015em] text-fg sm:text-lg"
              initial={reduce ? false : { opacity: 0, y: 28, scale: 0.94, rotate: -3 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              transition={reduce ? { duration: 0 } : { type: "spring", duration: 0.45, bounce: 0.2 }}
            >
              {quote.text}
            </motion.blockquote>
          ) : (
            <div className="flex h-full min-h-56 flex-col items-center justify-center gap-4 text-center" aria-hidden="true">
              <span className={styles.seal}><QuoteIcon size={28} /></span>
              <p className="text-sm font-medium text-fg-secondary">Uncover this quote</p>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">A little perspective inside</span>
            </div>
          )}
        </div>

        <span className="mt-6 h-px w-8 bg-accent/35" aria-hidden="true" />
        {revealed && !reduce && (
          <div className={styles.fragments} aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => <span key={index} />)}
          </div>
        )}
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5" role="group" aria-label="Quote categories">
        {quoteCategories.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={selected === item.id}
            aria-controls="category-quotes"
            onClick={() => setSelected(item.id)}
            className={`card card-lift flex min-h-44 flex-col items-start p-5 text-left ${styles.category}`}
          >
            <span className="mb-5 flex w-full items-center justify-between">
              <span className="font-mono text-2xl text-accent" aria-hidden="true">{item.symbol}</span>
              <span className="font-mono text-[10px] text-fg-muted">{quotes.filter((quote) => quote.category === item.id).length} lines</span>
            </span>
            <span className="text-sm font-semibold leading-5 text-fg">{item.label}</span>
            <span className="mt-2 text-xs leading-5 text-fg-secondary">{item.description}</span>
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
            <ol className="grid list-none grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label={`${category.label}: ${filtered.length} quotes`}>
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
