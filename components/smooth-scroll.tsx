"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | undefined;

    const syncScrollLock = () => {
      if (!lenis) return;
      const overflow = getComputedStyle(document.body).overflowY;
      if (overflow === "hidden" || overflow === "clip") {
        lenis.stop();
      } else if (lenis.isStopped) {
        lenis.start();
      }
    };

    const configure = () => {
      lenis?.destroy();
      lenis = undefined;
      if (reducedMotion.matches) return;

      lenis = new Lenis({
        autoRaf: true,
        smoothWheel: true,
        syncTouch: false,
        lerp: 0.085,
        anchors: true,
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
      });
      syncScrollLock();
    };

    // Honor the mobile navigation's existing body scroll lock.
    const observer = new MutationObserver(syncScrollLock);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    reducedMotion.addEventListener("change", configure);
    configure();

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", configure);
      lenis?.destroy();
    };
  }, [pathname]);

  return null;
}
