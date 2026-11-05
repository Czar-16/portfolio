"use client";

import { useEffect, useRef } from "react";
import styles from "./swarm-tour.module.css";

const SEEN = "czar-swarm-seen";
const MUSIC_VOLUME = "czar-swarm-music-volume";
const PACE = 1.2;
const CURSOR_FADE_MS = 180;
const COLORS = ["#f06478", "#9975ed", "#3c9de8", "#20ac9b", "#d49a27", "#ed8054", "#c866c0", "#6ca944", "#e95ca1", "#637ce6", "#00a8bd", "#bc8538", "#af64e5", "#e26450", "#389a70", "#cfad32", "#7788ba", "#df7cb7"];
const TARGETS = [
  ".compact-toolbar > a", ".toolbar-controls > *", ".desktop-index nav a",
  "#profile img", "#profile h1", "#profile p", "#profile button", "#profile a",
  "[data-swarm-home] .section-heading", "#projects .project-preview", "#projects .project-title-row",
  "#projects .project-description", "#projects .project-footer", "#projects .interactive-card",
  "#github > *", "#leetcode > *", "#tech-stack h2", "#tech-stack li", "#posts > *",
  "#spotify > *", "#watch .watch-card", "#terminal > *", "#contact p", "#contact a", "#contact button",
  '[data-swarm-home] section[aria-label="Portfolio visitors"] > div',
  ".closing-quote blockquote", ".closing-quote > p",
].join(",");
type Point = { x: number; y: number };
type Line = { top: number; bottom: number; left: number; ends: number[] };
type Task = {
  element: HTMLElement; kind: "type" | "image" | "box" | "border";
  x: number; y: number; width: number; height: number; fixed: boolean;
  clip: string; priority: string; geometryKey: string; lines: Line[]; visible: boolean; nearby: boolean;
  elapsed: number; duration: number; done: boolean; owner: number | null;
  dependency?: Task;
};
type Cursor = Point & {
  task: Task | null; from: Point; bend: number; started: number; travel: number;
  phase: "idle" | "travel" | "work"; speed: number; ready: number; opacity: number;
};
const clamp = (n: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));
const ease = (n: number) => n * n * (3 - 2 * n);

// Cache text geometry once per layout, without wrapping or replacing real DOM.
function textLines(element: HTMLElement, box: DOMRect): Line[] {
  const lines: Line[] = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.parentElement?.closest('svg, .sr-only, [aria-hidden="true"]')) continue;
    for (let i = 0; i < (node.textContent?.length ?? 0); i++) {
      range.setStart(node, i); range.setEnd(node, i + 1);
      const rect = range.getBoundingClientRect();
      if (!rect.height || !rect.width) continue;
      let line = lines.find(line => Math.abs(line.top - (rect.top - box.top)) < 4);
      if (!line) { line = { top: rect.top - box.top, bottom: rect.bottom - box.top, left: rect.left - box.left, ends: [] }; lines.push(line); }
      line.bottom = Math.max(line.bottom, rect.bottom - box.top);
      line.ends.push(rect.right - box.left);
    }
  }
  return lines.sort((a, b) => a.top - b.top);
}

