"use client";
import Image from "next/image";
import { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import { GithubIcon, XIcon, LinkedinIcon, MailIcon, DownloadIcon, ArrowRightIcon, CalendarIcon } from "@/components/icons";
import { contact, resume, site, socials } from "@/data/site";
import { VisitorCounter } from "@/components/visitor-counter";
export function Hero() {
  useEffect(() => {
    void getCalApi({ namespace: "30min" }).then(cal => {
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
    }).catch(() => {});
  }, []);
  return <section id="profile" className="profile section-frame">
      <div className="profile-intro flex items-center gap-4">
        <Image src="/profile/profile.jpg" alt="Anoop Jha" width={64} height={64} preload className="rounded-md border border-line object-cover" />
        <div className="min-w-0"><h1>{site.name}</h1><p className="mt-1 text-xs text-fg-secondary">@{site.handle}</p></div>
        <VisitorCounter />
      </div>
      <p className="availability"><span />{site.availability}</p>
      <p className="mt-5 leading-7">I turn complex ideas into simple, useful products — from the first interaction to the systems behind it.</p>
      <p className="mt-2 text-fg-secondary leading-7">{site.positioning}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" data-cal-namespace="30min" data-cal-link="czar16/30min" data-cal-config='{ "layout":"month_view","useSlotsViewOnSmallScreen":"true" }' className="btn btn-primary"><CalendarIcon size={13} /> Book an intro call <ArrowRightIcon size={13} /></button>
        <a href={contact.mailto} className="btn"><MailIcon size={13} /> Send an email</a>
        <a href={resume.href} target="_blank" rel="noopener noreferrer" className="btn"><DownloadIcon size={13} /> Resume</a>
      </div>
      <p className="mt-6 text-xs text-fg-secondary">Here are my socials</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <a href={socials.github} target="_blank" rel="noopener noreferrer" className="btn"><GithubIcon size={14} /> GitHub</a>
        <a href={socials.x} target="_blank" rel="noopener noreferrer" className="btn"><XIcon size={13} /> Twitter</a>
        <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="btn"><LinkedinIcon size={14} /> LinkedIn</a>
      </div>
    </section>;
}
