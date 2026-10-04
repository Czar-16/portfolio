import { achievements } from "@/data/achievements";
import { socials } from "@/data/site";
import { SectionHeading } from "@/components/section-heading";
import { StaggerChildren, StaggerItem } from "@/components/reveal";
import {
  TrophyIcon,
  StarIcon,
  MedalIcon,
  RankIcon,
  CertificateIcon,
  GithubIcon,
  ArrowRightIcon,
  SparkIcon,
} from "@/components/icons";

const LEETCODE_URL = "https://leetcode.com/u/Czar-16";

const iconMap = {
  problems: TrophyIcon,
  rating: StarIcon,
  contest: MedalIcon,
  rank: RankIcon,
  certificate: CertificateIcon,
} as const;

const goals = [
  {
    title: "System design depth",
    body: "Working through more distributed-system case studies and modelling the failure modes instead of only the happy path.",
  },
  {
    title: "Sharper distributed systems",
    body: "Building small services that exercise queues, idempotency and retries — the parts that only show up under real traffic.",
  },
  {
    title: "Deeper AI workflows",
    body: "Moving past single-shot prompts into evaluation pipelines, structured output contracts and cost-aware model routing.",
  },
];

export default function AchievementsPage() {
  return (
    <div className="shell py-16 sm:py-20">
      <SectionHeading
        eyebrow="Achievements"
        title="Milestones"
        subtitle="Competitive programming progress, university rankings and certifications — measured where it can actually be measured."
      />

      <StaggerChildren
        className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2"
        gap={0.07}
      >
        {achievements.map((item) => {
          const Icon = iconMap[item.icon] ?? TrophyIcon;

          return (
            <StaggerItem key={item.id} className="h-full">
              <article className="flex h-full items-center gap-6 rounded-[14px] border border-line bg-card p-6 shadow-card transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-accent/45 hover:shadow-accent sm:p-7">
                <div className="min-w-0 flex-1">
                  <p className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                    {item.value}
                  </p>
                </div>

                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
                    <Icon size={19} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-[15px] font-medium leading-snug text-fg">
                      {item.label}
                    </h2>
                    {item.detail && (
                      <p className="mt-1 font-mono text-[11px] text-fg-muted">
                        {item.detail}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            </StaggerItem>
          );
        })}
      </StaggerChildren>

      <div className="mt-16 flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Next
          </span>
          <h2 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">
            What I&apos;m working towards
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-fg-secondary">
            The list above is where I&apos;ve been. This is where I&apos;m going — goals, not
            guarantees.
          </p>
        </div>

        <StaggerChildren
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
          gap={0.07}
        >
          {goals.map((goal) => (
            <StaggerItem key={goal.title} className="h-full">
              <div className="flex h-full flex-col gap-3 rounded-[14px] border border-dashed border-line bg-card/50 p-6 transition-colors hover:border-accent/35">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-bg-soft text-accent">
                  <SparkIcon size={15} />
                </span>
                <h3 className="text-[14px] font-semibold text-fg">{goal.title}</h3>
                <p className="text-[13px] leading-relaxed text-fg-muted">{goal.body}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>

      <div className="mt-10 flex flex-col items-center gap-4 rounded-[14px] border border-line bg-card px-6 py-10 text-center">
        <p className="text-sm text-fg-secondary">
          These numbers only mean something with the profiles behind them.
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          <a
            href={socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            <GithubIcon size={14} />
            View GitHub
            <ArrowRightIcon size={14} />
          </a>
          <a
            href={LEETCODE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            View LeetCode profile
            <ArrowRightIcon size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}