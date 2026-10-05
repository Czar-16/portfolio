"use client";

import { spotifyPlaylist } from "@/data/spotifyPlaylist";
import { GracefulImage } from "@/components/graceful-image";


export function PlaylistCard() {
  return (
    <section className="shell py-10 sm:py-12">
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#05080c]">
        {/* Section header */}
        <div className="flex flex-col gap-4 border-b border-white/[0.08] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3b9cff] shadow-[0_0_8px_rgba(59,156,255,0.8)]" />

              <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                The soundtrack behind the things I build.
              </h2>
            </div>

            <p className="mt-1.5 text-sm text-white/40">
              Listen to the full playlist → Tune in → opens on Spotify.
            </p>
          </div>

          <a
            href={spotifyPlaylist.url}
            target="_blank"
            rel="noopener noreferrer"
            className="interactive inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-[#3b9cff]/30 bg-[#3b9cff]/10 px-4 text-sm font-medium text-[#5eacff] hover:border-[#3b9cff]/50 hover:bg-[#3b9cff]/15 hover:text-white"
          >
            Deploy the vibes
            <span className="interaction-arrow ml-1.5">↗</span>
          </a>
        </div>

        {/* Player */}
        <div className="p-2 sm:p-3">
          <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#080c12]">
            {/* Playlist hero */}
            <div className="flex flex-col gap-6 bg-gradient-to-b from-[#111d2e] via-[#0b131f] to-[#080c12] p-5 sm:flex-row sm:items-end sm:p-6">
              {/* Playlist cover */}
              <div className="mx-auto shrink-0 sm:mx-0">
                <div className="relative h-40 w-40 overflow-hidden rounded-lg border border-white/[0.1] bg-[#111923] shadow-2xl sm:h-48 sm:w-48">
                  <GracefulImage
                    src={spotifyPlaylist.image}
                    alt={`${spotifyPlaylist.name ?? "Playlist"} cover`}
                    sizes="(min-width: 640px) 192px, 160px"
                    className="object-cover"
                    fallbackLabel="Playlist cover"
                  />
                </div>
              </div>

              {/* Playlist information */}
              <div className="min-w-0 flex-1">
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-white/35">
                  Playlist
                </p>

                <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {spotifyPlaylist.name ?? "CodeKarleBSDk"}
                </h3>

                <p className="mt-2 text-sm text-white/40">
                  {spotifyPlaylist.owner ?? "Czar16"} · 100+ tracks
                </p>

                {/* Play button */}
                <div className="mt-5 flex items-center gap-3">
                  <a
                    href={spotifyPlaylist.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open playlist on Spotify"
                    className="interactive flex h-11 w-11 items-center justify-center rounded-full bg-[#3b9cff] text-black shadow-[0_0_24px_rgba(59,156,255,0.25)] hover:bg-[#5eacff]"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="ml-0.5 h-4 w-4"
                      fill="currentColor"
                    >
                      <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10-6.86a1 1 0 0 0 0-1.68l-10-6.86A1 1 0 0 0 8 5.14Z" />
                    </svg>
                  </a>

                  <span className="text-xs text-white/30">
                    Opens in Spotify
                  </span>
                </div>
              </div>

              {/* Spotify icon */}
              <div className="hidden self-start text-white/25 sm:block">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="currentColor"
                >
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm4.59 14.36a.75.75 0 0 1-1.03.25c-2.82-1.72-6.37-2.11-10.56-1.15a.75.75 0 1 1-.34-1.46c4.58-1.05 8.5-.6 11.67 1.34a.75.75 0 0 1 .26 1.02Zm1.38-3.07a.94.94 0 0 1-1.29.31c-3.23-1.99-8.15-2.57-11.97-1.4a.94.94 0 1 1-.55-1.8c4.36-1.32 9.78-.68 13.5 1.61a.94.94 0 0 1 .31 1.28Zm.12-3.2C14.22 7.9 8.13 7.7 4.58 8.78a1.13 1.13 0 0 1-.66-2.16c4.08-1.24 10.87-1 15.01 1.46a1.13 1.13 0 1 1-1.15 1.95Z" />
                </svg>
              </div>
            </div>

            {/* Full playlist link */}
            <div className="flex items-center justify-center border-t border-white/[0.06] bg-white/[0.015] px-4 py-3">
              <a
                href={spotifyPlaylist.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-[#5eacff] transition-colors hover:text-white"
              >
                Hear what fuels the code →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
