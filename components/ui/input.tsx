import { Search, ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: LucideIcon;
  trailing?: React.ReactNode;
};

export function Input({
  icon: Icon,
  trailing,
  className,
  ...props
}: InputProps) {
  return (
    <div
      className={cn(
        "flex h-11 items-center gap-2 rounded-md border border-neutral-200 bg-white px-4 shadow-sm transition-colors outline-none focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500",
        className,
      )}
    >
      {Icon ? <Icon className="size-4 shrink-0 text-neutral-500" /> : null}
      <input
        className="h-full w-full min-w-0 bg-transparent text-body text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
        {...props}
      />
      {trailing}
    </div>
  );
}

export function SearchInput({ ...props }: InputProps) {
  return (
    <Input
      icon={Search}
      trailing={<span className="text-small text-neutral-500">⌘ K</span>}
      {...props}
    />
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: Array<{ label: string; value: string }>;
};

export function Select({ options, className, ...props }: SelectProps) {
  return (
    <div
      className={cn(
        "relative h-11 rounded-md border border-neutral-200 bg-white shadow-sm transition-colors focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500",
        className,
      )}
    >
      <select
        className="h-full w-full appearance-none rounded-md px-4 pr-9 text-body text-neutral-900 focus:outline-none"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-neutral-500" />
    </div>
  );
}
