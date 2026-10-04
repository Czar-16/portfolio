import Link from "next/link";
import { GithubIcon, XIcon, LinkedinIcon, MailIcon } from "@/components/icons";

export function AboutContact() {
  return (
    <section className="py-20">
      <div className="shell grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">About Me</h2>
          <p className="text-fg-secondary leading-relaxed">
            I am a full-stack developer passionate about building performant and accessible web applications.
            With a focus on modern technologies and clean design, I strive to create products that provide exceptional user experiences.
          </p>
          <div className="flex gap-4 mt-2">
            <Link href="mailto:anoopjha@example.com" className="icon-btn"><MailIcon /></Link>
            <Link href="https://github.com/Czar-16" className="icon-btn"><GithubIcon /></Link>
            <Link href="https://x.com" className="icon-btn"><XIcon /></Link>
            <Link href="https://linkedin.com" className="icon-btn"><LinkedinIcon /></Link>
          </div>
        </div>

        <div className="card p-8 bg-accent/5">
          <h2 className="text-3xl font-bold mb-4">Let&apos;s build something.</h2>
          <p className="text-fg-secondary mb-6">Open to new opportunities and collaborations.</p>
          <div className="flex flex-wrap gap-3">
             <Link href="mailto:anoopjha@example.com" className="btn btn-primary">Email me →</Link>
             <Link href="https://github.com/Czar-16" className="btn">GitHub →</Link>
             <Link href="https://x.com" className="btn">X →</Link>
             <Link href="https://linkedin.com" className="btn">LinkedIn →</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
