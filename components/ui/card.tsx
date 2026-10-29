import { cn } from "@/lib/cn";

export function Card({
  href,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { href?: string }) {
  const shell = cn(
    "block rounded-md border border-neutral-100 bg-white shadow-sm transition-shadow duration-150 hover:shadow-md",
    className,
  );
  if (href) {
    return (
      <a href={href} className={shell} {...props}>
        {children}
      </a>
    );
  }
  return (
    <div className={shell} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "border-t border-neutral-100 px-4 py-3 flex items-center justify-between gap-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
