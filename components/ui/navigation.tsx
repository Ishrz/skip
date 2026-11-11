import { Suspense } from "react";
import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/cn";

type NavLink = {
  label: string;
  href: string;
  /** Only shown to signed-in learners. Display only, not access control. */
  signedInOnly?: boolean;
};

function NavbarLink({
  label,
  href,
  isActive,
  className,
}: {
  label: string;
  href: string;
  isActive: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "text-body relative flex items-center font-medium transition-colors",
        isActive
          ? "text-primary-500"
          : "text-neutral-700 hover:text-neutral-900",
        className,
      )}
    >
      {label}
      {isActive ? (
        <span
          aria-hidden="true"
          className="bg-primary-500 absolute -bottom-4 left-0 right-0 h-0.5 rounded-full"
        />
      ) : null}
    </Link>
  );
}

export function Navbar({
  links,
  active,
  actions,
  className,
  padded = true,
}: {
  links: NavLink[];
  active?: string;
  actions?: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  const publicLinks = links.filter((link) => !link.signedInOnly);
  const privateLinks = links.filter((link) => link.signedInOnly);

  return (
    <nav
      className={cn(
        "relative flex items-center justify-between gap-3 py-3 sm:gap-6",
        padded && "px-4 sm:px-6",
        className,
      )}
    >
      <Link href="/" aria-label="Skip home" className="shrink-0">
        <Logo />
      </Link>

      <div className="hidden items-center gap-6 md:flex">
        {publicLinks.map((link) => (
          <NavbarLink
            key={link.href}
            label={link.label}
            href={link.href}
            isActive={active === link.label}
          />
        ))}
        {privateLinks.length > 0 ? (
          <Suspense fallback={null}>
            <Show when="signed-in">
              {privateLinks.map((link) => (
                <NavbarLink
                  key={link.href}
                  label={link.label}
                  href={link.href}
                  isActive={active === link.label}
                />
              ))}
            </Show>
          </Suspense>
        ) : null}
      </div>

      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        {actions}
        <details className="group relative md:hidden">
          <summary
            aria-label="Open navigation menu"
            className="flex size-9 cursor-pointer list-none items-center justify-center rounded-full text-neutral-700 transition-colors hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none [&::-webkit-details-marker]:hidden"
          >
            <Menu className="size-5 group-open:hidden" aria-hidden="true" />
            <X className="hidden size-5 group-open:block" aria-hidden="true" />
          </summary>
          <div className="absolute top-full right-0 z-50 mt-2 w-56 rounded-md border border-neutral-100 bg-white p-2 shadow-lg">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-body flex rounded-sm px-3 py-2.5 font-medium transition-colors",
                  active === link.label
                    ? "bg-primary-100/70 text-primary-500"
                    : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900",
                )}
              >
                {link.label}
              </Link>
            ))}
            {privateLinks.length > 0 ? (
              <Suspense fallback={null}>
                <Show when="signed-in">
                  {privateLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "text-body flex rounded-sm px-3 py-2.5 font-medium transition-colors",
                        active === link.label
                          ? "bg-primary-100/70 text-primary-500"
                          : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900",
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </Show>
              </Suspense>
            ) : null}
          </div>
        </details>
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
