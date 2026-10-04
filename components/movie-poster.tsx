"use client";

import { useState } from "react";
import Image from "next/image";

function initials(title: string) {
  return title
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export function MoviePoster({
  slug,
  title,
  rank,
  className = "",
}: {
  slug: string;
  title: string;
  rank: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`relative flex w-full items-center justify-center overflow-hidden border border-line bg-bg-soft ${className}`}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--accent) 25%, transparent 25%, transparent 50%, var(--accent) 50%, var(--accent) 75%, transparent 75%)",
            backgroundSize: "18px 18px",
          }}
        />
        <span className="relative font-mono text-2xl font-semibold tracking-tight text-fg-muted">
          {initials(title) || "Poster"}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden border border-line bg-bg-soft ${className}`}
    >
      <Image
        src={`/movies/${slug}.jpg`}
        alt={`${title} poster`}
        fill
        sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, (min-width: 640px) 45vw, 90vw"
        className="object-cover"
        onError={() => setFailed(true)}
      />
      <span className="sr-only">{rank}</span>
    </div>
  );
}