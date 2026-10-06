"use client";

import { MotionConfig } from "motion/react";
import { useReducedMotion } from "@/components/use-reduced-motion";
import type { ReactNode } from "react";

export const motionEase = [0.22, 1, 0.36, 1] as const;
export const motionDuration = { interaction: 0.22, page: 0.25, enter: 0.35, staggerMax: 0.16 } as const;
export const motionSpring = { type: "spring", stiffness: 420, damping: 34 } as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();

  return (
    <MotionConfig
      reducedMotion={reduce ? "always" : "never"}
      transition={{ duration: reduce ? 0 : motionDuration.interaction, ease: motionEase }}
    >
      {children}
    </MotionConfig>
  );
}
