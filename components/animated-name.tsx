"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { site } from "@/data/site";
import { useReducedMotion } from "@/components/use-reduced-motion";
import { useDocumentVisible } from "@/components/use-document-visible";
import styles from "./animated-name.module.css";

const names = [site.name, "Czar16"] as const;

export function AnimatedName({ variant }: { variant: "hero" | "about" }) {
  const [typing, setTyping] = useState({
    index: 0,
    length: names[0].length,
    phase: "holding" as "holding" | "preparing" | "deleting" | "typing",
  });
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);
  const visible = useDocumentVisible();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView || !visible || reduce) return;
    const delay = typing.phase === "holding" ? 2900
      : typing.phase === "preparing" ? 300
      : typing.phase === "deleting" ? (typing.length === 0 ? 220 : 55)
      : 95;
    const timer = window.setTimeout(() => {
      setTyping((current) => {
        if (current.phase === "holding") return { ...current, phase: "preparing" };
        if (current.phase === "preparing") return { ...current, phase: "deleting" };
        if (current.phase === "deleting") {
          if (current.length > 0) return { ...current, length: current.length - 1 };
          return { index: (current.index + 1) % names.length, length: 0, phase: "typing" };
        }
        const length = current.length + 1;
        return { ...current, length, phase: length === names[current.index].length ? "holding" : "typing" };
      });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [inView, visible, reduce, typing]);

  const renderName = (name: (typeof names)[number], length = name.length) => {
    const text = name.slice(0, length);
    if (variant === "about") {
      return <>{text}{length === name.length && <span className="text-accent">.</span>}</>;
    }
    const accentStart = name === "Czar16" ? 4 : name.indexOf(" ") + 1;
    return <>{text.slice(0, accentStart)}<span className="text-gradient-name">{text.slice(accentStart)}</span></>;
  };

  const name = reduce ? names[0] : names[typing.index];
  const length = reduce ? name.length : typing.length;

  return (
    <>
      <span className="sr-only">{site.name}, also known as Czar16</span>
      <span
        ref={ref}
        aria-hidden="true"
        data-animated-name
        className="relative inline-grid align-bottom"
      >
        {/* Reserve both names' dimensions so surrounding content stays still. */}
        {names.map((name) => (
          <span key={name} className="pointer-events-none invisible whitespace-nowrap [grid-area:1/1]">
            {renderName(name)}
          </span>
        ))}
        <span data-name-visible={name.slice(0, length)} className="absolute inset-0 whitespace-pre">
          <span className="relative">
            {renderName(name, length)}
            {!reduce && (
              <span
                className={styles.cursor}
                data-name-cursor
                data-active={typing.phase !== "holding"}
                data-animate={inView && visible && !reduce}
              />
            )}
          </span>
        </span>
      </span>
    </>
  );
}
