import { isLeetCodeStats, type LeetCodeStats } from "@/lib/leetcode-stats";

export const dynamic = "force-dynamic";

type GraphQLStats = {
  errors?: unknown[];
  data?: {
    allQuestionsCount?: { difficulty: string; count: number }[];
    matchedUser?: {
      submitStatsGlobal?: {
        acSubmissionNum?: { difficulty: string; count: number }[];
      };
    } | null;
  };
};

export async function GET() {
  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com/u/Czar16/",
      },
      body: JSON.stringify({
        query: `query PortfolioStats($username: String!) {
          allQuestionsCount { difficulty count }
          matchedUser(username: $username) {
            submitStatsGlobal { acSubmissionNum { difficulty count } }
          }
        }`,
        variables: { username: "Czar16" },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("LeetCode unavailable");
    const payload: GraphQLStats = await response.json();
    const solved = payload?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum;
    const totals = payload?.data?.allQuestionsCount;
    if (payload?.errors?.length || !Array.isArray(solved) || !Array.isArray(totals)) {
      throw new Error("Invalid LeetCode response");
    }
    const count = (rows: typeof solved, difficulty: string) => {
      const value = rows.find((row) => row?.difficulty === difficulty)?.count;
      if (typeof value !== "number") throw new Error("Missing difficulty count");
      return value;
    };
    const difficulty = (name: string) => ({ solved: count(solved, name), total: count(totals, name) });
    const stats: LeetCodeStats = {
      totalSolved: count(solved, "All"),
      easy: difficulty("Easy"),
      medium: difficulty("Medium"),
      hard: difficulty("Hard"),
    };
    if (!isLeetCodeStats(stats)) throw new Error("Invalid statistics");
    return Response.json(stats, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json(
      { error: "LeetCode stats temporarily unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
