import { parse } from "acorn";

const HANDLE = "itsCzar16";
const imageUrl = (value) => typeof value === "string" && /^https:\/\/pbs\.twimg\.com\//.test(value) ? value : undefined;
const decodeText = (value) => value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

const metricCount = (value) => {
  const count = typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;
  return typeof count === "number" && Number.isSafeInteger(count) && count >= 0 ? count : undefined;
};

function normalize(tweet, archive = false) {
  if (!tweet || typeof tweet !== "object") return null;
  const details = tweet.details ?? tweet.legacy ?? tweet;
  if (details.in_reply_to_status_id_str || details.in_reply_to_status_id || tweet.in_reply_to || tweet.retweeted_status_result || details.retweeted_status || /^RT @/.test(details.full_text ?? "")) return null;
  const user = tweet.core?.user_results?.result ?? tweet.author_results?.result;
  if (!archive && (!user || (user.core?.screen_name ?? user.legacy?.screen_name) !== HANDLE || user.privacy?.protected)) return null;
  const id = tweet.rest_id ?? details.id_str ?? tweet.id_str;
  const text = tweet.note_tweet?.note_tweet_results?.result?.text ?? details.full_text;
  const date = details.created_at_ms ?? details.created_at;
  if (typeof id !== "string" || !/^\d{1,25}$/.test(id) || typeof text !== "string" || !text.trim()) return null;
  const created = typeof date === "number" || typeof date === "string" ? new Date(date) : null;
  if (!created || !Number.isFinite(created.getTime())) return null;
  const media = (tweet.media_entities2 ?? details.extended_entities?.media ?? details.entities?.media ?? []).find(item => item?.type === "photo" && imageUrl(item.media_url_https));
  const avatarUrl = imageUrl(user?.avatar?.image_url ?? user?.legacy?.profile_image_url_https);
  let displayText = decodeText(text);
  for (const entity of tweet.url_entities ?? details.entities?.urls ?? []) {
    if (entity?.url && entity.expanded_url) displayText = displayText.split(entity.url).join(entity.expanded_url);
  }
  // Media-only links are represented by the preview instead of opaque t.co text.
  if (media) for (const entity of tweet.media_entities2 ?? details.entities?.media ?? []) {
    if (entity?.url) displayText = displayText.split(entity.url).join("");
  }
  if (media) displayText = displayText.replace(/\s*https:\/\/t\.co\/\w+\s*$/, "");
  const likes = metricCount(tweet.counts?.favorite_count ?? details.favorite_count ?? tweet.public_metrics?.like_count);
  const views = metricCount(tweet.views?.count ?? details.view_count ?? tweet.public_metrics?.impression_count);
  const metrics = { ...(likes !== undefined ? { likes } : {}), ...(views !== undefined ? { views } : {}) };
  return {
    ...(Object.keys(metrics).length ? { metrics } : {}),
    id, text: displayText.trim() || "Photo post", createdAt: created.toISOString(), url: `https://x.com/${HANDLE}/status/${id}`,
    author: { name: user?.core?.name ?? user?.legacy?.name ?? "Czar16", handle: HANDLE, ...(avatarUrl ? { avatarUrl } : {}) },
    ...(media ? { image: { url: media.media_url_https, alt: media.ext_alt_text ?? "Image attached to this X post" } } : {}),
  };
}

const sortUnique = (posts) => [...new Map(posts.filter(Boolean).map(post => [post.id, post])).values()].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

/** Decode ONLY static data expressions. Calls, functions, getters and constructors are never executed. */
export function parsePublicXProfile(html) {
  if (typeof html !== "string" || html.length > 3_000_000) throw new Error("Invalid profile response");
  const cells = new Map();
  const objects = new Set();
  let remaining = 150_000;
  const ref = (node) => node?.type === "MemberExpression" && node.object?.type === "Identifier" && node.object.name === "$R" && node.computed && node.property.type === "Literal" ? node.property.value : undefined;
  const read = (node) => {
    if (!node || --remaining <= 0) return undefined;
    switch (node.type) {
      case "Literal": return ["string", "number", "boolean"].includes(typeof node.value) || node.value === null ? node.value : undefined;
      case "UnaryExpression": {
        const value = read(node.argument);
        if (node.operator === "!") return !value;
        if (node.operator === "-" && typeof value === "number") return -value;
        return undefined;
      }
      case "ArrayExpression": return node.elements.map(read);
      case "ObjectExpression": {
        const result = Object.create(null);
        objects.add(result);
        for (const property of node.properties) {
          if (property.type !== "Property" || property.kind !== "init" || property.method || property.computed) continue;
          const key = property.key.name ?? property.key.value;
          if (typeof key !== "string" || ["__proto__", "constructor", "prototype"].includes(key)) continue;
          result[key] = read(property.value);
        }
        return result;
      }
      case "MemberExpression": return cells.get(ref(node));
      case "AssignmentExpression": {
        const key = ref(node.left);
        if (key === undefined || node.operator !== "=") return undefined;
        const value = read(node.right); cells.set(key, value); return value;
      }
      default: return undefined;
    }
  };
  const walk = (node) => {
    if (!node || typeof node !== "object" || remaining <= 0) return;
    if (node.type === "AssignmentExpression" && ref(node.left) !== undefined) {
      read(node); return;
    }
    for (const [key, value] of Object.entries(node)) {
      if (["start", "end", "loc"].includes(key)) continue;
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === "object") walk(value);
    }
  };
  for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    if (!match[1].includes("$R[")) continue;
    try { walk(parse(match[1], { ecmaVersion: "latest" })); } catch { /* Unsupported bootstrap format: use stored posts. */ }
  }
  const posts = sortUnique([...objects].filter(object => object.__typename === "Tweet").map(tweet => normalize(tweet)));
  if (!posts.length) throw new Error("Public profile exposed no readable authored posts");
  return posts;
}

export function parseXArchive(text) {
  // X archives use a JS assignment around JSON. Strip the assignment; never eval it.
  const content = text.trim().replace(/^window\.YTD\.tweets\.part\d+\s*=\s*/, "").replace(/;\s*$/, "");
  const records = JSON.parse(content);
  if (!Array.isArray(records)) throw new Error("Expected an X tweets archive array");
  return sortUnique(records.map(record => normalize(record?.tweet ?? record, true)));
}
