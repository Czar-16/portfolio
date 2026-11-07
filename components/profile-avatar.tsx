"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [burst, setBurst] = useState(false);
  const [quipIndex, setQuipIndex] = useState(0);
  const [shoutIndex, setShoutIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHovering = hovered || focused;

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
  const open = burst || isHovering;

  return (
    <span
      className={styles.avatarWrap}
      onMouseEnter={() => { showQuip(); setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        className={styles.avatarButton}
        onClick={showShout}
        onFocus={() => { showQuip(); setFocused(true); }}
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
