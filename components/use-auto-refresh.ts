"use client";

import { useEffect, useState } from "react";

const REFRESH_INTERVAL = 60 * 60_000;

// Refresh visible dashboards without polling background tabs or flooding APIs on focus.
export function useAutoRefresh() {
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let lastRefresh = Date.now();
    const refresh = () => {
      if (document.hidden || Date.now() - lastRefresh < REFRESH_INTERVAL) return;
      lastRefresh = Date.now();
      setRevision(value => value + 1);
    };
    const interval = window.setInterval(refresh, REFRESH_INTERVAL);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  return revision;
}
