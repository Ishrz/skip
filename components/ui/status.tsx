import {
  LoaderCircle,
  CheckCircle2,
  Play,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

type StatusKind = "in-progress" | "completed" | "now-playing" | "locked";

const kinds: Record<
  StatusKind,
  { label: string; icon: LucideIcon; className: string; fill?: boolean }
> = {
  "in-progress": {
    label: "In Progress",
    icon: LoaderCircle,
    className: "text-primary-500 animate-spin",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "text-[#10B981]",
    fill: true,
  },
  "now-playing": {
    label: "Now Playing",
    icon: Play,
    className: "text-primary-500",
    fill: true,
  },
  locked: {
    label: "Locked",
    icon: Lock,
    className: "text-neutral-500",
  },
};

export function Status({
  kind,
  label,
  className,
}: {
  kind: StatusKind;
  label?: string;
  className?: string;
}) {
  const { icon: Icon, label: presetLabel, className: toneClass, fill } =
    kinds[kind];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-body font-medium text-neutral-700",
        className,
      )}
    >
      <Icon
        className={cn("size-4 shrink-0", toneClass)}
        fill={fill ? "currentColor" : "none"}
      />
      {label ?? presetLabel}
    </span>
  );
}
