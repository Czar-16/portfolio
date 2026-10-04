"use client";

import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { projects } from "@/data/projects";
import { GithubIcon, ExternalIcon } from "@/components/icons";

export function FeaturedProjects() {
  return (
    <section id="projects" className="py-20">
      <div className="shell">
        <h2 className="text-3xl font-bold mb-12">Featured Projects</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, index) => {
            const isFlagship = index === 0;
            const liveLink = project.links.find(l => l.label === "Live")?.href || project.links[0]?.href;
            const repoLink = project.links.find(l => l.label === "GitHub")?.href;
            return (
              <Reveal key={project.name} className={isFlagship ? "md:col-span-2" : ""}>
                <div className={`card overflow-hidden group ${isFlagship ? "flex flex-col md:flex-row" : "flex flex-col"}`}>
                  <div className={`relative ${isFlagship ? "md:w-3/5" : "h-48"} overflow-hidden`}>
                    <Image
                      src={project.image}
                      alt={project.imageAlt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className={`p-6 flex flex-col justify-between ${isFlagship ? "md:w-2/5" : ""}`}>
                    <div>
                      <h3 className="text-xl font-bold">{project.name}</h3>
                      <p className="text-fg-secondary mt-2 text-sm">{project.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        {project.tech.map((t) => (
                          <span key={t} className="badge">{t}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                      {liveLink && (
                        <a href={liveLink} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                          View <ExternalIcon size={13} />
                        </a>
                      )}
                      {repoLink && (
                        <a href={repoLink} className="btn" target="_blank" rel="noopener noreferrer">
                          <GithubIcon size={14} /> Code
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
