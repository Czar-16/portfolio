"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useInteraction } from "@/components/interaction-provider";
import { playComicHit } from "@/lib/comic-hit-sound";
import styles from "./profile-avatar.module.css";

const hoverQuips = [
  "Debug. Deploy. Repeat.",
  "404: boring not found.",
  "Code. Break. Improve.",
  "Works on my branch.",
  "Code. Refine. Repeat.",
  "Curious by default.",
  "It compiled. Don't ask.",
  "My bugs have side quests.",
  "final_final_v7.tsx",
];

const shoutLines = [
  "ONE MORE!",
  "SHIP IT!",
  "IT WORKS!",
  "COFFEE TIME!",
  "BUILD PASSED!",
  "MERGED TO MAIN!",
  "BUG? FEATURE!",
  "IT'S ALWAYS DNS!",
  "REBOOT? AGAIN?",
];

export function ProfileAvatar() {
  const { enabled } = useInteraction();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [burst, setBurst] = useState(false);
  const [notesEnabled, setNotesEnabled] = useState(true);
  const [quipIndex, setQuipIndex] = useState(0);
  const [shoutIndex, setShoutIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHovering = hovered || focused;
  const [touchCycle, setTouchCycle] = useState(false);

  useEffect(() => {
    const touch = window.matchMedia("(hover: none), (pointer: coarse)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setTouchCycle(touch.matches && !motion.matches);
    update();
    touch.addEventListener("change", update);
    motion.addEventListener("change", update);
    return () => {
      touch.removeEventListener("change", update);
      motion.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!notesEnabled || !touchCycle || burst || isHovering) return;
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timeout = setTimeout(() => {
        setQuipIndex((index) => {
          const offset = 1 + Math.floor(Math.random() * (hoverQuips.length - 1));
          return (index + offset) % hoverQuips.length;
        });
        schedule();
      }, 4000 + Math.random() * 1000);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, [notesEnabled, touchCycle, burst, isHovering]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const showQuip = () => {
    setQuipIndex((index) => {
      if (hoverQuips.length < 2) return index;
      const offset = 1 + Math.floor(Math.random() * (hoverQuips.length - 1));
      return (index + offset) % hoverQuips.length;
    });
  };

  const showShout = () => {
    setShoutIndex((index) => (index + 1) % shoutLines.length);
    setBurst(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setBurst(false);
      timer.current = null;
    }, 1800);
  };

  const mode = burst ? "burst" : "hover";
  const open = burst || (notesEnabled && (isHovering || touchCycle));

  return (
    <span
      className={styles.avatarWrap}
    >
      <button
        type="button"
        className={styles.avatarButton}
        data-click-sound="off"
        onClick={() => { showShout(); if (enabled) void playComicHit(); }}
        onMouseEnter={() => { if (notesEnabled) { showQuip(); setHovered(true); } }}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => { if (notesEnabled) showQuip(); setFocused(true); }}
        onBlur={() => setFocused(false)}
        aria-label="Anoop Jha’s profile picture. Hover for a note or activate for a shout."
      >
        <Image
          src="/profile/profile.jpg"
          alt=""
          width={64}
          height={64}
          preload
          className={styles.avatar}
        />
      </button>
      <button
        type="button"
        className={styles.noteToggle}
        data-click-sound="off"
        aria-pressed={notesEnabled}
        aria-label={notesEnabled ? "Turn profile notes off" : "Turn profile notes on"}
        title={notesEnabled ? "Turn profile notes off" : "Turn profile notes on"}
        onClick={() => setNotesEnabled((enabled) => !enabled)}
      >
        {notesEnabled ? "ON" : "OFF"}
      </button>
      <span
        className={styles.popup}
        data-open={open}
        data-mode={mode}
        role="status"
        aria-live="polite"
      >
        <span className={styles.hoverGroup}>
          <span className={styles.bubble}>{hoverQuips[quipIndex]}</span>
          <span className={styles.tail} aria-hidden="true" />
        </span>
        <span className={styles.burstGroup}>
          <span className={styles.lines} aria-hidden="true" />
          <span className={styles.burstShape}>
            <span className={styles.burstTone} aria-hidden="true" />
            <span className={styles.message}>{shoutLines[shoutIndex]}</span>
          </span>
          <span className={styles.sfx} aria-hidden="true">ドン!</span>
        </span>
      </span>
    </span>
  );
}
