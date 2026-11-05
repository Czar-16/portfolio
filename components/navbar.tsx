"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BackgroundToggle } from "@/components/ambient-background";
import { FontToggle } from "@/components/font-toggle";
import { CompanionPicker } from "@/components/cursor-companion";
import { ThemeToggle } from "@/components/theme-toggle";
import { SoundToggle } from "@/components/interaction-provider";
import { SearchIcon } from "@/components/icons";
const sections = [
  ["projects", "Projects"], ["github", "GitHub"], ["tech-stack", "Stack"],
  ["watch", "Watch"], ["contact", "Contact"],
];
export function Navbar() {
  const pathname = usePathname();
  const [active, setActive] = useState("profile");
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
      <Link href="/" className="text-sm font-semibold">Czar16.</Link>
      <div className="toolbar-controls">
        <button type="button" className="icon-btn" aria-label="Search commands" aria-haspopup="dialog" title="Search commands (Ctrl+K / ⌘K)" onClick={() => { window.dispatchEvent(new CustomEvent("open-command-palette")); }}><SearchIcon size={16} /></button>
        <ThemeToggle />
        <FontToggle />
        <BackgroundToggle />
        <SoundToggle />
        <CompanionPicker />
      </div>
    </div>
    <aside className="desktop-index">
      <nav aria-label="Section index"><p className="index-label">Index</p>{sections.map(([id, label]) => <a key={id} href={pathname === "/" ? `#${id}` : `/#${id}`} aria-current={active === id ? "location" : undefined}>{label}</a>)}</nav>
    </aside>
  </header>;
}
