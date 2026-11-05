"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { navItems } from "@/data/site";
import { SoundToggle } from "@/components/interaction-provider";
import { MenuIcon, CloseIcon, SearchIcon } from "@/components/icons";
import { lockBodyScroll } from "@/components/body-scroll-lock";
const sections = [
  ["projects", "Projects"], ["github", "GitHub"], ["tech-stack", "Stack"],
  ["watch", "Watch"], ["quotes", "Quotes"], ["contact", "Contact"],
];
export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("profile");
  const previousPath = useRef(pathname);
  useEffect(() => {
    if (previousPath.current !== pathname) {
      previousPath.current = pathname;
      setOpen(false);
    }
  }, [pathname]);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const unlock = lockBodyScroll();
    const desktop = window.matchMedia("(min-width: 1280px)");
    const close = () => { if (desktop.matches) setOpen(false); };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    };
    desktop.addEventListener("change", close);
    document.addEventListener("keydown", keydown);
    return () => { unlock(); desktop.removeEventListener("change", close); document.removeEventListener("keydown", keydown); };
  }, [open]);
  useEffect(() => {
    if (pathname !== "/") return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
    }, { rootMargin: "-10% 0px -65% 0px" });
    for (const [id] of sections) { const element = document.getElementById(id); if (element) observer.observe(element); }
    return () => observer.disconnect();
  }, [pathname]);
  return <header className="site-header">
    <div className="compact-toolbar">
      <Link href="/" className="text-sm font-semibold" onClick={() => setOpen(false)}>Czar16.</Link>
      <div className="flex items-center gap-1">
        <button type="button" className="icon-btn" aria-label="Search commands" aria-haspopup="dialog" title="Search commands (Ctrl+K / ⌘K)" onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent("open-command-palette")); }}><SearchIcon size={16} /></button>
        <SoundToggle />
        <button ref={trigger} type="button" className="icon-btn mobile-menu-trigger" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>{open ? <CloseIcon size={18} /> : <MenuIcon size={18} />}</button>
      </div>
    </div>
    <aside className="desktop-index">
      <nav aria-label="Section index"><p className="index-label">Index</p>{sections.map(([id, label]) => <a key={id} href={pathname === "/" ? `#${id}` : `/#${id}`} aria-current={active === id ? "location" : undefined}>{label}</a>)}</nav>
    </aside>
    {open && <nav id="mobile-menu" aria-label="Main">{navItems.map(item => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link>)}</nav>}
  </header>;
}
