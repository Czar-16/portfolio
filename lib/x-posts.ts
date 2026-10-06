export type XPost = {
  id: string;
  text: string;
  createdAt: string;
  url: string;
  author: { name: string; handle: string; avatarUrl?: string };
  image?: { url: string; alt: string };
  metrics?: { likes?: number; views?: number };
};

export type XFeed = {
  posts: XPost[];
  refreshedAt: string | null;
  source: "live" | "saved";
  persistence: "stored" | "unconfigured" | "unavailable";
};

export function isXPost(value: unknown): value is XPost {
  if (!value || typeof value !== "object") return false;
  const post = value as XPost;
  const validImage = (url: unknown) => typeof url === "string" && /^https:\/\/pbs\.twimg\.com\//.test(url);
  const validCount = (count: unknown) => count === undefined || (typeof count === "number" && Number.isSafeInteger(count) && count >= 0);
  return (
    typeof post.id === "string" && /^\d{1,25}$/.test(post.id) &&
    typeof post.text === "string" && post.text.trim().length > 0 &&
    typeof post.createdAt === "string" && Number.isFinite(Date.parse(post.createdAt)) &&
    post.url === `https://x.com/itsCzar16/status/${post.id}` &&
    post.author?.handle === "itsCzar16" && typeof post.author.name === "string" &&
    (post.author.avatarUrl === undefined || validImage(post.author.avatarUrl)) &&
    (post.metrics === undefined || (post.metrics !== null && typeof post.metrics === "object" && validCount(post.metrics.likes) && validCount(post.metrics.views))) &&
    (post.image === undefined || (validImage(post.image?.url) && typeof post.image?.alt === "string"))
  );
}

export function mergeXPosts(...collections: XPost[][]): XPost[] {
  const unique = new Map<string, XPost>();
  for (const collection of collections) {
    for (const post of collection) if (isXPost(post)) {
      const previous = unique.get(post.id);
      const metrics = { ...previous?.metrics, ...post.metrics };
      unique.set(post.id, { ...post, ...(Object.keys(metrics).length ? { metrics } : {}) });
    }
  }
  return [...unique.values()].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/** Include only the owner's selected posts, preserving selection order and removing duplicates. */
export function selectXPosts(posts: XPost[], selectedIds: readonly string[]): XPost[] {
  const byId = new Map(mergeXPosts(posts).map(post => [post.id, post]));
  return [...new Set(selectedIds)].flatMap(id => {
    const post = byId.get(id);
    return post ? [post] : [];
  });
}

export function shufflePostIds(ids: string[], previous?: string): string[] {
  const shuffled = [...ids];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  if (shuffled.length > 1 && shuffled[0] === previous) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}
