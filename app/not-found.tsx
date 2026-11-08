import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-32 text-center shell">
      <div className="card max-w-md p-8 flex flex-col items-center gap-4 rounded-[14px] border border-line bg-card shadow-card">
        <h1 className="text-2xl font-semibold text-fg">404 — Page not found</h1>
        <p className="text-sm text-fg-secondary">The page you are looking for does not exist or has been moved.</p>
        <Link href="/" className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-5 text-[13px] font-medium text-accent-contrast hover:bg-[color-mix(in_oklab,var(--accent)_88%,white)] hover:shadow-[0_14px_40px_-14px_color-mix(in_oklab,var(--accent-glow)_85%,transparent)]">
          Go home →
        </Link>
      </div>
    </div>
  );
}
