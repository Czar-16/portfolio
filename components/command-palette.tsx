"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "@/components/use-reduced-motion";
import { CloseIcon, SearchIcon } from "@/components/icons";
import { motionEase } from "@/components/motion-provider";
import { lockBodyScroll } from "@/components/body-scroll-lock";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) triggerRef.current = document.activeElement as HTMLElement;
        setIsOpen(!isOpen);
      }
    };

    const handleOpenEvent = () => {
      if (!isOpen) triggerRef.current = document.activeElement as HTMLElement;
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleOpenEvent);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleOpenEvent);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const unlock = lockBodyScroll();
    const background = Array.from(document.querySelectorAll<HTMLElement>("body > header, body > main, body > footer"));
    const previousInert = background.map((element) => element.inert);
    background.forEach((element) => { element.inert = true; });
    searchRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), a[href], [tabindex="0"]',
      ) ?? []);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      unlock();
      background.forEach((element, index) => { element.inert = previousInert[index]; });
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/#projects" },
    { label: "Stack", href: "/stack" },
    { label: "Movies", href: "/movies" },
    { label: "Quotes", href: "/quotes" },
    { label: "Achievements", href: "/achievements" },
    { label: "About", href: "/about" },
  ];

  const actionItems = [
    { label: "Open GitHub", href: "https://github.com/Czar-16", external: true },
    { label: "Open X", href: "https://x.com", external: true },
    { label: "Open LinkedIn", href: "https://linkedin.com", external: true },
    { label: "Contact Me", href: "mailto:anoopjha@example.com", external: true },
  ];

  const filteredNav = navItems.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));
  const filteredActions = actionItems.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="command-palette"
          data-lenis-prevent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.18 }}
          onPointerDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false); }}
          className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-20 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={reduce ? false : { opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.98, y: reduce ? 0 : -4 }}
            transition={{ duration: reduce ? 0 : 0.22, ease: motionEase }}
            className="card w-full max-w-lg bg-card overflow-hidden shadow-pop"
          >
            <div className="flex items-center px-4 border-b">
              <SearchIcon className="w-5 h-5 text-fg-muted mr-3" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-w-0 flex-1 bg-transparent py-4 text-fg focus:outline-none"
              />
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close command palette" className="icon-btn ml-2"><CloseIcon size={16} /></button>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto space-y-4">
              {filteredNav.length > 0 && (
                <div>
                  <p className="text-xs text-fg-muted uppercase tracking-wider mb-2">Navigation</p>
                  <div className="relative space-y-1">
                    <AnimatePresence initial={false} mode="popLayout">
                    {filteredNav.map((item) => (
                      <motion.button
                        key={item.href}
                        layout={reduce ? false : "position"}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduce ? 0 : 0.15 }}
                        onClick={() => {
                          setIsOpen(false);
                          router.push(item.href);
                        }}
                        className="interactive w-full text-left px-3 py-2 rounded-lg hover:bg-accent/10 hover:text-accent text-sm"
                      >
                        {item.label}
                      </motion.button>
                    ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {filteredActions.length > 0 && (
                <div>
                  <p className="text-xs text-fg-muted uppercase tracking-wider mb-2">Actions</p>
                  <div className="relative space-y-1">
                    <AnimatePresence initial={false} mode="popLayout">
                    {filteredActions.map((item) => (
                      <motion.button
                        key={item.href}
                        layout={reduce ? false : "position"}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduce ? 0 : 0.15 }}
                        onClick={() => {
                          setIsOpen(false);
                          if (item.external) {
                            window.open(item.href, "_blank");
                          } else {
                            router.push(item.href);
                          }
                        }}
                        className="interactive w-full text-left px-3 py-2 rounded-lg hover:bg-accent/10 hover:text-accent text-sm"
                      >
                        {item.label}
                      </motion.button>
                    ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
              {!filteredNav.length && !filteredActions.length && (
                <p role="status" className="py-6 text-center text-sm text-fg-muted">No matching commands.</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
