"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/components/use-reduced-motion";
import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { motionEase } from "@/components/motion-provider";

export function Reveal({
  children,
  delay = 0,
  y = 16,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={`card-lift-host ${className}`}>{children}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, delay: Math.min(delay, 0.2), ease: motionEase }}
      className={`card-lift-host ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function StaggerChildren({
  children,
  className = "",
  gap = 0.04,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: {},
      }}
      className={className}
    >
      {Children.map(children, (child, index) =>
        isValidElement<{ delay?: number }>(child) && child.type === StaggerItem
          ? cloneElement(child, { delay: Math.min(index * gap, 0.2) })
          : child,
      )}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={`card-lift-host ${className}`}>{children}</div>;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, delay, ease: motionEase },
        },
      }}
      className={`card-lift-host ${className}`}
    >
      {children}
    </motion.div>
  );
}
