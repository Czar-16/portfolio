"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "@/components/use-reduced-motion";
import { CloseIcon, SearchIcon } from "@/components/icons";
import { motionEase } from "@/components/motion-provider";
import { lockBodyScroll } from "@/components/body-scroll-lock";
import { contact, navItems, socials } from "@/data/site";

type Command = { label: string; href: string };

const actionItems: Command[] = [
  { label: "Open GitHub", href: socials.github },
  { label: "Open X", href: socials.x },
  { label: "Open LinkedIn", href: socials.linkedin },
  { label: "Contact Me", href: contact.mailto },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listId = useId();
  const router = useRouter();
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && !e.repeat && !e.isComposing) {
        e.preventDefault();
        if (!isOpen) {
          triggerRef.current = document.activeElement as HTMLElement;
          setQuery("");
          setActiveIndex(0);
        }
        setIsOpen(!isOpen);
      }
    };

    const handleOpenEvent = () => {
      if (!isOpen) {
        triggerRef.current = document.activeElement as HTMLElement;
        setQuery("");
        setActiveIndex(0);
      }
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

  const search = query.trim().toLowerCase();
  const filteredNav = navItems.filter((item) => item.label.toLowerCase().includes(search));
  const filteredActions = actionItems.filter((item) => item.label.toLowerCase().includes(search));
  const results = [...filteredNav, ...filteredActions];
  const activeId = results.length ? `${listId}-option-${activeIndex}` : undefined;

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => {
      dialogRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
    });
    return () => cancelAnimationFrame(frame);
  }, [activeIndex, query, isOpen]);

  function activate(item: Command) {
    setIsOpen(false);
    if (item.href.startsWith("mailto:")) {
      window.location.assign(item.href);
    } else if (item.href.startsWith("https://")) {
      window.open(item.href, "_blank", "noopener,noreferrer");
    } else {
      router.push(item.href);
    }
  }

  function renderCommand(item: Command, index: number) {
    return (
      <motion.button
        key={item.href}
        id={`${listId}-option-${index}`}
        type="button"
        role="option"
        aria-selected={index === activeIndex}
        layout={reduce ? false : "position"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.15 }}
        onFocus={() => setActiveIndex(index)}
        onPointerMove={() => setActiveIndex(index)}
        onClick={() => activate(item)}
        className={`interactive w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-accent/10 hover:text-accent ${
          index === activeIndex ? "bg-accent/10 text-accent" : "text-fg"
        }`}
      >
        {item.label}
      </motion.button>
    );
  }

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
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto overscroll-contain bg-black/60 p-4 backdrop-blur-sm md:pt-20"
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
            className="card flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden bg-card shadow-pop md:max-h-[calc(100dvh-6rem)]"
          >
            <div className="flex shrink-0 items-center px-4 border-b">
              <SearchIcon className="w-5 h-5 text-fg-muted mr-3" />
              <input
                ref={searchRef}
                type="text"
                role="combobox"
                aria-label="Search commands"
                aria-autocomplete="list"
                aria-expanded={isOpen}
                aria-controls={listId}
                aria-activedescendant={activeId}
                autoComplete="off"
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={(event) => {
                  if (event.nativeEvent.isComposing || event.keyCode === 229) return;
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault();
                    if (!results.length) return;
                    const direction = event.key === "ArrowDown" ? 1 : -1;
                    setActiveIndex((index) => (index + direction + results.length) % results.length);
                  } else if (event.key === "Enter") {
                    event.preventDefault();
                    const selected = results[activeIndex];
                    if (selected) activate(selected);
                  }
                }}
                className="min-w-0 flex-1 bg-transparent py-4 text-fg focus:outline-none"
              />
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close command palette" className="icon-btn ml-2"><CloseIcon size={16} /></button>
            </div>
            <div className="min-h-0 max-h-80 overflow-y-auto overscroll-contain p-4">
              <div id={listId} role="listbox" aria-label="Commands" className="space-y-4">
                {filteredNav.length > 0 && (
                  <div role="group" aria-labelledby={`${listId}-navigation`}>
                    <p id={`${listId}-navigation`} className="mb-2 text-xs uppercase tracking-wider text-fg-muted">Navigation</p>
                    <div role="presentation" className="relative space-y-1">
                      {filteredNav.map((item, index) => renderCommand(item, index))}
                    </div>
                  </div>
                )}
                {filteredActions.length > 0 && (
                  <div role="group" aria-labelledby={`${listId}-actions`}>
                    <p id={`${listId}-actions`} className="mb-2 text-xs uppercase tracking-wider text-fg-muted">Actions</p>
                    <div role="presentation" className="relative space-y-1">
                      {filteredActions.map((item, index) => renderCommand(item, filteredNav.length + index))}
                    </div>
                  </div>
                )}
              </div>
              {!results.length && (
                <p role="status" className="py-6 text-center text-sm text-fg-muted">No matching commands.</p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap gap-x-4 gap-y-2 border-t border-line bg-bg-soft px-4 py-3 text-[11px] text-fg-secondary">
              <span><kbd className="font-mono text-fg">↑↓</kbd> Navigate</span>
              <span><kbd className="font-mono text-fg">Enter</kbd> Open</span>
              <span><kbd className="font-mono text-fg">Esc</kbd> Close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
