"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/components/use-reduced-motion";
import { motionEase } from "@/components/motion-provider";

const subscribe = (notify: () => void) => {
  window.addEventListener("scroll", notify, { passive: true });
  return () => window.removeEventListener("scroll", notify);
};
const getSnapshot = () => window.scrollY > 600;
const getServerSnapshot = () => false;

export function BackToTop() {
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const reduce = useReducedMotion();
  const show = scrolled && (pathname === "/quotes" || pathname === "/watch");

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href="#page-top"
          aria-label="Back to top"
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-40 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card text-fg-secondary shadow-pop hover:border-accent/40 hover:text-accent"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : 8 }}
          transition={{ duration: reduce ? 0 : 0.2, ease: motionEase }}
          onClick={() => document.getElementById("page-top")?.focus({ preventScroll: true })}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m6 12 6-6 6 6M12 6v13" />
          </svg>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
