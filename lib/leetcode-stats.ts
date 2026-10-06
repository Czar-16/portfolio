export type LeetCodeStats = {
  totalSolved: number;
  easy: { solved: number; total: number };
  medium: { solved: number; total: number };
  hard: { solved: number; total: number };
};

export function isLeetCodeStats(value: unknown): value is LeetCodeStats {
  if (!value || typeof value !== "object") return false;
  const stats = value as LeetCodeStats;
  const validCount = (count: unknown): count is number =>
    typeof count === "number" && Number.isSafeInteger(count) && count >= 0;
  return (
    validCount(stats.totalSolved) &&
    [stats.easy, stats.medium, stats.hard].every(
      (item) => item && validCount(item.solved) && validCount(item.total) && item.solved <= item.total,
    ) &&
    stats.totalSolved === stats.easy.solved + stats.medium.solved + stats.hard.solved
  );
}
