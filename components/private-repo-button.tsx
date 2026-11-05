import { GithubIcon, LockIcon } from "@/components/icons";

export function PrivateRepoButton({ projectName, compact = false }: { projectName: string; compact?: boolean }) {
  return (
    <button
      type="button"
      title="Private repo"
      disabled
      aria-label={`${projectName}: Private repo`}
      className="btn cursor-not-allowed text-fg-muted"
    >
      <GithubIcon size={14} />
      {!compact && <><LockIcon size={13} /> Private repo</>}
    </button>
  );
}
