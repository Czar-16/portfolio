export type Achievement = {
  id: string;
  value: string;
  label: string;
  detail?: string;
  icon: "problems" | "rating" | "contest" | "rank" | "certificate";
};

export const achievements: Achievement[] = [
  {
    id: "leetcode-problems",
    value: "400+",
    label: "LeetCode Problems",
    icon: "problems",
  },
  {
    id: "leetcode-rating",
    value: "1500+",
    label: "LeetCode Rating",
    icon: "rating",
  },
  {
    id: "weekly-contest",
    value: "#1349",
    label: "LeetCode Weekly Contest 448",
    icon: "contest",
  },
  {
    id: "interviewbit-rank",
    value: "#109",
    label: "InterviewBit University Rank",
    icon: "rank",
  },
  {
    id: "nptel",
    value: "NPTEL",
    label: "Certification — Social Networks",
    detail: "IIT Kharagpur",
    icon: "certificate",
  },
];
