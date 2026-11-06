import { SectionHeading } from "@/components/section-heading";
import { QuotesBrowser } from "@/components/quotes-browser";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Quotes & Hard-Hitting Lines", description: "A collection of memorable lines and ideas for perspective, inspired by Alex Hormozi and Chris Williamson.", alternates: { canonical: "/quotes" } };

export default function QuotesPage() {
  return (
    <div className="shell py-16 sm:py-20">
      <div className="max-w-3xl">
        <SectionHeading
          as="h1"
          eyebrow="Words to come back to"
          title="100 Hard-Hitting Lines"
          subtitle="A little perspective for the days you need it. Inspired by Alex Hormozi and Chris Williamson."
        />
      </div>

      <QuotesBrowser />
    </div>
  );
}
