import { readFile, writeFile } from "node:fs/promises";
import { parseXArchive } from "../lib/x-profile-parser.mjs";
import { hasXPostStore, persistXPosts } from "../lib/x-post-store.mjs";

const filenames = process.argv.slice(2).filter(argument => argument !== "--sync");
if (!filenames.length) {
  console.error("Usage: npm run import:x -- /absolute/path/to/archive/data/tweets.js [additional-parts.js] [--sync]");
  process.exit(1);
}
try {
  const posts = new Map();
  for (const filename of filenames) {
    for (const post of parseXArchive(await readFile(filename, "utf8"))) posts.set(post.id, post);
  }
  if (!posts.size) throw new Error("No authored posts found; existing snapshot was preserved");
  const sorted = [...posts.values()].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  await writeFile(new URL("../data/x-posts.json", import.meta.url), `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(`Imported ${sorted.length} original/quote posts into the public fallback snapshot.`);
  if (process.argv.includes("--sync")) {
    if (!hasXPostStore()) throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before using --sync");
    await persistXPosts(sorted, AbortSignal.timeout(60000));
    console.log("Synced the collection to Supabase.");
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : "Archive import failed");
  process.exitCode = 1;
}
