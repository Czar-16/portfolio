"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { motionEase } from "@/components/motion-provider";
import { useReducedMotion } from "@/components/use-reduced-motion";

export function StackCard({ children, className, labelledBy }: {
  children: ReactNode;
  className: string;
  labelledBy: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      aria-labelledby={labelledBy}
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: reduce ? 0 : 0.45,
            ease: motionEase,
            delayChildren: reduce ? 0 : 0.1,
            staggerChildren: reduce ? 0 : 0.045,
          },
        },
      }}
    >
      {children}
    </motion.section>
  );
}

export function StackTile({ children, className }: { children: ReactNode; className: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.li
      className={className}
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.3, ease: motionEase } },
      }}
    >
      {children}
    </motion.li>
  );
}
