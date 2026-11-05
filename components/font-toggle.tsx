"use client";

import { useEffect, useSyncExternalStore } from "react";

const presets = ["clean", "contrast", "developer"] as const;
const names = { clean: "Clean", contrast: "Contrast", developer: "Developer" };
const normalize = (value: string | null | undefined) => presets.find(preset => preset === value) ?? "clean";
const snapshot = () => normalize(document.documentElement.dataset.font);
const subscribe = (notify: () => void) => {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-font"] });
  return () => observer.disconnect();
};

export function FontToggle({ inMenu = false }: { inMenu?: boolean }) {
  const preset = useSyncExternalStore(subscribe, snapshot, () => "clean" as const);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== null && event.key !== "czar-font") return;
      document.documentElement.dataset.font = normalize(event.newValue);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const next = presets[(presets.indexOf(preset) + 1) % presets.length];
  const label = `Font: ${names[preset]}. Switch to ${names[next]}`;
  return <><div className={inMenu ? "font-menu-control" : "font-toolbar-control"}>
    <button type="button" className="icon-btn" aria-label={label} title={label} onClick={() => {
      document.documentElement.dataset.font = next;
      try { localStorage.setItem("czar-font", next); } catch {}
    }}><span aria-hidden="true">Aa</span>{inMenu && <span>{names[preset]}</span>}</button>
  </div>
    {!inMenu && <span className="sr-only" role="status" aria-live="polite">{`Font preset: ${names[preset]}`}</span>}
  </>;
}
