import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

function pageItems(page: number, totalPages: number): (number | "ellipsis")[] {
  const items: (number | "ellipsis")[] = [];
  const shown = new Set<number>();
  for (const p of [
    ...Array.from({ length: 3 }, (_, i) => i + 1),
    page,
    page + 1,
    totalPages,
  ]) {
    if (p >= 1 && p <= totalPages) shown.add(p);
  }
  const ordered = [...shown].sort((a, b) => a - b);
  let previous = 0;
  for (const p of ordered) {
    if (previous && p - previous > 1) items.push("ellipsis");
    items.push(p);
    previous = p;
  }
  return items;
}

export function Pagination({
  page,
  totalPages,
  hrefFor,
  className,
}: {
  page: number;
  totalPages: number;
  hrefFor?: (page: number) => string;
  className?: string;
}) {
  const chevronClass = "text-neutral-500 hover:text-primary-500";
  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center gap-1", className)}
    >
      {hrefFor && page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          aria-label="Previous page"
          className={chevronClass}
        >
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span aria-hidden="true" className="text-neutral-300">
          <ChevronLeft className="size-4" />
        </span>
      )}
      {pageItems(page, totalPages).map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-2 text-body text-neutral-300"
          >
            …
          </span>
        ) : (
          <Item
            key={item}
            page={item}
            active={item === page}
            hrefFor={hrefFor}
          />
        ),
      )}
      {hrefFor && page < totalPages ? (
        <Link
          href={hrefFor(page + 1)}
          aria-label="Next page"
          className={chevronClass}
        >
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span aria-hidden="true" className="text-neutral-300">
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}

function Item({
  page,
  active,
  hrefFor,
}: {
  page: number;
  active: boolean;
  hrefFor?: (page: number) => string;
}) {
  const classes = cn(
    "flex size-8 items-center justify-center rounded-xs text-body transition-colors",
    active
      ? "border border-primary-500 font-medium text-primary-500"
      : "text-neutral-500 hover:text-primary-500",
  );
  if (hrefFor) {
    return (
      <Link href={hrefFor(page)} aria-current={active ? "page" : undefined}>
        <span className={classes}>{page}</span>
      </Link>
    );
  }
  return (
    <span aria-current={active ? "page" : undefined} className={classes}>
      {page}
    </span>
  );
}
