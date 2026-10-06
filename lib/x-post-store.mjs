/** Server/CLI only. Never import this module into client components. */
export function hasXPostStore() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function config() {
  if (!hasXPostStore()) throw new Error("X post storage is not configured");
  const base = new URL(process.env.SUPABASE_URL);
  if (base.protocol !== "https:") throw new Error("Supabase requires HTTPS");
  return {
    endpoint: `${base.origin}/rest/v1/x_posts`,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  };
}

export async function readStoredXPosts(signal) {
  const { endpoint, headers } = config();
  const posts = [];
  for (let offset = 0; ; offset += 1000) {
    const response = await fetch(`${endpoint}?select=payload&order=created_at.desc,id.desc&limit=1000&offset=${offset}`, {
      headers, cache: "no-store", signal,
    });
    if (!response.ok) throw new Error("X post storage read failed");
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error("Invalid X post storage response");
    posts.push(...rows.map(row => row.payload));
    if (rows.length < 1000) return posts;
  }
}

export async function persistXPosts(posts, signal) {
  const { endpoint, headers } = config();
  for (let offset = 0; offset < posts.length; offset += 200) {
    const response = await fetch(`${endpoint}?on_conflict=id`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(posts.slice(offset, offset + 200).map(post => ({ id: post.id, created_at: post.createdAt, payload: post }))),
      cache: "no-store", signal,
    });
    if (!response.ok) throw new Error("X post storage write failed");
  }
}
