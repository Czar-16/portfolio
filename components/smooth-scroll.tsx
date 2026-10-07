"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const dispose = () => {
      // Settle native-scroll state before destruction so a pending Lenis velocity
      // timer cannot restore its CSS classes after reduced motion is enabled.
      lenisRef.current?.stop();
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };

    const syncScrollLock = () => {
      const lenis = lenisRef.current;
      if (!lenis) return;
      // Read the explicit lock, not computed overflow from lenis-stopped;
      // otherwise Lenis's own CSS could keep it stopped after unlocking.
      const overflow = document.documentElement.style.overflowY;
      if (overflow === "hidden" || overflow === "clip") {
        lenis.stop();
      } else if (lenis.isStopped) {
        lenis.start();
      }
    };

    const configure = () => {
      dispose();
      if (reducedMotion.matches) return;

      lenisRef.current = new Lenis({
        autoRaf: true,
        smoothWheel: true,
        syncTouch: false,
        lerp: 0.1,
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
      });
      syncScrollLock();
    };

    // Honor the shared viewport lock used by menus and dialogs.
    const observer = new MutationObserver(syncScrollLock);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });
    reducedMotion.addEventListener("change", configure);
    // Cancel inertia before the browser restores a history entry's position.
    const settleScroll = () => lenisRef.current?.scrollTo(window.scrollY, { immediate: true });
    window.addEventListener("popstate", settleScroll);

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
      const offset = -(parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0);
      lenis.scrollTo(target, { offset, onComplete: () => target.focus({ preventScroll: true }) });
    };
    window.addEventListener("click", scrollToAnchor);
    configure();

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", configure);
      window.removeEventListener("popstate", settleScroll);
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
