"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

export function useDocumentVisible() {
  return useSyncExternalStore(subscribe, () => !document.hidden, () => false);
}
