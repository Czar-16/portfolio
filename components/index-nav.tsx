"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import styles from "./index-nav.module.css";

const sections = [
  ["projects", "Projects"],
  ["github", "GitHub"],
  ["tech-stack", "Stack"],
  ["watch", "Watch"],
  ["contact", "Contact"],
] as const;

type Indicator = { offset: number; size: number };

export function IndexNav() {
  const pathname = usePathname();
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [active, setActive] = useState("projects");
  const [entered, setEntered] = useState(false);
  const [indicator, setIndicator] = useState<Indicator>({ offset: 0, size: 0 });
  const [progress, setProgress] = useState(0);
  const pendingScrollTarget = useRef<string | null>(null);
  const scrollSettleTimer = useRef<number | null>(null);
  const finishPendingScroll = useRef<(() => void) | null>(null);

  const measureActive = useCallback(() => {
    const item = itemRefs.current[sections.findIndex(([id]) => id === active)];
    if (!item) return;
    const mobile = window.matchMedia("(max-width: 859px)").matches;
    setIndicator({
      offset: mobile ? item.offsetLeft : item.offsetTop,
      size: mobile ? item.offsetWidth : item.offsetHeight,
    });
  }, [active]);

  useEffect(() => {
    if (pathname !== "/") return;
    const nodes = sections.map(([id]) => document.getElementById(id));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let hideTimer = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const shouldShow = y > window.innerHeight * 0.35;
      setEntered(shouldShow);
      if (hideTimer) window.clearTimeout(hideTimer);
      if (shouldShow) hideTimer = window.setTimeout(() => setEntered(false), 2000);
      const line = window.innerHeight * 0.45;
      let current = 0;
      for (let index = 0; index < nodes.length; index += 1) {
        const section = nodes[index];
        if (!section) continue;
        const rect = section.getBoundingClientRect();
        if (rect.top <= line) current = index;
        if (rect.top <= line && rect.bottom > line) {
          current = index;
          break;
        }
      }
      const section = nodes[current];
      if (section) {
        setActive(pendingScrollTarget.current ?? sections[current][0]);
        const rect = section.getBoundingClientRect();
        setProgress(Math.max(0, Math.min(1, (line - rect.top) / Math.max(1, rect.height))));
      }
    };
    const releasePendingScroll = () => {
      if (!pendingScrollTarget.current) return;
      pendingScrollTarget.current = null;
      if (scrollSettleTimer.current !== null) {
        window.clearTimeout(scrollSettleTimer.current);
        scrollSettleTimer.current = null;
      }
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    finishPendingScroll.current = releasePendingScroll;

    const armScrollSettleFallback = () => {
      if (scrollSettleTimer.current !== null) window.clearTimeout(scrollSettleTimer.current);
      scrollSettleTimer.current = window.setTimeout(releasePendingScroll, 250);
    };
    const onScroll = () => {
      if (pendingScrollTarget.current) armScrollSettleFallback();
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const onScrollEnd = () => releasePendingScroll();

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    document.addEventListener("scrollend", onScrollEnd);

    const sectionObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.querySelectorAll(":scope > *").forEach((child, index) => {
          const element = child as HTMLElement;
          element.dataset.indexRevealChild = "visible";
          element.style.setProperty("--index-reveal-delay", reduced ? "0ms" : `${Math.min(index * 70, 280)}ms`);
        });
        sectionObserver.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -35% 0px", threshold: [0, 0.35] });

    if (!reduced) {
      for (const section of nodes) {
        if (!section) continue;
        section.dataset.indexReveal = "true";
        section.querySelectorAll(":scope > *").forEach((child) => {
          (child as HTMLElement).dataset.indexRevealChild = "pending";
        });
        sectionObserver.observe(section);
      }
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      if (hideTimer) window.clearTimeout(hideTimer);
      document.removeEventListener("scrollend", onScrollEnd);
      if (scrollSettleTimer.current !== null) window.clearTimeout(scrollSettleTimer.current);
      scrollSettleTimer.current = null;
      pendingScrollTarget.current = null;
      finishPendingScroll.current = null;
      sectionObserver.disconnect();
      for (const section of nodes) {
        if (!section) continue;
        delete section.dataset.indexReveal;
        section.querySelectorAll("[data-index-reveal-child]").forEach((child) => {
          const element = child as HTMLElement;
          delete element.dataset.indexRevealChild;
          element.style.removeProperty("--index-reveal-delay");
        });
      }
    };
  }, [pathname]);

  useEffect(() => {
    measureActive();
    const onResize = () => measureActive();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [measureActive]);

  const handleClick = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") return;
    const section = document.getElementById(id);
    if (!section) return;
    event.preventDefault();
    pendingScrollTarget.current = id;
    setActive(id);
    section.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    if (scrollSettleTimer.current !== null) window.clearTimeout(scrollSettleTimer.current);
    scrollSettleTimer.current = window.setTimeout(() => finishPendingScroll.current?.(), 250);
    window.history.replaceState(window.history.state, "", `#${id}`);
  };

  return (
    <aside
      className={`${styles.indexNav} ${entered ? styles.entered : ""}`}
      data-entered={entered}
      aria-label="Page index"
    >
      <p className={styles.label}>INDEX</p>
      <nav className={styles.links} aria-label="Page index">
        <span
          className={styles.indicator}
          aria-hidden="true"
          style={{ "--indicator-offset": `${indicator.offset}px`, "--indicator-size": `${indicator.size}px` } as CSSProperties}
        />
        {sections.map(([id, label], index) => (
          <a
            key={id}
            ref={(element) => { itemRefs.current[index] = element; }}
            className={styles.link}
            data-index-link
            href={pathname === "/" ? `#${id}` : `/#${id}`}
            aria-current={active === id && pathname === "/" ? "location" : undefined}
            onClick={handleClick(id)}
            style={{ "--link-delay": `${index * 50}ms` } as CSSProperties}
          >
            <span>{label}</span>
            <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          </a>
        ))}
      </nav>
      <div className={styles.progressTrack} aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
    </aside>
  );
}
