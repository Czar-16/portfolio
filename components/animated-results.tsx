"use client";

import type { Key, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/components/use-reduced-motion";
import { motionEase, motionSpring } from "@/components/motion-provider";

export function ResultCount({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <p aria-live="polite" aria-atomic="true" className="mt-5 min-h-4 font-mono text-[11px] text-fg-muted">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={String(children)}
          className="inline-block"
          initial={reduce ? false : { opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : -3 }}
          transition={{ duration: reduce ? 0 : 0.15 }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </p>
  );
}

export function AnimatedResults<T>({
  items,
  getKey,
  children,
  className,
  empty,
}: {
  items: readonly T[];
  getKey: (item: T) => Key;
  children: (item: T) => ReactNode;
  className: string;
  empty: ReactNode;
}) {
  const reduce = useReducedMotion();

  return (
    <div className={`relative ${className}`} data-animated-results>
      <AnimatePresence initial={false} mode="popLayout">
        {items.length ? items.map((item) => (
          <motion.div
            key={getKey(item)}
            layout={reduce ? false : "position"}
            className="h-full"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -4, transition: { duration: reduce ? 0 : 0.15 } }}
            transition={{ duration: reduce ? 0 : 0.22, ease: motionEase, layout: reduce ? { duration: 0 } : motionSpring }}
          >
            {children(item)}
          </motion.div>
        )) : (
          <motion.div
            key="empty-results"
            className="col-span-full"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.15 } }}
            transition={{ duration: reduce ? 0 : 0.22, ease: motionEase }}
          >
            {empty}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
