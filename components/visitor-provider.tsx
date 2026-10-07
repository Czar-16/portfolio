"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type VisitorState = { status: "loading" | "ready" | "unavailable"; count: number | null };
const VisitorContext = createContext<VisitorState>({ status: "loading", count: null });
let sessionId: string | undefined;

function getVisitorId() {
  if (sessionId) return sessionId;
  const validId = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  try {
    const stored = localStorage.getItem("portfolio-visitor-id");
    if (stored && validId.test(stored)) return (sessionId = stored);
    sessionId = crypto.randomUUID();
    localStorage.setItem("portfolio-visitor-id", sessionId);
  } catch {
    sessionId ??= crypto.randomUUID();
  }
  return sessionId;
}

export function VisitorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<VisitorState>({ status: "loading", count: null });

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let active = true;
    async function register() {
      try {
        const response = await fetch("/api/visitors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId: getVisitorId() }),
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Visitor count unavailable");
        const { count } = await response.json();
        if (!Number.isSafeInteger(count) || count < 0) throw new Error("Invalid count");
        if (active) setState({ status: "ready", count });
      } catch {
        if (active) setState({ status: "unavailable", count: null });
      } finally {
        clearTimeout(timeout);
      }
    }
    void register();
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return <VisitorContext.Provider value={state}>{children}</VisitorContext.Provider>;
}

export function useVisitorCount() {
  return useContext(VisitorContext);
}
