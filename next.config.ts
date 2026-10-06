import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep production browser-test assets separate from an active dev server.
  distDir: process.env.PLAYWRIGHT_TEST_BUILD === "1" ? ".next-test" : ".next",
  redirects() {
    return [{ source: "/movies", destination: "/watch", permanent: true }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 90],
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "pbs.twimg.com" },
    ],
  },
};

export default nextConfig;