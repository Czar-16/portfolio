"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useReducedMotion } from "@/components/use-reduced-motion";
import { useDocumentVisible } from "@/components/use-document-visible";

const TRACK_URI = "spotify:track:6Ec5LeRzkisa5KJtwLfOoW"; // Am I Dreaming - Metro Boomin, A$AP Rocky, Roisee
const SHOW_EMBED = false;

interface SpotifyEmbedController {
  togglePlay: () => void;
  addListener: (
    event: "playback_update",
    cb: (e: { data: { isPaused: boolean } }) => void,
  ) => void;
  destroy?: () => void;
}

interface SpotifyIframeApi {
  createController: (
    element: HTMLElement,
    options: { uri: string; width: number; height: number },
    callback: (controller: SpotifyEmbedController) => void,
  ) => void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
  }
}

type Props = {
  title?: string;
  artist?: string;
  cover?: string;
  lastPlayed?: string;
};

const bars = [
  6, 10, 14, 9, 18, 28, 16, 22, 32, 24, 36, 28, 20, 26, 34, 22, 16, 24, 18, 12,
  8, 14, 10, 6,
];

export function SpotifyCard({
  title = "Am I Dreaming",
  artist = "Metro Boomin, A$AP Rocky, Roisee",
  cover = "https://picsum.photos/seed/amidreaming/300/300",
  lastPlayed = "2 minutes ago",
}: Props) {
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<SpotifyEmbedController | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef);
  const reduce = useReducedMotion();
  const visible = useDocumentVisible();
  const animateBars = playing && inView && visible && !reduce;

  useEffect(() => {
    const SCRIPT_ID = "spotify-iframe-api";
    let cancelled = false;
    const host = hostRef.current;
    if (!host) return;

    const mountEl = document.createElement("div");
    host.appendChild(mountEl);

    const init = (api: SpotifyIframeApi) => {
      if (cancelled) return;
      api.createController(
        mountEl,
        { uri: TRACK_URI, width: 300, height: 80 },
        (controller) => {
          if (cancelled) {
            controller.destroy?.();
            return;
          }
          ctrlRef.current = controller;
          controller.addListener("playback_update", (e) =>
            setPlaying(!e.data.isPaused),
          );
          setReady(true);
        },
      );
    };

    const prev = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (api) => {
      prev?.(api);
      init(api);
    };

    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
      window.onSpotifyIframeApiReady = prev;
      ctrlRef.current?.destroy?.();
      ctrlRef.current = null;
      if (mountEl.parentNode) mountEl.parentNode.removeChild(mountEl);
      setReady(false);
    };
  }, []);

  return (
    <div ref={cardRef} className="card-lift relative w-full rounded-xl border border-white/15 bg-black/55 backdrop-blur-md">
      <div
        ref={hostRef}
        aria-hidden="true"
        className={
          SHOW_EMBED
            ? "absolute bottom-2 left-2 z-10 h-20 w-[300px] overflow-hidden rounded-md"
            : "pointer-events-none absolute h-20 w-[300px] overflow-hidden opacity-0"
        }
        style={SHOW_EMBED ? undefined : { left: 0, top: 0 }}
      />

      <div className="flex items-center gap-4 p-3 sm:p-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-linear-to-br from-red-600/70 to-neutral-900 md:h-[68px] md:w-17">
          {cover && (
            <Image
              src={cover}
              alt=""
              fill
              sizes="68px"
              className="object-cover"
            />
          )}
        </div>

        <div className="min-w-0 shrink-0">
          <p className="truncate text-sm font-semibold text-white md:text-lg">
            {title}
          </p>
          <p className="truncate text-xs text-white/70 md:text-base">
            {artist}
          </p>
        </div>

        <div
          className="ml-auto hidden h-10 items-center gap-[3px] sm:flex"
          aria-hidden="true"
        >
          {bars.map((h, i) => (
            <motion.span
              key={i}
              className="w-[3px] rounded-full bg-accent"
              style={{ height: h }}
              animate={animateBars ? { height: [h, h * 0.45, h] } : { height: h }}
              transition={
                animateBars
                  ? { duration: 0.9, repeat: Infinity, delay: i * 0.04 }
                  : { duration: reduce ? 0 : 0.2 }
              }
            />
          ))}
        </div>

        <svg
          viewBox="0 0 24 24"
          className="ml-auto h-8 w-8 shrink-0 sm:ml-2 md:h-10 md:w-10"
          aria-label="Spotify"
        >
          <circle cx="12" cy="12" r="12" fill="#1ED760" />
          <path
            d="M5.5 8.6c4.2-1.2 9-.9 13 1.3"
            stroke="#000"
            strokeWidth="1.9"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M6.2 12.1c3.6-1 7.5-.7 10.8 1.1"
            stroke="#000"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M7 15.3c3-.8 6-.5 8.6.9"
            stroke="#000"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-white/70 md:text-sm">
          <span className="h-2 w-2 rounded-full bg-[#1ED760] shadow-[0_0_8px_rgba(30,215,96,0.7)]" />
          Last played on Spotify • {lastPlayed}
        </div>

        <div className="flex items-center gap-3 text-white">
          <button
            type="button"
            aria-label="Previous"
            aria-disabled="true"
            className="p-1 opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M6 5h2v14H6zM20 5v14L9 12z" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={playing ? "Pause" : "Play"}
            aria-disabled={!ready}
            onClick={() => ctrlRef.current?.togglePlay()}
            className="interactive grid h-10 w-10 place-items-center rounded-full bg-white/25 hover:bg-white/35 disabled:opacity-50"
            disabled={!ready}
          >
            <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={playing ? "pause" : "play"}
              initial={reduce ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduce ? 1 : 0.85 }}
              transition={{ duration: reduce ? 0 : 0.12 }}
              className="flex items-center justify-center"
            >
            {playing ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            </motion.span>
            </AnimatePresence>
          </button>
          <button
            type="button"
            aria-label="Next"
            aria-disabled="true"
            className="p-1 opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
