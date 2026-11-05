import { stack } from "@/data/stack";
import { techIcons } from "@/data/tech-icons";
import { GitHubActivity } from "@/components/github-activity";
import { XPostsCard } from "@/components/x-posts-card";
import { LeetCodeStatsCard } from "@/components/leetcode-stats-card";
import styles from "./dashboard-section.module.css";

function TechIcon({ name }: { name: string }) {
  const icon = techIcons[name];
  return <span className={styles.glyph} aria-hidden="true">
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
        <ul className={styles.skills} aria-label="Skills and technologies">
          {technologies.map(name => <li key={name} className={styles.techBadge}><TechIcon name={name} /><span>{name}</span></li>)}
        </ul>
      </section>
      <section id="posts" className="section-frame"><XPostsCard /></section>
    </div>
  );
}
