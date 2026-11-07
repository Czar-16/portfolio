"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useInteraction } from "@/components/interaction-provider";

const subscribe = (notify: () => void) => {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
};
const snapshot = () => document.documentElement.dataset.theme;
export function ThemeToggle() {
  const { playTheme } = useInteraction();
  const theme = useSyncExternalStore(subscribe, snapshot, () => undefined);
  useEffect(() => {
    const root = document.documentElement;
    const system = matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      let saved: string | null = null;
      try { saved = localStorage.getItem("czar-theme"); } catch {}
      const next = saved === "dark" || saved === "light" ? saved : system.matches ? "dark" : "light";
      root.dataset.theme = next;
    };
    system.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    // Catch a system change between the before-paint script and hydration.
    sync();
    return () => { system.removeEventListener("change", sync); window.removeEventListener("storage", sync); };
  }, []);
  const next = theme === "light" ? "dark" : "light";
  return <button type="button" className="icon-btn" data-click-sound="off" aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`} onClick={(event) => {
    playTheme(next);
    const root = document.documentElement;
    const changeTheme = () => { root.dataset.theme = next; };
    if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const bounds = event.currentTarget.getBoundingClientRect();
      const x = bounds.left + bounds.width / 2;
      const y = bounds.top + bounds.height / 2;
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const transition = document.startViewTransition(changeTheme);
      void transition.ready.then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 650, easing: "cubic-bezier(.22, 1, .36, 1)", pseudoElement: "::view-transition-new(root)" },
        );
      }).catch(() => {});
    } else {
      changeTheme();
    }
    try { localStorage.setItem("czar-theme", next); } catch {}
  }}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><g className="theme-sun"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></g><path className="theme-moon" d="M20 15.5A9 9 0 0 1 8.5 4 9 9 0 1 0 20 15.5Z" /></svg></button>;
}
