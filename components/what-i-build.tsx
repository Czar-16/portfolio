"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SectionHeading } from "@/components/section-heading";
import {
  LayersIcon,
  RealtimeIcon,
  AiIcon,
  TerminalIcon,
} from "@/components/icons";

const areas = [
  {
    icon: LayersIcon,
    title: "Full-stack Applications",
    desc: "Modern web applications with scalable frontend and backend architecture.",
    line: "Typed from the database to the UI, so a change in one place shows up everywhere it matters.",
    flow: [
      { label: "UI", sub: "What the user sees" },
      { label: "API", sub: "Validation and auth" },
      { label: "Logic", sub: "Business rules" },
      { label: "Database", sub: "Source of truth" },
    ],
  },
  {
    icon: RealtimeIcon,
    title: "Real-time Systems",
    desc: "WebSockets, event-driven communication and real-time state.",
    line: "State that stays in sync across clients without refreshing or polling.",
    flow: [
      { label: "Client", sub: "Sends an event" },
      { label: "Socket server", sub: "Receives and routes" },
      { label: "Broadcast", sub: "Fans out the update" },
      { label: "Other clients", sub: "UI updates instantly" },
    ],
  },
  {
    icon: AiIcon,
    title: "AI-powered Products",
    desc: "Applications that use AI for actual workflows and real problems.",
    line: "Model output shaped into something the app can use, not just text dumped on a screen.",
    flow: [
      { label: "User input", sub: "A real task" },
      { label: "Prompt", sub: "Context and rules" },
      { label: "Model", sub: "Generates a response" },
      { label: "Structured result", sub: "Parsed and shown" },
    ],
  },
  {
    icon: TerminalIcon,
    title: "Developer Tools",
    desc: "Tools that solve problems for developers and learners.",
    line: "Small tools that remove a daily annoyance, then get published so others can use them too.",
    flow: [
      { label: "Friction", sub: "Something annoying" },
      { label: "Small tool", sub: "One focused fix" },
      { label: "Browser / editor", sub: "Where it runs" },
      { label: "Published", sub: "Anyone can install" },
    ],
  },
];

function Flow({
  nodes,
  active,
}: {
  nodes: { label: string; sub: string }[];
  active: number;
}) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
    if (reduce) return;
    const id = setInterval(
      () => setStep((p) => (p + 1) % (nodes.length + 1)),
      1000,
    );
    return () => clearInterval(id);
  }, [active, nodes.length, reduce]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-stretch">
      {nodes.map((n, i) => {
        const lit = reduce || i <= step;
        const current = !reduce && i === step;
        return (
          <div
            key={n.label}
            className="flex flex-col sm:flex-row sm:flex-1 sm:items-stretch"
          >
            <div
              className={`card relative flex-1 p-3 transition-colors duration-300 ${
                lit ? "border-accent/60 bg-accent/10" : ""
              }`}
            >
              {current && (
                <motion.span
                  className="absolute right-2 top-2 size-1.5 rounded-full bg-accent"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
              <p className="text-sm font-semibold">{n.label}</p>
              <p className="mt-0.5 text-xs leading-snug text-fg-muted">
                {n.sub}
              </p>
            </div>
            {i < nodes.length - 1 && (
              <div
                className={`mx-auto h-5 w-px sm:mx-0 sm:my-auto sm:h-px sm:w-4 transition-colors duration-300 ${
                  reduce || i < step ? "bg-accent" : "bg-fg-muted opacity-30"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function WhatIBuild() {
  const [active, setActive] = useState(0);
  const current = areas[active];

  return (
    <section className="py-20">
      <div className="shell">
        <SectionHeading
          eyebrow=""
          title="What I Build"
          subtitle="Four areas I work in. Pick one to see how a request moves through it."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[5fr_7fr]">
          {/* selector */}
          <div
            role="tablist"
            aria-label="Areas"
            className="flex flex-col gap-3"
          >
            {areas.map((a, i) => {
              const Icon = a.icon;
              const on = i === active;
              return (
                <button
                  key={a.title}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(i)}
                  className={`card flex w-full items-start gap-4 p-4 text-left outline-none transition-colors hover:border-accent/50 focus-visible:ring-2 focus-visible:ring-accent ${
                    on ? "border-accent/60 bg-accent/10" : ""
                  }`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{a.title}</h3>
                    <p className="mt-0.5 text-sm leading-snug text-fg-muted">
                      {a.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* diagram */}
          <div
            role="tabpanel"
            className="card flex flex-col justify-between gap-8 p-6"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-8"
              >
                <Flow nodes={current.flow} active={active} />
                <p className="max-w-md text-xl font-medium leading-snug">
                  {current.line}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
