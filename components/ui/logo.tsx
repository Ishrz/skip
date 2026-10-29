import { cn } from "@/lib/cn";

export function Logo({
  className,
  wordmark = true,
}: {
  className?: string;
  wordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <path d="M2 4h9l5 13-4 11L2 4z" fill="#1D4ED8" />
        <path d="M30 4h-9l-5 13 4 11L30 4z" fill="#3B82F6" />
      </svg>
      {wordmark ? (
        <span className="text-heading-3 font-semibold tracking-tight text-neutral-900">
          Vertex
        </span>
      ) : null}
    </span>
  );
}
