"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    const enabled = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    let active = false;
    let x = 0;
    let y = 0;
    const selector = "[data-cursor-glow-border]";
    let targets = Array.from(document.querySelectorAll<HTMLElement>(selector));

    // Include asynchronously mounted cards, without searching the page every frame.
    const observer = new MutationObserver(records => {
      const changed = records.some(record => [...record.addedNodes, ...record.removedNodes].some(node =>
        node instanceof HTMLElement && (node.matches(selector) || node.querySelector(selector)),
      ));
      if (changed) {
        targets = Array.from(document.querySelectorAll<HTMLElement>(selector));
        schedule();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    function paint() {
      frame = 0;
      // Finish all layout reads before updating any styles.
      const positions = targets.map(element => {
        const bounds = element.getBoundingClientRect();
        return { element, x: x - bounds.left, y: y - bounds.top };
      });
      glow!.style.transform = `translate3d(${x - 320}px, ${y - 320}px, 0)`;
      glow!.dataset.active = "true";
      positions.forEach(({ element, x, y }) => {
        element.style.setProperty("--mouse-x", `${x}px`);
        element.style.setProperty("--mouse-y", `${y}px`);
      });
    }

    function schedule() {
      if (active && !frame) frame = window.requestAnimationFrame(paint);
    }

    function hide() {
      active = false;
      glow!.dataset.active = "false";
      window.cancelAnimationFrame(frame);
      frame = 0;
    }

    function move(event: PointerEvent) {
      if (!enabled.matches || event.pointerType !== "mouse" || document.hidden) {
        hide();
        return;
      }
      x = event.clientX;
      y = event.clientY;
      active = true;
      schedule();
    }

    function leave(event: PointerEvent) {
      if (event.relatedTarget === null) hide();
    }

    function visibilityChanged() {
      if (document.hidden) hide();
    }

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerout", leave);
    window.addEventListener("blur", hide);
    window.addEventListener("scroll", schedule, { passive: true, capture: true });
    window.addEventListener("resize", schedule, { passive: true });
    document.addEventListener("visibilitychange", visibilityChanged);
    enabled.addEventListener("change", hide);

    return () => {
      hide();
      observer.disconnect();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", leave);
      window.removeEventListener("blur", hide);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", visibilityChanged);
      enabled.removeEventListener("change", hide);
    };
  }, [pathname]);

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />;
}
