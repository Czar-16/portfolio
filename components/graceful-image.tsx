"use client";

import { useState } from "react";
import Image from "next/image";

export function GracefulImage({
  src,
  alt,
  className = "",
  sizes = "(min-width: 1280px) 50vw, (min-width: 768px) 50vw, 100vw",
  fallbackLabel = "Screenshot",
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  fallbackLabel?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState("");

  if (failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-bg-soft px-6">
        <span className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
          {fallbackLabel}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={`image-reveal ${className}`}
      style={{ opacity: loadedSrc === src ? 1 : 0 }}
      onLoad={() => setLoadedSrc(src)}
      onError={() => setFailed(true)}
    />
  );
}
