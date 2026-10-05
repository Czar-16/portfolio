"use client";

import { useEffect, useRef, useState } from "react";

export function CopyButton({ text, label, iconOnly = false }: {
  text: string;
  label: string;
  iconOnly?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    clearTimeout(timer.current);
    setBusy(true);
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("error");
    } finally {
      setBusy(false);
      timer.current = setTimeout(() => setStatus("idle"), 3000);
    }
  }

  const message = status === "copied" ? "Copied to clipboard." : status === "error" ? "Couldn't copy. Select the text to copy it manually." : "";

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={copy}
        disabled={busy}
        aria-label={label}
        title={status === "copied" ? "Copied!" : label}
        className={`${iconOnly ? "icon-btn" : "btn h-11"} ${status === "copied" ? "text-success" : ""} disabled:cursor-wait`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {status === "copied" ? <path d="m5 12 4 4L19 6" /> : <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" /></>}
        </svg>
        {!iconOnly && (status === "copied" ? "Copied!" : label)}
      </button>
      <span role="status" className={status === "error" ? "absolute right-0 top-full z-10 mt-2 w-52 rounded-lg border border-line bg-card p-3 text-xs leading-relaxed text-fg shadow-pop" : "sr-only"}>
        {message}
      </span>
    </span>
  );
}
