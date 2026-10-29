import { cn } from "@/lib/cn";

export function ProgressBar({
  value,
  label,
  className,
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 flex-1 overflow-hidden rounded-2xl bg-neutral-100"
      >
        <div
          className="h-full rounded-2xl bg-primary-500"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {label ? (
        <span className="text-small whitespace-nowrap text-neutral-500">
          {label}
        </span>
      ) : null}
    </div>
  );
}
