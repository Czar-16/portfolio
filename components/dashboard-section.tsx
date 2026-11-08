import { stack } from "@/data/stack";
import { techIcons } from "@/data/tech-icons";
import { GitHubActivity } from "@/components/github-activity";
import { XPostsCard } from "@/components/x-posts-card";
import { LeetCodeStatsCard } from "@/components/leetcode-stats-card";

function TechIcon({ name }: { name: string }) {
  const icon = techIcons[name];
  return <span className="inline-flex h-[15px] w-[15px] shrink-0 items-center justify-center text-fg-muted" aria-hidden="true">
    {icon ? <svg viewBox={icon.viewBox} width="18" height="18" fill="currentColor"><path d={icon.d} /></svg> :
      <span className="font-mono text-[10px]">{name.split(/[^a-zA-Z0-9]+/).filter(Boolean).map(word => word[0]).join('').slice(0, 2)}</span>}
  </span>;
}

export function DashboardSection() {
  const technologies = [...new Set(stack.flatMap(category => category.items))];
  return (
    <div className="dashboard">
      <section id="github" className="section-frame"><GitHubActivity /></section>
      <section id="leetcode" className="section-frame"><LeetCodeStatsCard /></section>
      <section id="tech-stack" className="section-frame" aria-labelledby="skills-heading">
        <h2 id="skills-heading" className="text-lg font-semibold">Skills &amp; Technologies</h2>
        <ul className="mt-[18px] flex list-none flex-wrap gap-1.5" aria-label="Skills and technologies">
          {technologies.map(name => <li key={name} className="flex max-w-full min-h-8 flex-[0_1_auto] items-center justify-center gap-1.5 rounded-[7px] border border-line-strong bg-card px-[9px] py-1.5 text-xs font-medium leading-[1.4] text-fg-secondary transition-[border-color,background-color,color] duration-[180ms] ease-in hover:border-fg-muted hover:bg-bg-soft hover:text-fg motion-reduce:transition-none max-[374px]:px-2.5 max-[374px]:text-xs"><TechIcon name={name} /><span>{name}</span></li>)}
        </ul>
      </section>
      <section id="posts" className="section-frame"><XPostsCard /></section>
    </div>
  );
}
