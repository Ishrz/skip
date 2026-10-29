import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/cn";

export function Navbar({
  links,
  active,
  className,
}: {
  links: Array<{ label: string; href: string }>;
  active?: string;
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "flex items-center justify-between gap-6 border-b border-neutral-100 bg-white px-6 py-3",
        className,
      )}
    >
      <Link href="/" aria-label="Vertex home">
        <Logo />
      </Link>
      <div className="flex items-center gap-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-body font-medium transition-colors",
              active === link.label
                ? "text-primary-500"
                : "text-neutral-700 hover:text-neutral-900",
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
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
