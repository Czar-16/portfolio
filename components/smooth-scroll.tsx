"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopPointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    const dispose = () => {
      cancelAnimationFrame(frame); frame = 0;
      // Settle native-scroll state before destruction so a pending Lenis velocity
      // timer cannot restore its CSS classes after reduced motion is enabled.
      lenisRef.current?.stop();
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };

    const tick = (time: number) => {
      lenisRef.current?.raf(time);
      frame = requestAnimationFrame(tick);
    };
    const syncScrollLock = () => {
      const lenis = lenisRef.current;
      if (!lenis) return;
      // Read the explicit lock, not computed overflow from lenis-stopped;
      // otherwise Lenis's own CSS could keep it stopped after unlocking.
      const overflow = document.documentElement.style.overflowY;
      if (document.hidden || overflow === "hidden" || overflow === "clip" || document.documentElement.hasAttribute("data-swarm-active")) {
        lenis.stop();
        cancelAnimationFrame(frame); frame = 0;
      } else {
        if (lenis.isStopped) lenis.start();
        if (!frame) frame = requestAnimationFrame(tick);
      }
    };

    const configure = () => {
      dispose();
      if (reducedMotion.matches || document.documentElement.dataset.motion === "off" || !desktopPointer.matches) return;

      lenisRef.current = new Lenis({
        autoRaf: false,
        smoothWheel: true,
        syncTouch: false,
        // Follow input promptly, with a shorter settling tail.
        lerp: 0.1,
        wheelMultiplier: 1,
        // Keep menus and dialogs scrollable while the viewport is locked.
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
      });
      syncScrollLock();
    };

    // Honor the shared viewport lock used by menus and dialogs.
    const observer = new MutationObserver(records => {
      if (records.some(record => record.attributeName === "data-motion")) configure();
      else syncScrollLock();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "data-swarm-active", "data-motion"],
    });
    reducedMotion.addEventListener("change", configure);
    desktopPointer.addEventListener("change", configure);
    // Cancel inertia before the browser restores a history entry's position.
    const settleScroll = () => {
      lenisRef.current?.scrollTo(window.scrollY, { immediate: true });
    };
    window.addEventListener("popstate", settleScroll);
    const resetScroll = () => {
      const lenis = lenisRef.current;
      lenis?.resize();
      lenis?.scrollTo(0, { immediate: true, force: true });
      syncScrollLock();
    };
    window.addEventListener("portfolio-scroll-reset", resetScroll);
    const visibilityChanged = () => {
      syncScrollLock();
    };
    document.addEventListener("visibilitychange", visibilityChanged);

    const scrollToAnchor = (event: MouseEvent) => {
      const lenis = lenisRef.current;
      if (!lenis || lenis.isStopped || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.composedPath().find(node => node instanceof HTMLAnchorElement);
      if (!(link instanceof HTMLAnchorElement) || link.hasAttribute("download") ||
        (link.target && link.target !== "_self")) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname ||
        url.search !== location.search || !url.hash) return;
      let target: HTMLElement | null;
      try {
        target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      } catch {
        return;
      }
      if (!target) return;
      // Prevent the native instant jump before Lenis starts its animation.
      event.preventDefault();
      if (url.hash !== location.hash) window.history.pushState(null, "", url.href);
      // Lenis reads the root scroll-padding and target scroll-margin itself.
      lenis.scrollTo(target, { onComplete: () => {
        if (!target.hasAttribute("tabindex")) {
          target.setAttribute("tabindex", "-1");
          target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
        }
        target.focus({ preventScroll: true });
      } });

    };
    window.addEventListener("click", scrollToAnchor);
    configure();

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", configure);
      desktopPointer.removeEventListener("change", configure);
      window.removeEventListener("popstate", settleScroll);
      window.removeEventListener("portfolio-scroll-reset", resetScroll);
      document.removeEventListener("visibilitychange", visibilityChanged);
      window.removeEventListener("click", scrollToAnchor);
      dispose();
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    // Synchronize with Next's position, without replacing its scroll restoration.
    lenis.resize();
    lenis.scrollTo(window.scrollY, { immediate: true });
  }, [pathname]);

  return null;
}
