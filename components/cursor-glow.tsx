"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function CursorGlow() {
  const pathname = usePathname();

  useEffect(() => {
    const enabled = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    let active = false;
    let x = 0;
    let y = 0;
    let target: HTMLElement | null = null;
    let needsHitTest = false;
    const selector = "[data-cursor-glow-border]";

    function paint() {
      frame = 0;
      // Only the hovered card displays a border glow. Read its bounds once,
      // before writing styles, instead of measuring every card on the page.
      if (needsHitTest) {
        target = document.elementFromPoint(x, y)?.closest<HTMLElement>(selector) ?? null;
        needsHitTest = false;
      }
      const bounds = target?.isConnected ? target.getBoundingClientRect() : null;
      if (bounds && target) {
        target.style.setProperty("--mouse-x", `${x - bounds.left}px`);
        target.style.setProperty("--mouse-y", `${y - bounds.top}px`);
      }
    }

    function schedule() {
      if (active && !frame) frame = window.requestAnimationFrame(paint);
    }

    function hide() {
      active = false;
      target = null;
      window.cancelAnimationFrame(frame);
      frame = 0;
    }

    function move(event: PointerEvent) {
      if (document.documentElement.matches("[data-swarm-active], [data-terminal-intro], [data-motion=off]") || !enabled.matches || event.pointerType !== "mouse" || document.hidden) {
        hide();
        return;
      }
      x = event.clientX;
      y = event.clientY;
      target = event.target instanceof Element ? event.target.closest<HTMLElement>(selector) : null;
      needsHitTest = false;
      active = true;
      schedule();
    }

    function viewportChanged() {
      needsHitTest = true;
      schedule();
    }

    function leave(event: PointerEvent) {
      if (event.relatedTarget === null) hide();
    }

    function visibilityChanged() {
      if (document.hidden) hide();
    }

    const swarmObserver = new MutationObserver(() => {
      if (document.documentElement.matches("[data-swarm-active], [data-terminal-intro], [data-motion=off]")) hide();
    });
    swarmObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-swarm-active", "data-terminal-intro", "data-motion"] });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerout", leave);
    window.addEventListener("blur", hide);
    window.addEventListener("scroll", viewportChanged, { passive: true, capture: true });
    window.addEventListener("resize", viewportChanged, { passive: true });
    document.addEventListener("visibilitychange", visibilityChanged);
    enabled.addEventListener("change", hide);

    return () => {
      hide();
      swarmObserver.disconnect();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", leave);
      window.removeEventListener("blur", hide);
      window.removeEventListener("scroll", viewportChanged, true);
      window.removeEventListener("resize", viewportChanged);
      document.removeEventListener("visibilitychange", visibilityChanged);
      enabled.removeEventListener("change", hide);
    };
  }, [pathname]);

  return null;
}