export function SwarmTour() {
  const layer = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const replay = useRef<HTMLButtonElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const musicButton = useRef<HTMLButtonElement>(null);
  const volumePanel = useRef<HTMLDivElement>(null);
  const volumeSlider = useRef<HTMLInputElement>(null);
  const volumeValue = useRef<HTMLOutputElement>(null);
  const muteButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const overlay = layer.current!;
    const surface = canvas.current!;
    const skipButton = skip.current!;
    const replayButton = replay.current!;
    const music = audio.current!;
    const musicControl = musicButton.current!;
    const panel = volumePanel.current!;
    const slider = volumeSlider.current!;
    const value = volumeValue.current!;
    const mute = muteButton.current!;
    let context: CanvasRenderingContext2D | null;
    try { context = surface.getContext("2d"); } catch { return; }
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = matchMedia("(hover: hover) and (pointer: fine)");
    if (!context) return;
    const ctx = context;
    let tasks: Task[] = [];
    let cursors: Cursor[] = [];
    let frame = 0, clock = 0, last = 0, ending: number | null = null;
    let viewportDoneAt: number | null = null;
    let scrollTravel: { from: number; to: number; started: number } | null = null;
    let running = false, disposed = false, dirty = false, blocked = false;
    let musicAttempt = 0, musicFailed = false, musicBlocked = false;
    let volume = 0.6, muted = false;
    try { const saved = Number(localStorage.getItem(MUSIC_VOLUME)); if (Number.isFinite(saved) && saved >= 0 && saved <= 1 && localStorage.getItem(MUSIC_VOLUME) !== null) volume = saved; } catch {}
    function updateMusicUI() {
      music.volume = volume; music.muted = muted;
      slider.value = String(Math.round(volume * 100));
      value.value = `${Math.round(volume * 100)}%`;
      mute.textContent = muted ? "Unmute" : "Mute";
      mute.setAttribute("aria-pressed", String(muted));
      musicControl.setAttribute("aria-label", musicBlocked ? "Enable music" : "Music volume");
      musicControl.setAttribute("aria-expanded", String(!panel.hidden));
      musicControl.textContent = musicBlocked ? "Enable music" : muted || volume === 0 ? "♪ Off" : "♫ Music";
      musicControl.hidden = musicFailed || !running;
    }
    function stopMusic() { musicAttempt++; music.pause(); try { music.currentTime = 0; } catch {} panel.hidden = true; }
    async function playMusic(seek = false) {
      if (!running || musicFailed || blocked || document.hidden) return;
      const attempt = ++musicAttempt;
      try {
        if (seek) music.currentTime = clock / 1000;
        await music.play();
        if (attempt !== musicAttempt || !running || blocked || document.hidden) { music.pause(); return; }
        musicBlocked = false; updateMusicUI();
      } catch {
        if (attempt !== musicAttempt || !running) return;
        if (music.error) musicFailed = true; else musicBlocked = true;
        updateMusicUI();
      }
    }
    updateMusicUI();
    let width = innerWidth, height = innerHeight;
    let intersection: IntersectionObserver | null = null;
    let startupInteraction = false;
    const decorations: { task: Task; until: number }[] = [];
    const startupEvents = ["pointerdown", "touchstart", "wheel", "keydown"] as const;
    const beforeStart = () => { startupInteraction = true; };
    startupEvents.forEach(event => window.addEventListener(event, beforeStart, { passive: true, capture: true }));
    function clearStartup() { startupEvents.forEach(event => window.removeEventListener(event, beforeStart, true)); }
    function restore(task: Task) {
      if (task.kind !== "border") {
        if (task.clip) task.element.style.setProperty("clip-path", task.clip, task.priority);
        else task.element.style.removeProperty("clip-path");
        task.element.removeAttribute("data-swarm-pending");
      }
      task.done = true;
      if (task.owner !== null) { cursors[task.owner].task = null; cursors[task.owner].phase = "idle"; }
      task.owner = null;
    }
    function available() { return !reduced.matches && pointer.matches; }
    function finish() {
      running = false; scrollTravel = null;
      stopMusic(); updateMusicUI();
      cancelAnimationFrame(frame); frame = 0; last = 0;
      intersection?.disconnect(); intersection = null;
      resizeObserver.disconnect();
      tasks.forEach(restore);
      decorations.length = 0;
      delete root.dataset.swarmActive;
      overlay.dataset.mode = "inactive";
      surface.hidden = true;
      replayButton.hidden = !available();
      ctx.clearRect(0, 0, width, height);
    }
    function measure() {
      for (const task of tasks) {
        const box = task.element.getBoundingClientRect();
        task.x = box.left; task.y = box.top + (task.fixed ? 0 : scrollY);
        task.width = box.width; task.height = box.height;
        const geometryKey = `${box.width}:${box.height}:${task.element.textContent}`;
        if (task.kind === "type" && geometryKey !== task.geometryKey) task.lines = textLines(task.element, box);
        task.geometryKey = geometryKey;
      }
      dirty = false;
    }
    function screen(task: Task) { return { x: task.x, y: task.y - (task.fixed ? 0 : scrollY) }; }
    function workPoint(task: Task, p: number): Point {
      const { x, y } = screen(task);
      if (task.kind === "type" && task.lines.length) {
        const total = task.lines.reduce((n, line) => n + line.ends.length, 0);
        let character = Math.floor(clamp(p) * Math.max(0, total - 1));
        for (const line of task.lines) {
          if (character < line.ends.length) return { x: x + (p === 0 ? line.left : line.ends[character]), y: y + line.bottom };
          character -= line.ends.length;
        }
      }
      if (task.kind === "border") {
        const perimeter = 2 * (task.width + task.height);
        const distance = clamp(p / 0.8) * perimeter;
        if (distance < task.width) return { x: x + distance, y };
        if (distance < task.width + task.height) return { x: x + task.width, y: y + distance - task.width };
        if (distance < 2 * task.width + task.height) return { x: x + 2 * task.width + task.height - distance, y: y + task.height };
        return { x, y: y + perimeter - distance };
      }
      return task.kind === "image" ? { x: x + task.width, y: y + task.height * ease(p) } : { x: x + task.width * p, y: y + task.height };
    }
    function reveal(task: Task, p: number) {
      if (task.kind === "border") return;
      if (task.kind === "type" && task.lines.length) {
        const caret = workPoint(task, p), origin = screen(task);
        const line = task.lines.find(line => Math.abs(origin.y + line.bottom - caret.y) < 1)!;
        // Completed lines remain fully visible; only the current line types.
        const x = clamp(caret.x - origin.x, 0, task.width);
        const top = Math.max(0, line.top), bottom = Math.min(task.height, line.bottom + 2);
        task.element.style.setProperty("clip-path", `polygon(0 0,100% 0,100% ${top}px,${x}px ${top}px,${x}px ${bottom}px,0 ${bottom}px)`, "important");
      } else {
        task.element.style.setProperty("clip-path", task.kind === "image" ? `inset(0 0 ${(1 - ease(p)) * 100}% 0)` : `inset(0 ${(1 - ease(p)) * 100}% 0 0)`, "important");
      }
    }
    function selection(task: Task, p: number, opacity: number) {
      const { x, y } = screen(task), w = task.width, h = task.height;
      ctx.save(); ctx.globalAlpha = opacity; ctx.strokeStyle = "#438dff"; ctx.fillStyle = "#438dff"; ctx.lineWidth = 1;
      if (task.kind === "border") {
        ctx.beginPath(); ctx.moveTo(x, y);
        let pathX = x, pathY = y;
        let distance = Math.min(1, p / 0.8) * 2 * (w + h);
        for (const [dx, dy, length] of [[w, 0, w], [0, h, h], [-w, 0, w], [0, -h, h]]) {
          const fraction = Math.min(1, distance / Math.max(1, length));
          if (distance > 0) ctx.lineTo(pathX + dx * fraction, pathY + dy * fraction);
          pathX += dx; pathY += dy; distance -= length;
        }
        ctx.stroke();
      } else ctx.strokeRect(x - 2, y - 2, w + 4, h + 4);
      if (task.kind === "border" || task.kind === "box") {
        for (const [cx, cy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) { ctx.fillStyle = "#fff"; ctx.fillRect(cx - 2, cy - 2, 4, 4); ctx.strokeRect(cx - 2, cy - 2, 4, 4); }
        if (p < 0.35 || p > 0.8) {
          ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(x - 22, y); ctx.lineTo(x + w + 22, y); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = "#438dff"; ctx.fillRect(x + w - 79, y - 21, 79, 16); ctx.fillStyle = "#fff"; ctx.font = "10px monospace"; ctx.fillText(`${Math.round(w)} × ${Math.round(h)}`, x + w - 75, y - 9);
        }
      }
      ctx.restore();
    }
    function drawCursor(cursor: Cursor, index: number) {
      let tool = cursor.phase === "work" ? cursor.task?.kind : null;
      if (tool === "border" && cursor.task && cursor.task.elapsed / cursor.task.duration > 0.8) tool = "box";
      ctx.save(); ctx.translate(cursor.x, cursor.y); ctx.strokeStyle = "#fff"; ctx.fillStyle = COLORS[index]; ctx.lineWidth = 1.4;
      if (tool === "type") {
        ctx.strokeStyle = COLORS[index]; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(0, 1); ctx.moveTo(-4, -16); ctx.lineTo(4, -16); ctx.moveTo(-4, 1); ctx.lineTo(4, 1); ctx.stroke();
      } else if (tool === "image" || tool === "border") {
        ctx.strokeStyle = COLORS[index]; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(9, 0); ctx.moveTo(0, -9); ctx.lineTo(0, 9); ctx.stroke();
      } else if (tool === "box") {
        ctx.strokeStyle = COLORS[index]; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-7, -7); ctx.lineTo(7, 7); ctx.moveTo(-7, -2); ctx.lineTo(-7, -7); ctx.lineTo(-2, -7); ctx.moveTo(2, 7); ctx.lineTo(7, 7); ctx.lineTo(7, 2); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(3, 19); ctx.lineTo(8, 13); ctx.lineTo(13, 22); ctx.lineTo(17, 19); ctx.lineTo(12, 11); ctx.lineTo(20, 9); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      ctx.restore();
    }
    function schedule() { if (running && !frame && !document.hidden) frame = requestAnimationFrame(tick); }
    function tick(now: number) {
      frame = 0;
      if (!running || document.hidden) { last = 0; return; }
      try {
        const elapsed = last ? Math.max(0, now - last) : 0; last = now;
        if (blocked) { schedule(); return; }
        clock += elapsed;
        const physics = Math.min(elapsed, 40);
        if (dirty) measure();
        if (scrollTravel) {
          const p = clamp((clock - scrollTravel.started) / (850 * PACE));
          window.scrollTo({ top: scrollTravel.from + (scrollTravel.to - scrollTravel.from) * ease(p), behavior: "instant" });
          if (p === 1) scrollTravel = null;
        }
        for (const task of tasks) {
          const box = screen(task);
          task.visible = task.nearby && box.y < height && box.y + task.height > 50 && task.x < width && task.x + task.width > 0;
          if (!task.element.isConnected || task.height === 0) restore(task);
        }
        ctx.clearRect(0, 0, width, height);
        ctx.globalAlpha = ending === null ? 1 : 1 - clamp((clock - ending) / 300);
        if (ending !== null) music.volume = volume * (1 - clamp((clock - ending) / 300));
        // An owner is released before assignment; an offscreen task keeps its reveal.
        for (const task of tasks) {
          if (!task.visible && task.owner !== null) {
            const cursor = cursors[task.owner]; cursor.task = null; cursor.phase = "idle"; task.owner = null;
          }
        }
        const ready = tasks.filter(task => !task.done && task.visible && task.width > 0 && task.height > 0 && task.owner === null && (!task.dependency || task.dependency.done));
        cursors.forEach((cursor, index) => {
          if (!cursor.task && clock >= cursor.ready && ending === null) {
            ready.sort((a, b) => {
              const score = (t: Task) => Math.hypot(cursor.x - t.x, cursor.y - screen(t).y) + (t.kind === "border" || /^H[1-3]$/.test(t.element.tagName) ? -700 : 0);
              return score(a) - score(b);
            });
            const task = ready.shift();
            if (task) {
              task.owner = index; cursor.task = task; cursor.phase = "travel";
              cursor.from = { x: cursor.x, y: cursor.y }; cursor.started = clock;
              const dest = workPoint(task, task.elapsed / task.duration);
              cursor.travel = clamp(Math.hypot(dest.x - cursor.x, dest.y - cursor.y) / cursor.speed, 250, 800) * PACE;
              cursor.bend = (index % 2 ? 1 : -1) * Math.min(100, cursor.travel / 6);
            }
          }
          const task = cursor.task;
          if (task) {
            let progress = clamp(task.elapsed / task.duration);
            if (cursor.phase === "travel") {
              const p = ease(clamp((clock - cursor.started) / cursor.travel));
              const dest = workPoint(task, progress);
              cursor.x = cursor.from.x + (dest.x - cursor.from.x) * p + Math.sin(p * Math.PI) * cursor.bend;
              cursor.y = cursor.from.y + (dest.y - cursor.from.y) * p - Math.sin(p * Math.PI) * Math.abs(cursor.bend) * 0.7;
              if (p === 1) cursor.phase = "work";
            } else {
              task.elapsed += elapsed; progress = clamp(task.elapsed / task.duration);
              const dest = workPoint(task, progress); cursor.x = dest.x; cursor.y = dest.y;
              reveal(task, progress);
              if (progress === 1) { decorations.push({ task, until: clock + 280 }); restore(task); }
            }
            if (cursor.phase === "work") { selection(task, progress, 0.65); }
          } else {
            // Golden-angle formation plus pairwise separation, never a parking column.
            // Spread idle cursors across the viewport instead of following the visitor.
            const column = index % 6, row = Math.floor(index / 6);
            let x = clamp(width * (column + 0.5 + (row % 2 ? 0.25 : 0)) / 6 + Math.sin(clock / 2200 + index * 2.4) * 24, 24, width - 34);
            let y = clamp(height * (row + 0.5) / 3 + Math.cos(clock / 2600 + index * 1.7) * 20, 80, height - 90);
            for (const other of cursors) {
              if (other === cursor) continue;
              const dx = cursor.x - other.x, dy = cursor.y - other.y, d = Math.hypot(dx, dy);
              if (d < 34 && d > 0) { x += dx / d * (34 - d); y += dy / d * (34 - d); }
            }
            const alpha = 1 - Math.exp(-physics / 180);
            cursor.x += (x - cursor.x) * alpha; cursor.y += (y - cursor.y) * alpha;
          }
          cursor.opacity = clamp(cursor.opacity + (cursor.task ? 1 : -1) * elapsed / CURSOR_FADE_MS);
          if (cursor.opacity > 0) {
            ctx.save(); ctx.globalAlpha *= cursor.opacity;
            drawCursor(cursor, index);
            ctx.restore();
          }
        });
        for (let i = decorations.length - 1; i >= 0; i--) {
          const d = decorations[i];
          if (clock >= d.until) decorations.splice(i, 1);
          else if (d.task.visible) { selection(d.task, 1, (d.until - clock) / 280 * 0.5); }
        }
        ctx.globalAlpha = 1;
        if (!scrollTravel && ending === null) {
          if (tasks.some(task => task.visible && !task.done)) viewportDoneAt = null;
          else if (viewportDoneAt === null) viewportDoneAt = clock;
          else if (clock - viewportDoneAt > 500) {
            const bottom = Math.max(0, root.scrollHeight - height);
            if (scrollY >= bottom - 2) {
              tasks.forEach(restore);
            } else {
              const below = tasks.filter(task => !task.done && !task.fixed && task.y >= scrollY + height - 30 && task.x < width && task.x + task.width > 0);
              const next = below.length ? Math.min(...below.map(task => task.y)) - 110 : bottom;
              scrollTravel = { from: scrollY, to: Math.min(bottom, Math.max(scrollY + height * 0.65, Math.min(next, scrollY + height * 0.85))), started: clock };
              viewportDoneAt = null;
            }
          }
        }
        if (tasks.every(task => task.done) && ending === null) ending = clock;
        if (ending !== null && clock - ending >= 300) { finish(); return; }
        schedule();
      } catch { finish(); }
    }
    function syncBlock() {
      const overflow = root.style.overflow, overflowY = root.style.overflowY;
      const wasBlocked = blocked;
      blocked = [overflow, overflowY].some(value => value === "hidden" || value === "clip") || Array.from(document.querySelectorAll('[aria-modal="true"],dialog[open]')).some(node => node.getClientRects().length > 0);
      if (blocked !== wasBlocked) { last = 0; if (blocked) { musicAttempt++; music.pause(); } else if (running && !musicBlocked && !musicFailed) void playMusic(true); }
    }
    const lockObserver = new MutationObserver(syncBlock);
    lockObserver.observe(root, { attributes: true, attributeFilter: ["style"] });
    lockObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-modal", "open"] });
    const resizeObserver = new ResizeObserver(() => { dirty = true; schedule(); });
    function preventScrollInput(event: Event) {
      if (!running || blocked) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    function key(event: KeyboardEvent) {
      if (event.key === "Escape") finish();
      else if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
        if (event.target === slider && ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End", "PageDown", "PageUp"].includes(event.key)) return;
        if (event.key === " " && event.target instanceof Element && overlay.contains(event.target) && event.target.closest("button")) return;
        preventScrollInput(event);
      }
    }
    function pointerDown(event: PointerEvent) {
      if (event.pointerType !== "mouse" || event.target === root || event.clientX >= root.clientWidth) preventScrollInput(event);
    }
    function focus(event: FocusEvent) {
      if (!running || !(event.target instanceof Element) || overlay.contains(event.target)) return;
      const focused = event.target;
      tasks.filter(task => !task.done && (task.element.contains(focused) || focused.contains(task.element))).forEach(restore);
    }
    function navigate(event: MouseEvent) {
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (link) finish();
    }
    function invalidate() { dirty = true; schedule(); }
    function visibility() {
      last = 0;
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; musicAttempt++; music.pause(); }
      else { schedule(); if (running && !blocked && !musicBlocked && !musicFailed) void playMusic(true); }
    }
    function mediaChange() { finish(); }
    function collect(): Task[] {
      const candidates = Array.from(document.querySelectorAll<HTMLElement>(TARGETS));
      // Break broad cards into image, text and controls; no overlapping masks.
      const leaves: HTMLElement[] = [];
      function split(element: HTMLElement, depth = 0) {
        if (element.matches('svg, .sr-only, [aria-hidden="true"]') || !element.getClientRects().length || !element.getBoundingClientRect().width || !element.getBoundingClientRect().height) return;
        const children = Array.from(element.children).filter((child): child is HTMLElement => child instanceof HTMLElement && !child.matches('svg, .sr-only, [aria-hidden="true"]'));
        if (depth < 5 && children.length && !element.matches('p,h1,h2,h3,h4,button,li,blockquote,.project-title-row') && !element.matches('.project-preview') && (element.getBoundingClientRect().height > 110 || element.matches('.section-heading,.project-footer'))) children.forEach(child => split(child, depth + 1));
        else leaves.push(element);
      }
      candidates.filter(element => !candidates.some(parent => parent !== element && parent.contains(element))).forEach(element => split(element));
      const create = (element: HTMLElement, kind: Task["kind"]): Task => ({ element, kind, x: 0, y: 0, width: 0, height: 0,
        fixed: !!element.closest(".site-header"), clip: element.style.getPropertyValue("clip-path"), priority: element.style.getPropertyPriority("clip-path"),
        geometryKey: "", lines: [], visible: false, nearby: false, elapsed: 0, duration: (kind === "border" ? 500 : kind === "type" ? clamp((element.textContent?.length ?? 0) * 20, 850, 2400) : 1150) * PACE,
        done: false, owner: null,
      });
      const result = [...new Set(leaves)].map(element => create(element, element.matches('img,.project-preview') || !!element.querySelector('img') ? "image" : element.textContent?.trim() ? "type" : "box"));
      const cards = new Map<HTMLElement, Task>();
      for (const task of result) {
        const card = task.element.closest<HTMLElement>('.project-card,.card,.interactive-card,.watch-card');
        if (!card || card === task.element) continue;
        let border = cards.get(card);
        if (!border) { border = create(card, "border"); cards.set(card, border); }
        task.dependency = border;
      }
      return [...cards.values(), ...result];
    }
    async function start(manual = false) {
      if (running || disposed || !available()) return;
      try {
        await document.fonts.ready;
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
        if (disposed || running || !available() || document.hidden) return;
        if (!manual && (startupInteraction || location.hash || scrollY > 4 || (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type === "back_forward" || document.activeElement?.matches('button,input,textarea,select,[contenteditable="true"]') || localStorage.getItem(SEEN) === "2")) return;
        // Storage and all initialization must succeed before any content is masked.
        localStorage.setItem(SEEN, "2");
        width = innerWidth; height = innerHeight;
        tasks = collect();
        if (!tasks.length) return;
        root.dataset.swarmReveals = "";
        measure();
        clock = 0; last = 0; ending = null;
        viewportDoneAt = null; scrollTravel = null;
        cursors = COLORS.map((_, i) => ({ x: width * 0.5 + Math.cos(i * 2.4) * 50, y: height + 35 + i * 6, task: null, from: { x: 0, y: 0 }, bend: 0, started: 0, travel: 0, phase: "idle", speed: i % 5 === 0 ? 2.5 : 0.7 + (i % 4) * 0.3, ready: 180 + i * 95, opacity: 0 }));
        const ratio = Math.min(devicePixelRatio || 1, 2);
        surface.width = width * ratio; surface.height = height * ratio; ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        const byElement = new Map<HTMLElement, Task[]>();
        intersection = new IntersectionObserver(entries => {
          for (const entry of entries) for (const task of byElement.get(entry.target as HTMLElement) ?? []) task.nearby = entry.isIntersecting;
          schedule();
        });
        for (const task of tasks) {
          // Observe an unmasked parent: a target's own clip must not pause it.
          const observed = task.element.parentElement ?? task.element;
          const group = byElement.get(observed) ?? []; group.push(task); byElement.set(observed, group);
          if (task.kind !== "border") { task.element.dataset.swarmPending = ""; task.element.style.setProperty("clip-path", "inset(0 100% 0 0)", "important"); }
        }
        for (const element of byElement.keys()) intersection.observe(element);
        root.dataset.swarmActive = "";
        overlay.dataset.mode = "auto"; surface.hidden = false; replayButton.hidden = true;
        running = true; musicFailed = false; musicBlocked = false; panel.hidden = true; music.volume = volume; updateMusicUI(); syncBlock();
        void playMusic();
        resizeObserver.observe(document.querySelector('[data-swarm-home]')!);
        for (const task of tasks) resizeObserver.observe(task.element);
        schedule();
      } catch { finish(); }
      finally { clearStartup(); }
    }
    const replayClick = () => { window.scrollTo({ top: 0, behavior: "instant" }); void start(true); };
    const musicClick = () => { if (musicBlocked) void playMusic(true); panel.hidden = false; updateMusicUI(); };
    const volumeInput = () => { volume = Number(slider.value) / 100; music.volume = volume; value.value = `${slider.value}%`; try { localStorage.setItem(MUSIC_VOLUME, String(volume)); } catch {} updateMusicUI(); };
    const muteClick = () => { muted = !muted; updateMusicUI(); };
    const audioError = () => { musicFailed = true; musicAttempt++; music.pause(); panel.hidden = true; updateMusicUI(); };
    window.addEventListener("wheel", preventScrollInput, { passive: false, capture: true });
    window.addEventListener("touchmove", preventScrollInput, { passive: false, capture: true });
    window.addEventListener("pointerdown", pointerDown, true);
    window.addEventListener("keydown", key, true);
    window.addEventListener("scroll", invalidate, { passive: true, capture: true });
    window.addEventListener("resize", finish);
    window.addEventListener("pagehide", finish);
    window.addEventListener("popstate", finish);
    document.addEventListener("focusin", focus, true);
    document.addEventListener("click", navigate, true);
    document.addEventListener("visibilitychange", visibility);
    reduced.addEventListener("change", mediaChange); pointer.addEventListener("change", mediaChange);
    skipButton.addEventListener("click", finish); replayButton.addEventListener("click", replayClick);
    musicControl.addEventListener("click", musicClick); slider.addEventListener("input", volumeInput); mute.addEventListener("click", muteClick); music.addEventListener("error", audioError);
    replayButton.hidden = !available();
    void start();
    return () => {
      disposed = true; finish(); clearStartup(); lockObserver.disconnect();
      window.removeEventListener("wheel", preventScrollInput, true);
      window.removeEventListener("touchmove", preventScrollInput, true);
      window.removeEventListener("pointerdown", pointerDown, true);
      window.removeEventListener("keydown", key, true); window.removeEventListener("resize", finish);
      window.removeEventListener("scroll", invalidate, true);
      window.removeEventListener("pagehide", finish); window.removeEventListener("popstate", finish);
      document.removeEventListener("focusin", focus, true); document.removeEventListener("click", navigate, true);
      document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", mediaChange); pointer.removeEventListener("change", mediaChange);
      skipButton.removeEventListener("click", finish); replayButton.removeEventListener("click", replayClick);
      musicControl.removeEventListener("click", musicClick); slider.removeEventListener("input", volumeInput); mute.removeEventListener("click", muteClick); music.removeEventListener("error", audioError);
      delete root.dataset.swarmReveals;
    };
  }, []);

  return <div ref={layer} className={styles.layer} data-swarm-tour data-mode="inactive">
    <canvas ref={canvas} className={styles.canvas} aria-hidden="true" hidden />
    <audio ref={audio} src="/audio/swarm-background.mp3" preload="auto" aria-hidden="true" />
    <div className={styles.controls} role="group" aria-label="Animation controls">
      <button ref={skip} type="button" data-click-sound="off">Skip animation <kbd>Esc</kbd></button>
      <div className={styles.music}>
        <button ref={musicButton} type="button" aria-label="Music volume" aria-controls="swarm-volume-panel" aria-expanded="false" data-click-sound="off" hidden>♫ Music</button>
        <div ref={volumePanel} id="swarm-volume-panel" className={styles.volumePanel} hidden>
          <label htmlFor="swarm-volume">Volume</label><output ref={volumeValue} htmlFor="swarm-volume">60%</output>
          <input ref={volumeSlider} id="swarm-volume" type="range" min="0" max="100" defaultValue="60" aria-label="Music volume" />
          <button ref={muteButton} type="button" aria-pressed="false" data-click-sound="off">Mute</button>
        </div>
      </div>
      <a href="https://califa.github.io/swarm-site/" target="_blank" rel="noopener noreferrer" data-click-sound="off">Inspired by Joel Califa’s Swarm ↗</a>
    </div>
    <button ref={replay} className={styles.replay} type="button" data-click-sound="off" hidden>Replay animation</button>
  </div>;
}
