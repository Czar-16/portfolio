"use client";

import Image from "next/image";
import Link from "next/link";
import { CurrentlyBuildingCard } from "@/components/currently-building-card";
import {
  GithubIcon,
  XIcon,
  LinkedinIcon,
  ArrowRightIcon,
} from "@/components/icons";
import { socials } from "@/data/site";

// Change this if you rename the banner file
const BANNER = "/banner/hero.png";
const AVATAR = "/profile/profile.jpg";

const ghostBtn =
  "interactive inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-black/40 px-5 text-sm font-medium text-white/90 backdrop-blur-md hover:bg-white/10 hover:text-white md:h-12";

export function Hero() {
  return (
    <section className="relative mx-auto w-[calc(100%-24px)] max-w-[2100px] overflow-hidden rounded-[32px] border border-white/10">
      {/* Banner */}
      <div className="absolute inset-0">
        <Image
          src={BANNER}
          alt=""
          fill
          priority
          sizes="(max-width: 1480px) calc(100vw - 24px), 1480px"
          className="object-cover object-[50%_30%]"
        />

        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-black/30 to-transparent" />
      </div>

      {/* Handwritten note + shooting star */}
      <div
        className="pointer-events-none absolute right-[6%] top-[16%] hidden lg:block"
        aria-hidden="true"
      >
        <span className="absolute -top-16 right-24 h-px w-28 -rotate-[35deg] bg-gradient-to-r from-transparent to-white/70" />

        <div className="-rotate-[8deg] text-right">
          <p className="font-hand text-[30px] leading-snug text-white/90">
            Building what i wish existed.
            <br />
          </p>

          <p className="mt-1 font-hand text-[28px] text-white/90">~ Czar16</p>
        </div>
      </div>

      {/* Content */}
      <div className="shell relative flex min-h-[640px] items-end pb-10 pt-32 lg:h-[min(50vw,860px)] lg:pb-12">
        <div className="flex w-full flex-col gap-6 md:flex-row md:items-start md:gap-10">
          {/* Avatar */}
          <div
            className="relative h-[120px] w-[120px] shrink-0 overflow-hidden rounded-full border-2 border-accent bg-card shadow-[0_0_40px_rgba(59,158,255,0.35)] md:-mt-6 md:h-[200px] md:w-[200px] lg:h-[240px] lg:w-[240px]"
          >
            <Image
              src={AVATAR}
              alt="Anoop Jha"
              fill
              priority
              sizes="(max-width: 768px) 120px, 240px"
              className="object-cover"
            />
          </div>

          {/* Text + actions */}
          <div className="flex w-full max-w-[760px] flex-col">
            {/* Availability */}
            <div
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3.5 py-1.5 backdrop-blur-md"
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.7)]" />

              <span className="text-xs font-medium text-white/90 md:text-sm">
                Open to Software Engineering opportunities
              </span>
            </div>

            {/* Name */}
            <h1
              className="mt-3 text-[44px] font-extrabold leading-none tracking-[-0.04em] text-white md:text-[60px] lg:text-[72px]"
            >
              Anoop <span className="text-gradient-name">Jha</span>
            </h1>

            {/* Description */}
            <p
              className="mt-3 max-w-[720px] text-base font-medium leading-snug text-white/90 md:text-xl lg:text-[26px]"
            >
              Full-stack developer building real-world products with TypeScript,
              Next.js, and scalable backend systems.
            </p>

            {/* Currently Building */}
            <div
              className="mt-5 w-full max-w-[640px]"
            >
              <CurrentlyBuildingCard />
            </div>

            {/* Actions */}
            <div
              className="mt-5 flex flex-wrap items-center gap-3"
            >
              <Link
                href="/projects"
                className="interactive inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-6 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(59,158,255,0.4)] hover:bg-accent/90 md:h-12 md:text-base"
              >
                View Projects
                <ArrowRightIcon size={16} className="interaction-arrow" />
              </Link>

              <a
                href={socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className={ghostBtn}
              >
                <GithubIcon size={18} />
                GitHub
              </a>

              <a
                href={socials.x}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className={`${ghostBtn} !px-0 w-11 md:w-14`}
              >
                <XIcon size={18} />
              </a>

              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={ghostBtn}
              >
                <LinkedinIcon size={18} />
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
