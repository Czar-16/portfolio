"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/components/use-reduced-motion";
import { SunIcon, MoonIcon } from "@/components/icons";

type Theme = "dark" | "light";

const STORAGE_KEY = "czar-theme";
const CHANGE_EVENT = "czar-theme-change";
let themeAnimationTimeout: number | undefined;

const ThemeContext = createContext<{ theme: Theme; toggle: (source?: HTMLElement) => void }>({
  theme: "dark",
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getSnapshot(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return document.documentElement.dataset.theme === "light" ? "light" : "dark";
  }
}

function getServerSnapshot(): Theme {
  return "dark";
}

function applyTheme(theme: Theme, animate = true) {
  const root = document.documentElement;
  window.clearTimeout(themeAnimationTimeout);
  root.removeAttribute("data-theme-anim");
  if (animate) root.setAttribute("data-theme-anim", "");
  root.dataset.theme = theme;
  themeAnimationTimeout = window.setTimeout(
    () => root.removeAttribute("data-theme-anim"),
    550,
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const transitioning = useRef(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = useCallback((source?: HTMLElement) => {
    if (transitioning.current) return;
    const next: Theme = getSnapshot() === "dark" ? "light" : "dark";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const update = (animate: boolean) => {
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
      applyTheme(next, animate);
      window.dispatchEvent(new Event(CHANGE_EVENT));
    };

    if (reduceMotion || !document.startViewTransition) {
      update(!reduceMotion);
      return;
    }

    const root = document.documentElement;
    const bounds = source?.getBoundingClientRect();
    const x = bounds ? bounds.left + bounds.width / 2 : window.innerWidth / 2;
    const y = bounds ? bounds.top + bounds.height / 2 : window.innerHeight / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    root.style.setProperty("--theme-reveal-x", `${x}px`);
    root.style.setProperty("--theme-reveal-y", `${y}px`);
    root.style.setProperty("--theme-reveal-radius", `${Math.ceil(radius)}px`);
    root.setAttribute("data-theme-reveal", "");
    transitioning.current = true;

    const cleanup = () => {
      root.removeAttribute("data-theme-reveal");
      root.style.removeProperty("--theme-reveal-x");
      root.style.removeProperty("--theme-reveal-y");
      root.style.removeProperty("--theme-reveal-radius");
      transitioning.current = false;
    };

    try {
      const transition = document.startViewTransition(async () => {
        // Capture the complete new theme, including React subscribers.
        flushSync(() => update(false));
        // View Transitions pause rendering during capture, so yield a task
        // for DOM observers instead of waiting for an animation frame.
        await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
      });
      // A skipped transition still applies the theme; handle its rejected ready promise.
      void transition.ready.catch(() => {});
      void transition.finished.then(cleanup, cleanup);
    } catch {
      cleanup();
      update(true);
    }
  }, []);

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const reduceMotion = useReducedMotion();
  const isDark = theme === "dark";

  return (
    <button
      onClick={(event) => toggle(event.currentTarget)}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="icon-btn"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: reduceMotion ? 0 : -80, opacity: 0, scale: reduceMotion ? 1 : 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: reduceMotion ? 0 : 80, opacity: 0, scale: reduceMotion ? 1 : 0.5 }}
          transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center"
        >
          {isDark ? <SunIcon size={17} /> : <MoonIcon size={17} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
