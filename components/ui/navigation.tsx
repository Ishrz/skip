import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/cn";

export function Navbar({
  links,
  active,
  actions,
  className,
}: {
  links: Array<{ label: string; href: string }>;
  active?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "flex items-center justify-between gap-6 px-6 py-3",
        className,
      )}
    >
      <Link href="/" aria-label="Vertex home">
        <Logo />
      </Link>
      <div className="flex items-center gap-6">
        {links.map((link) => {
          const isActive = active === link.label;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-body relative flex items-center font-medium transition-colors",
                isActive
                  ? "text-primary-500"
                  : "text-neutral-700 hover:text-neutral-900",
              )}
            >
              {link.label}
              {isActive ? (
                <span
                  aria-hidden="true"
                  className="bg-primary-500 absolute -bottom-4 left-0 right-0 h-0.5 rounded-full"
                />
              ) : null}
            </Link>
          );
        })}
      </div>
      {actions ? (
        <div className="flex items-center gap-4">{actions}</div>
      ) : (
        <div />
      )}
    </nav>
  );
}

export function Breadcrumbs({
  items,
  className,
}: {
  items: Array<{ label: string; href?: string }>;
  className?: string;
}) {
  return (
    <ol className={cn("flex flex-wrap items-center gap-2", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <li
            key={`${item.label}-${index}`}
            className="flex items-center gap-2"
          >
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-body text-neutral-500 hover:text-primary-500"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "text-body",
                  isLast
                    ? "font-medium text-neutral-900"
                    : "text-neutral-500",
                )}
              >
                {item.label}
              </span>
            )}
            {!isLast ? (
              <span className="text-small text-neutral-300">&gt;</span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
