"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/components/use-reduced-motion";
import { motionEase } from "@/components/motion-provider";

export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      data-page-entry
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.3, ease: motionEase }}
    >
      {children}
    </motion.div>
  );
}
