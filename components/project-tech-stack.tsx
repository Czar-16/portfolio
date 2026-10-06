"use client";

import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { motionEase } from "@/components/motion-provider";
import { useReducedMotion } from "@/components/use-reduced-motion";

export function ProjectTechStack({
  tech,
  projectName,
  className = "",
}: {
  tech: string[];
  projectName: string;
  className?: string;
}) {
  const remaining = tech.slice(4);
  const id = useId();
  const reduceMotion = useReducedMotion();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);
  const focused = useRef(false);
  const pinned = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number; width: number } | null>(null);

  function cancelClose() {
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }

  function show() {
    cancelClose();
    const rect = trigger.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(280, window.innerWidth - 24);
    setPosition({
      left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
      top: rect.bottom + 8,
      width,
    });
    setOpen(true);
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      if (!hovering.current && !focused.current && !pinned.current) setOpen(false);
    }, 120);
  }

  useLayoutEffect(() => {
    if (!open || !panel.current || !trigger.current) return;
    const element = panel.current;
    function placePanel() {
      if (!trigger.current) return;
      const rect = trigger.current.getBoundingClientRect();
      const height = element.offsetHeight;
      const below = rect.bottom + 8;
      const above = rect.top - height - 8;
      const top = below + height <= window.innerHeight - 12 ? below : above;
      element.style.top = `${Math.max(12, Math.min(top, window.innerHeight - height - 12))}px`;
    }
    placePanel();
    // Presence animations can mount their content after this layout effect.
    const observer = new ResizeObserver(placePanel);
    observer.observe(element);
    return () => observer.disconnect();
  }, [open, position]);

  useEffect(() => {
    if (!open) return;

    function dismiss() {
      pinned.current = false;
      setOpen(false);
    }

    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Node &&
        !trigger.current?.contains(event.target) &&
        !panel.current?.contains(event.target)) dismiss();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        const restoreFocus = panel.current?.contains(document.activeElement);
        if (restoreFocus) trigger.current?.focus({ preventScroll: true });
        dismiss();
      }
    }

    function onScroll(event: Event) {
      if (event.target instanceof Node && panel.current?.contains(event.target)) return;
      // Keyboard focus can scroll the trigger into view after onFocus opens
      // the panel. Re-anchor it instead of dismissing that newly opened panel.
      if (focused.current && document.activeElement === trigger.current && trigger.current) {
        const rect = trigger.current.getBoundingClientRect();
        if (rect.bottom > 65 && rect.top < window.innerHeight) {
          setPosition(current => current ? {
            ...current,
            left: Math.max(12, Math.min(rect.left, window.innerWidth - current.width - 12)),
            top: rect.bottom + 8,
          } : current);
          return;
        }
      }
      dismiss();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", dismiss);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [open]);

  useEffect(() => () => {
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
  }, []);

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {tech.slice(0, 4).map((technology) => (
        <span key={technology} className="badge max-w-full !h-auto min-h-[26px] !whitespace-normal py-1 leading-relaxed [overflow-wrap:anywhere]">{technology}</span>
      ))}
      {remaining.length > 0 && (
        <button
          ref={trigger}
          type="button"
          aria-label={`${remaining.length} more technologies for ${projectName}`}
          aria-expanded={open}
          aria-controls={open ? id : undefined}
          className="badge min-h-9 min-w-9 justify-center cursor-pointer transition-colors duration-180 hover:border-accent/40 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          onPointerEnter={(event) => {
            if (event.pointerType === "touch") return;
            hovering.current = true;
            show();
          }}
          onPointerLeave={() => {
            hovering.current = false;
            scheduleClose();
          }}
          onFocus={() => {
            focused.current = true;
            show();
          }}
          onBlur={(event) => {
            if (event.relatedTarget instanceof Node && panel.current?.contains(event.relatedTarget)) return;
            focused.current = false;
            pinned.current = false;
            scheduleClose();
          }}
          onClick={() => {
            cancelClose();
            if (pinned.current) {
              pinned.current = false;
              setOpen(false);
            } else {
              pinned.current = true;
              show();
            }
          }}
        >
          +{remaining.length}
        </button>
      )}
      {position && createPortal(
        <AnimatePresence>
          {open && (
            <div
              ref={panel}
              className="fixed z-[100]"
              style={position}
            >
            <motion.div
              id={id}
              role="region"
              tabIndex={0}
              data-lenis-prevent
              aria-label={`More technologies for ${projectName}`}
              className="overflow-y-auto rounded-xl border border-line bg-elevated p-4 text-fg shadow-pop"
              style={{ maxHeight: "calc(100dvh - 24px)" }}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
              transition={{ duration: reduceMotion ? 0 : 0.18, ease: motionEase }}
              onFocus={() => { focused.current = true; cancelClose(); }}
              onBlur={(event) => {
                if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
                focused.current = false;
                pinned.current = false;
                scheduleClose();
              }}
              onPointerEnter={(event) => {
                if (event.pointerType === "touch") return;
                hovering.current = true;
                cancelClose();
              }}
              onPointerLeave={() => {
                hovering.current = false;
                scheduleClose();
              }}
            >
              <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-fg-muted">More technologies</p>
              <ul className="flex flex-wrap gap-2">
                {remaining.map((technology) => (
                  <li key={technology} className="badge max-w-full !h-auto min-h-[26px] !whitespace-normal py-1 leading-relaxed [overflow-wrap:anywhere]">
                    {technology}
                  </li>
                ))}
              </ul>
            </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
