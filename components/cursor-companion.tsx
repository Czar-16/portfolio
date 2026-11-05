"use client";

import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useDocumentVisible } from "@/components/use-document-visible";
import { useReducedMotion } from "@/components/use-reduced-motion";
import styles from "./cursor-companion.module.css";
import { Character } from "./companion-sprites";

type Selection = "dog" | "cat" | "ghost" | "robot" | "off";
const choices = ["dog", "cat", "ghost", "robot", "off"] as const;
const names = { dog: "Simba", cat: "Billu", ghost: "AAAAA", robot: "Chitti", off: "Off" };
const quips = {
  dog: ["I work for treats. Equity negotiable.", "Your cursor smells like productivity.", "Sit? In this economy?", "Fetch failed. Returned a stick anyway.", "I put the paw in portfolio.", "BRB, barking at a suspicious pixel."],
  cat: ["I have reviewed your work. Feed me.", "This cursor is on my property.", "I knocked your bugs off the table.", "My availability? Mostly naps.", "You may pet me. Terms may change.", "I am the reason your keyboard is warm."],
  robot: ["Beep boop. Emotion successfully faked.", "My therapist says I need fewer tabs.", "404: motivation not found.", "I run on coffee. Firmware calls it coolant.", "Have you tried turning Monday off?", "Human detected. Deploying small talk."],
  ghost: ["Boo. That is my entire elevator pitch.", "I haunt the bugs you marked as fixed.", "Dead tired. Literally.", "Your code has spirit. I checked.", "I ghost meetings, not people. Mostly.", "Unfinished business? Just my side projects."],
};
const normalize = (value: string | null): Selection => choices.find(choice => choice === value) ?? "dog";
let preference: Selection | null = null;
const listeners = new Set<() => void>();
function publish(value: Selection) {
  preference = value;
  listeners.forEach(notify => notify());
}
function subscribe(notify: () => void) {
  listeners.add(notify);
  if (preference === null) {
    try { publish(normalize(localStorage.getItem("czar-pet"))); }
    catch { publish("dog"); }
  }
  const sync = (event: StorageEvent) => {
    if (event.key === "czar-pet" || event.key === null) publish(normalize(event.newValue));
  };
  window.addEventListener("storage", sync);
  return () => { listeners.delete(notify); window.removeEventListener("storage", sync); };
}
const getPreference = () => preference;
const serverPreference = () => null;
const CompanionContext = createContext<{
  selection: Selection; open: boolean; setOpen: (open: boolean) => void; choose: (choice: Selection) => void;
} | null>(null);


function placeSpeech(element: HTMLElement, bubble: HTMLElement) {
  const bounds = element.getBoundingClientRect();
  bubble.style.left = `${Math.max(16 - bounds.left, Math.min(0, document.documentElement.clientWidth - 16 - bounds.left - bubble.offsetWidth))}px`;
  bubble.style.bottom = bounds.top < 110 ? "auto" : "48px";
  bubble.style.top = bounds.top < 110 ? "48px" : "auto";
}

function Paw() {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><ellipse cx="5" cy="9" rx="2.5" ry="3" transform="rotate(-25 5 9)" /><ellipse cx="10" cy="5" rx="2.5" ry="3" /><ellipse cx="16" cy="6" rx="2.5" ry="3" transform="rotate(15 16 6)" /><ellipse cx="20" cy="11" rx="2.5" ry="3" transform="rotate(30 20 11)" /><path d="M6 18c0-3 4-7 6-7s6 4 6 7c0 4-4 2-6 2s-6 2-6-2Z" /></svg>;
}

