"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/components/use-reduced-motion";
import { motionEase, motionSpring } from "@/components/motion-provider";
import { lockBodyScroll } from "@/components/body-scroll-lock";
import { navItems, socials, resume } from "@/data/site";
import { ThemeToggle } from "@/components/theme-provider";
import {
  GithubIcon,
  XIcon,
  LinkedinIcon,
  MenuIcon,
  CloseIcon,
  CommandIcon,
  DownloadIcon,
} from "@/components/icons";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const unlock = lockBodyScroll();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      unlock();
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg-veil backdrop-blur-xl">
      <nav className="shell flex h-16 items-center justify-between gap-4" aria-label="Main">
        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 text-lg font-semibold tracking-tight text-fg transition-colors hover:text-accent"
        >
          Czar-16<span className="text-accent">.</span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`interactive relative isolate inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium ${
                    active
                      ? "text-accent"
                      : "text-fg-secondary hover:text-fg"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-lg bg-accent/10"
                      transition={reduce ? { duration: 0 } : motionSpring}
                    />
                  )}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop right side */}
        <div className="hidden items-center gap-1 lg:flex">
          {/* ⌘K hint */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
            aria-label="Open command palette"
            className="icon-btn hidden xl:flex"
          >
            <CommandIcon size={15} />
          </button>

          <ThemeToggle />

          <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />

          <a
            href={socials.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="icon-btn"
          >
            <GithubIcon size={16} />
          </a>
          <a
            href={socials.x}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter)"
            className="icon-btn"
          >
            <XIcon size={15} />
          </a>
          <a
            href={socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="icon-btn"
          >
            <LinkedinIcon size={16} />
          </a>

          <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />

          <a
            href={resume.href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary h-9 px-4 text-xs font-medium"
          >
            <DownloadIcon size={13} />
            Resume
          </a>
        </div>

        {/* Mobile right side */}
        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <button
            ref={menuButtonRef}
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="icon-btn"
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={open ? "close" : "menu"}
                initial={reduce ? false : { opacity: 0, rotate: -45, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: reduce ? 0 : 45, scale: reduce ? 1 : 0.8 }}
                transition={{ duration: reduce ? 0 : 0.12 }}
                className="flex items-center justify-center"
              >
                {open ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reduce ? 0 : 0.25, ease: motionEase }}
            className="overflow-hidden border-b border-line bg-bg lg:hidden"
          >
            <div className="shell flex flex-col gap-1 py-4">
              {navItems.map((item, index) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <motion.div
                    key={item.href}
                    initial={reduce ? false : { opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduce ? 0 : 0.2, delay: reduce ? 0 : Math.min(index * 0.025, 0.12), ease: motionEase }}
                  >
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    className={`interactive block rounded-lg px-4 py-3 text-sm font-medium ${
                      active
                        ? "bg-accent/10 text-accent"
                        : "text-fg-secondary hover:bg-fg/5 hover:text-fg"
                    }`}
                  >
                    {item.label}
                  </Link>
                  </motion.div>
                );
              })}
              <div className="mt-3 flex items-center gap-2 border-t border-line pt-4">
                <a
                  href={socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="icon-btn"
                >
                  <GithubIcon size={17} />
                </a>
                <a
                  href={socials.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className="icon-btn"
                >
                  <XIcon size={16} />
                </a>
                <a
                  href={socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="icon-btn"
                >
                  <LinkedinIcon size={17} />
                </a>
                <a
                  href={resume.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className="btn btn-primary ml-auto h-9 px-4 text-xs"
                >
                  <DownloadIcon size={13} />
                  Resume
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
