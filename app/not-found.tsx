import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-32 text-center shell">
      <div className="card card-lift max-w-md p-8 flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold text-fg">404 — Page not found</h1>
        <p className="text-sm text-fg-secondary">The page you are looking for does not exist or has been moved.</p>
        <Link href="/" className="btn btn-primary mt-4">
          Go home →
        </Link>
      </div>
    </div>
  );
}
