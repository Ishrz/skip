import { cn } from "@/lib/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "tertiary" | "text";
  size?: "default" | "md";
};

const variantStyles = {
  primary:
    "bg-primary-500 text-white shadow-sm hover:bg-primary-400 active:bg-primary-500 disabled:bg-primary-200 disabled:text-white/70 disabled:shadow-none",
  secondary:
    "bg-white text-neutral-900 border border-neutral-200 shadow-sm hover:border-primary-200 hover:text-primary-500 active:border-primary-200 disabled:border-neutral-200 disabled:text-neutral-300",
  tertiary:
    "text-neutral-900 hover:text-primary-500 active:text-primary-500 disabled:text-neutral-300",
  text: "text-primary-500 hover:text-primary-400 active:text-primary-500 disabled:text-neutral-300",
} as const;

export function Button({
  variant = "primary",
  size = "default",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-md font-sans font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:hover:bg-inherit",
        size === "default" ? "px-4 text-sm" : "px-3 text-sm",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
