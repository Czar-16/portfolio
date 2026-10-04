export type BuildCard = {
  id: string;
  title: string;
  description: string;
  icon: "layers" | "realtime" | "ai" | "terminal";
};

export const whatIBuild: BuildCard[] = [
  {
    id: "full-stack",
    title: "Full-stack Applications",
    description:
      "Modern web applications with scalable frontend and backend architecture.",
    icon: "layers",
  },
  {
    id: "realtime",
    title: "Real-time Systems",
    description: "WebSockets, event-driven communication and real-time state.",
    icon: "realtime",
  },
  {
    id: "ai",
    title: "AI-powered Products",
    description: "Applications that use AI for actual workflows and real problems.",
    icon: "ai",
  },
  {
    id: "devtools",
    title: "Developer Tools",
    description: "Tools that solve problems for developers and learners.",
    icon: "terminal",
  },
];
