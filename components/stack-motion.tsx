"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { motionDuration, motionEase } from "@/components/motion-provider";
import { useReducedMotion } from "@/components/use-reduced-motion";

export function StackCard({ children, className, labelledBy }: {
  children: ReactNode;
  className: string;
  labelledBy: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="card-lift-host h-full min-w-0"
      initial={reduce ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: "some" }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: reduce ? 0 : motionDuration.enter,
            ease: motionEase,
          },
        },
      }}
    >
      <section aria-labelledby={labelledBy} className={`card-lift ${className}`}>
        {children}
      </section>
    </motion.div>
  );
}

export function StackTile({ children, className, index = 0 }: { children: ReactNode; className: string; index?: number }) {
  const reduce = useReducedMotion();

  return (
    <motion.li
      className={className}
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: {
          duration: reduce ? 0 : motionDuration.enter,
          delay: reduce ? 0 : Math.min(index * 0.04, motionDuration.staggerMax),
          ease: motionEase,
        } },
      }}
    >
      {children}
    </motion.li>
  );
}