export function CompanionPicker() {
  const context = useContext(CompanionContext);
  if (!context) throw new Error("CompanionPicker requires CursorCompanion");
  const { selection, open, setOpen, choose } = context;
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (!open) return;
    function position() {
      if (!trigger.current || !panel.current) return;
      const rect = trigger.current.getBoundingClientRect();
      const width = panel.current.offsetWidth;
      const height = panel.current.offsetHeight;
      const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
      const top = rect.bottom + height + 8 <= window.innerHeight - 8 ? rect.bottom + 8 : Math.max(8, rect.top - height - 8);
      panel.current.style.left = `${left}px`;
      panel.current.style.top = `${top}px`;
    }
    position();
    panel.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus({ preventScroll: true });
    function dismiss(event: PointerEvent) {
      if (event.target instanceof Node && !panel.current?.contains(event.target) && !trigger.current?.contains(event.target)) {
        setOpen(false);
        // Let an outside control receive focus; restore when clicking empty space.
        if (panel.current?.contains(document.activeElement)) trigger.current?.focus({ preventScroll: true });
      }
    }
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault(); event.stopPropagation();
        setOpen(false); trigger.current?.focus({ preventScroll: true });
      }
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", keydown);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", keydown);
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [open, setOpen, pathname]);

  return <div className={styles.picker} onBlur={event => {
    if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button ref={trigger} type="button" className={`icon-btn ${styles.trigger}`} aria-label={`Cursor companion: ${names[selection]}`} title={`Cursor companion: ${names[selection]}`} aria-expanded={open} aria-controls={open ? id : undefined} aria-haspopup="dialog" onClick={() => setOpen(!open)}>
      <span className={styles.paw}><Paw /></span>
      <span className={styles.staticPreview}>{selection === "off" ? <Paw /> : <Character kind={selection} />}</span>
    </button>
    {open && <div ref={panel} id={id} role="dialog" aria-label="Choose a cursor companion" className={styles.panel}>
      <p>Cursor companion</p>
      <div className={styles.options}>{choices.map(choice => <button type="button" key={choice} aria-pressed={selection === choice} onClick={() => {
        choose(choice); setOpen(false); trigger.current?.focus({ preventScroll: true });
      }}>
        {choice === "off" ? <span className={styles.off} aria-hidden="true">∅</span> : <Character kind={choice} />}
        <span>{names[choice]}{selection === choice && <span aria-hidden="true"> ✓</span>}</span>
      </button>)}</div>
    </div>}
  </div>;
}

export function CursorCompanion({ children }: { children: React.ReactNode }) {
  const stored = useSyncExternalStore(subscribe, getPreference, serverPreference);
  const selection = stored ?? "dog";
  const pathname = usePathname();
  const [openRoute, setOpenRoute] = useState<string | null>(null);
  const open = openRoute === pathname;
  const setOpen = useCallback((value: boolean) => setOpenRoute(value ? pathname : null), [pathname]);
  const follower = useRef<HTMLDivElement>(null);
  const speech = useRef<HTMLSpanElement>(null);
  const speechTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quipIndex = useRef({ dog: 0, cat: 0, robot: 0, ghost: 0 });
  function talk() {
    if (selection === "off" || !speech.current || !follower.current) return;
    const lines = quips[selection];
    speech.current.textContent = lines[quipIndex.current[selection]++ % lines.length];
    follower.current.dataset.chatting = "true";
    placeSpeech(follower.current, speech.current);
    if (speechTimer.current) clearTimeout(speechTimer.current);
    speechTimer.current = setTimeout(() => { follower.current?.removeAttribute("data-chatting"); }, 3500);
  }
  const position = useRef<{ x: number; y: number } | null>(null);
  const gait = useRef({ step: 0, direction: 0 });
  const visible = useDocumentVisible();
  const reduce = useReducedMotion();

  useEffect(() => {
    const element = follower.current;
    if (!element || stored === null || selection === "off" || open || !visible || reduce) return;
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let last: number | null = null;
    let active = false;
    let blocked = false;
    let x = 0, y = 0, targetX = 0, targetY = 0;

    const clamp = (value: number, size: number) => Math.max(8, Math.min(value, size - 48));
    function hide() {
      if (speechTimer.current) clearTimeout(speechTimer.current);
      element!.removeAttribute("data-chatting");
      cancelAnimationFrame(frame); frame = 0; last = null; active = false;
      if (!element!.hidden) element!.hidden = true;
      element!.dataset.moving = "false";
      element!.dataset.step = "0";
    }
    function inspectModal() {
      blocked = document.documentElement.hasAttribute("data-swarm-active") || document.documentElement.style.overflow === "hidden" || Array.from(document.querySelectorAll('[aria-modal="true"], dialog[open]')).some(modal => modal.getClientRects().length > 0);
      if (blocked) hide();
    }
    const directions = ["e", "se", "s", "sw", "w", "nw", "n", "ne"];
    function render() {
      position.current = { x, y };
      element!.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
      element!.dataset.direction = directions[gait.current.direction];
      if (element!.dataset.chatting && speech.current) placeSpeech(element!, speech.current);
    }
    type State = "walk" | "alert" | "idle" | "look" | "groom" | "tired" | "sleep";
    let state: State = "idle";
    let resting = 0;
    let alertTicks = 0;
    function setState(value: State) {
      state = value;
      element!.dataset.state = value;
      element!.dataset.moving = String(value === "walk");
    }
    function paint(time: number) {
      frame = 0;
      // One logical tick at most, even after a suspended or stalled frame.
      if (last === null) last = time;
      if (time - last >= 100) {
        last += Math.floor((time - last) / 100) * 100;
        const dx = targetX - (x + 20), dy = targetY - (y + 20);
        const distance = Math.hypot(dx, dy);
        if (distance > 48.001) {
          if (state === "alert") {
            alertTicks++;
          } else if (resting >= 200) {
            setState("alert");
            alertTicks = 0;
            resting = 0;
          }
          if (state !== "alert" || alertTicks >= 6) {
            const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
            const previous = gait.current.direction * 45;
            const difference = Math.abs((angle - previous + 540) % 360 - 180);
            if (difference > 32.5) gait.current.direction = Math.round(angle / 45) % 8;
            const travel = Math.min(10, distance - 48);
            x = clamp(x + dx / distance * travel, innerWidth);
            y = clamp(y + dy / distance * travel, innerHeight);
            gait.current.step = 1 - gait.current.step;
            element!.dataset.step = String(gait.current.step);
            resting = 0;
            setState(distance - travel <= 48.001 ? "idle" : "walk");
          }
        } else {
          resting += 100;
          alertTicks = 0;
          setState(resting < 2000 ? "idle" : resting < 3000 ? "look" : resting < 4000 ? "groom" : resting < 20000 ? "idle" : resting < 20800 ? "tired" : "sleep");
        }
        element!.dataset.idleStep = String(Math.floor(Math.max(0, resting - 20800) / 400) % 2);
        element!.dataset.blink = String(state === "idle" && resting >= 4000 && resting % 4000 < 200);
        render();
      }
      frame = requestAnimationFrame(paint);
    }
    function move(event: PointerEvent) {
      if (!media.matches || event.pointerType !== "mouse" || blocked || document.hidden) { hide(); return; }
      targetX = event.clientX;
      targetY = event.clientY;
      if (!active) {
        x = clamp(position.current?.x ?? (event.clientX < innerWidth / 2 ? 8 : innerWidth - 48), innerWidth);
        y = clamp(position.current?.y ?? (innerHeight - 48), innerHeight);
        active = true;
        resting = 0; alertTicks = 0;
        setState("idle");
        element!.dataset.blink = "false";
        element!.dataset.idleStep = "0";
        render();
      }
      element!.hidden = false;
      if (!frame) frame = requestAnimationFrame(paint);
    }
    function leave(event: PointerEvent) { if (event.relatedTarget === null) hide(); }
    function navigation(event: MouseEvent) {
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (link instanceof HTMLAnchorElement && link.origin === location.origin && link.pathname !== location.pathname) hide();
    }
    const observer = new MutationObserver(inspectModal);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-modal", "open", "hidden"] });
    const rootObserver = new MutationObserver(inspectModal);
    rootObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "data-swarm-active"] });
    inspectModal();
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerout", leave);
    window.addEventListener("blur", hide);
    window.addEventListener("resize", hide);
    window.addEventListener("popstate", hide);
    document.addEventListener("click", navigation, true);
    media.addEventListener("change", hide);
    return () => {
      hide(); observer.disconnect(); rootObserver.disconnect();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", leave);
      window.removeEventListener("blur", hide);
      window.removeEventListener("resize", hide);
      window.removeEventListener("popstate", hide);
      document.removeEventListener("click", navigation, true);
      media.removeEventListener("change", hide);
    };
  }, [stored, selection, open, visible, reduce, pathname]);

  return <CompanionContext value={{ selection, open, setOpen, choose: choice => {
    publish(choice);
    try { localStorage.setItem("czar-pet", choice); } catch { /* In-memory selection remains usable. */ }
  } }}>
    {children}
    <div ref={follower} className={styles.follower} hidden data-cursor-companion={selection}>
      {selection !== "off" && <button type="button" className={styles.companionButton} aria-label={`Talk to ${names[selection]}`} onClick={talk}><Character kind={selection} /></button>}
      <span ref={speech} className={styles.speech} role="status" aria-live="polite" aria-atomic="true" />
    </div>
  </CompanionContext>;
}
