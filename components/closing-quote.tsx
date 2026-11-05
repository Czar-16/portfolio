"use client";
import { useEffect, useState } from "react";
import { quotes } from "@/data/quotes";
import { useDocumentVisible } from "@/components/use-document-visible";
export function ClosingQuote() {
  const [index, setIndex] = useState(0);
  const visible = useDocumentVisible();
  useEffect(() => {
    if (!visible) return;
    const timer = window.setInterval(() => setIndex(current => (current + 1) % quotes.length), 6000);
    return () => window.clearInterval(timer);
  }, [visible]);
  return <section className="closing-quote section-frame" data-quote-rotating={visible} aria-label="A thought to leave with">
    <blockquote key={quotes[index].id} data-closing-quote={quotes[index].id}>“{quotes[index].text}”</blockquote>
    <p aria-hidden="true">— &nbsp; NOTES TO SELF &nbsp; —</p>
  </section>;
}
