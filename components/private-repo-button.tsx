import { GithubIcon, LockIcon } from "@/components/icons";

export function PrivateRepoButton({ projectName, compact = false }: { projectName: string; compact?: boolean }) {
  return (
    <button
      type="button"
      title="Private repo"
      disabled
      aria-label={`${projectName}: Private repo`}
      className="inline-flex min-h-8 items-center justify-center gap-2 rounded-md border border-line bg-card px-3 py-1.5 text-[13px] font-medium text-fg-muted cursor-not-allowed"
    >
      <GithubIcon size={14} />
      {!compact && <><LockIcon size={13} /> Private repo</>}
    </button>
  );
}
