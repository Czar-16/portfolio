import { SectionHeading } from "@/components/section-heading";
import { QuotesBrowser } from "@/components/quotes-browser";

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
