export const spotify = {
  title: "Am I Dreaming",
  artist: "Metro Boomin, A$AP Rocky, Roisee",
  album: "SPIDER-MAN: ACROSS THE SPIDER-VERSE (SOUNDTRACK)",
  artwork: "https://picsum.photos/seed/amidreaming/300/300",
  playedAtLabel: "Last played on Spotify",
  waveform: [
    0.22, 0.48, 0.72, 0.36, 0.86, 0.58, 0.3, 0.74, 0.94, 0.62, 0.4, 0.78, 0.5, 0.28, 0.66,
    0.88, 0.46, 0.34, 0.7, 0.96, 0.54, 0.32,
  ],
} as const;

export const spotifyPlaylist = {
  id: "6EkHI31eh6xZwZGmpmoXye",
  url: "https://open.spotify.com/playlist/6EkHI31eh6xZwZGmpmoXye?si=PdjSgK5LTx2qjief3xwAQQ",
} as const;

export type SpotifyTrack = typeof spotify;
