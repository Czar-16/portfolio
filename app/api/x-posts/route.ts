import snapshot from "@/data/x-posts.json";
import { SELECTED_X_POST_IDS } from "@/data/x-post-selection";
import { isXPost, selectXPosts, type XFeed } from "@/lib/x-posts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const feed: XFeed = {
    posts: selectXPosts(snapshot.filter(isXPost), SELECTED_X_POST_IDS),
    refreshedAt: null,
    source: "saved",
    persistence: "unconfigured",
  };
  return Response.json(feed, { headers: { "Cache-Control": "no-store" } });
}
