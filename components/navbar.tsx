"use client";
import Link from "next/link";
import { BackgroundToggle } from "@/components/ambient-background";
import { FontToggle } from "@/components/font-toggle";
import { CompanionPicker } from "@/components/cursor-companion";
import { ThemeToggle } from "@/components/theme-toggle";
import { SoundToggle } from "@/components/interaction-provider";
import { SearchIcon } from "@/components/icons";
import { IndexNav } from "@/components/index-nav";
export function Navbar() {
  return <header className="site-header">
    <div className="compact-toolbar">
      <Link href="/" className="text-sm font-semibold">Czar16.</Link>
      <div className="toolbar-controls">
        <button type="button" className="inline-flex items-center justify-center gap-2 rounded-full bg-[color-mix(in_oklab,var(--card-elevated)_6%,transparent)] border border-[color-mix(in_oklab,var(--line)_18%,transparent)] text-fg-secondary p-1.5 hover:border-[color-mix(in_oklab,var(--line)_70%,transparent)] hover:bg-[color-mix(in_oklab,var(--card-elevated)_8%,transparent)] focus-visible:outline-2 focus-visible:outline-[color-mix(in_oklab,var(--accent)_50%,transparent)] focus-visible:outline-offset-2 data-[state=open]:bg-[color-mix(in_oklab,var(--accent)_10%,transparent)]">
          <SearchIcon size={16} />
        </button>
        <ThemeToggle />
        <FontToggle />
        <BackgroundToggle />
        <SoundToggle />
        <CompanionPicker />
      </div>
    </div>
    <IndexNav />
  </header>;
}
