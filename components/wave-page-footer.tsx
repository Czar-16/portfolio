"use client";

import { usePathname } from "next/navigation";
import { WaveFooterBg } from "@/components/wave-footer-bg";

export function WavePageFooter() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <footer className="relative h-[clamp(32rem,42vh,44rem)] w-full overflow-hidden bg-black" aria-hidden="true">
      <WaveFooterBg />
    </footer>
  );
}
