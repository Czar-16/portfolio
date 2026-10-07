import { isVisitorId, registerVisitor } from "@/lib/visitor-store.mjs";

export const runtime = "nodejs";

const headers = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get("sec-fetch-site") === "cross-site") {
    return Response.json({ error: "Forbidden" }, { status: 403, headers });
  }
  // Local development and preview traffic must not change the public total.
  if (process.env.NODE_ENV !== "production" || (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") || process.env.PLAYWRIGHT_TEST_BUILD === "1") {
    return Response.json({ error: "Visitor counting is disabled" }, { status: 503, headers });
  }
  try {
    const body = await request.text();
    if (body.length > 256) return Response.json({ error: "Invalid request" }, { status: 400, headers });
    let visitorId: unknown;
    try {
      visitorId = JSON.parse(body)?.visitorId;
    } catch {
      return Response.json({ error: "Invalid request" }, { status: 400, headers });
    }
    if (!isVisitorId(visitorId)) return Response.json({ error: "Invalid visitor identifier" }, { status: 400, headers });
    const count = await registerVisitor(visitorId);
    return Response.json({ count }, { headers });
  } catch {
    return Response.json({ error: "Visitor count unavailable" }, { status: 503, headers });
  }
}
