import { GithubIcon, LockIcon } from "@/components/icons";

export function PrivateRepoButton({ projectName }: { projectName: string }) {
  return (
    <button
      type="button"
      disabled
      aria-label={`${projectName}: Private repo`}
      className="btn cursor-not-allowed text-fg-muted"
    >
      <GithubIcon size={14} />
      <LockIcon size={13} />
      Private repo
    </button>
  );
}
