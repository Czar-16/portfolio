"use client";

import dynamic from "next/dynamic";

const CommandPalette = dynamic(() => import("@/components/command-palette"), {
  ssr: false,
});

export function CommandPaletteWrapper() {
  return <CommandPalette />;
}
