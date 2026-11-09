const CONTRIBUTIONS_URL =
  "https://github-contributions-api.jogruber.de/v4/Czar-16?y=last";

export async function GET() {
  try {
    const response = await fetch(CONTRIBUTIONS_URL, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(7000),
    });

    if (!response.ok) throw new Error("GitHub contributions unavailable");

    const data = await response.json();
    return Response.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return Response.json(
      { error: "GitHub contributions temporarily unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
