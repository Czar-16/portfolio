"use client";

import { useSyncExternalStore } from "react";

function subscribe(notify: () => void) {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-terminal-intro", "data-swarm-active"] });
  return () => observer.disconnect();
}
const snapshot = () => document.documentElement.hasAttribute("data-terminal-intro") || document.documentElement.hasAttribute("data-swarm-active");
export function useEffectsPaused() {
  return useSyncExternalStore(subscribe, snapshot, () => true);
}
