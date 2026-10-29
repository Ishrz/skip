import { cn } from "@/lib/cn";

type BadgeProps = {
  preset: "video" | "lesson" | "popular";
  label?: string;
  className?: string;
};

const presets = {
  video: { label: "VIDEO", className: "" },
  lesson: { label: "LESSON", className: "" },
  popular: { label: "POPULAR", className: "" },
} as const;

export function Badge({ preset, label, className }: BadgeProps) {
  const { label: presetLabel } = presets[preset];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xs bg-primary-100 px-2 py-1 text-small font-semibold tracking-wide text-primary-500 uppercase",
        className,
      )}
    >
      {label ?? presetLabel}
    </span>
  );
}
