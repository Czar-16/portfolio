"use client";
import { spotifyPlaylist } from "@/data/spotifyPlaylist";
import { GracefulImage } from "@/components/graceful-image";
import styles from "./PlaylistCard.module.css";
export function PlaylistCard() {
  return <section id="spotify" className="section-frame">
    <h2>The soundtrack behind the things I build.</h2>
    <p className="mt-2 text-sm text-fg-secondary">Listen to the full playlist → Tune in → opens on Spotify.</p>
    <div className={`mt-5 flex items-center gap-4 p-4 ${styles.card}`}>
      <div className="relative size-20 shrink-0 overflow-hidden rounded border border-line"><GracefulImage src={spotifyPlaylist.image} alt={`${spotifyPlaylist.name} cover`} sizes="80px" className="object-cover" fallbackLabel="Playlist cover" /></div>
      <div className="min-w-0"><p className="text-[11px] text-fg-secondary">PLAYLIST</p><h3 className="mt-1 font-semibold">{spotifyPlaylist.name}</h3><p className="mt-1 text-xs text-fg-secondary">{spotifyPlaylist.owner ?? "Czar16"} · 100+ tracks</p></div>
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-3"><a href={spotifyPlaylist.url} target="_blank" rel="noopener noreferrer" aria-label="Open playlist on Spotify" className="inline-flex min-h-8 items-center justify-center gap-2 rounded-md border border-line bg-card px-3 py-1.5 text-[13px] font-medium text-fg-secondary hover:border-line-strong hover:bg-card-elevated hover:text-fg">▶ Deploy the vibes ↗</a><span className="text-xs text-fg-secondary">Opens in Spotify</span></div>
  </section>;
}
