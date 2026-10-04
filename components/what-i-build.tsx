"use client";

import { SectionHeading } from "@/components/section-heading";
import { LayersIcon, RealtimeIcon, AiIcon, TerminalIcon } from "@/components/icons";
import { whatIBuild } from "@/data/what-i-build";
import { motion } from "motion/react";

const icons = {
  layers: LayersIcon,
  realtime: RealtimeIcon,
  ai: AiIcon,
  terminal: TerminalIcon,
};

export function WhatIBuild() {
  return (
    <section className="py-20">
      <div className="shell">
        <SectionHeading title="What I Build" eyebrow="What I build" subtitle="Expertise in technologies that scale." />
        
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          {whatIBuild.map((item, index) => {
            const Icon = icons[item.icon as keyof typeof icons] || TerminalIcon;
            return (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="card p-6 flex flex-col gap-4 hover:border-accent/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-fg-muted mt-1 leading-snug">{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
