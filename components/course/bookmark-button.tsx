"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";

export function BookmarkButton({
  iconOnly = false,
  className,
}: {
  iconOnly?: boolean;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={iconOnly ? "Bookmark lesson" : undefined}
      title={iconOnly ? "Bookmark lesson" : undefined}
      onClick={() => setSaved((current) => !current)}
      className={buttonClassName({
        variant: "secondary",
        className: iconOnly
          ? `size-11 shrink-0 px-0 ${className ?? ""}`
          : `h-12 px-6 text-base ${className ?? ""}`,
      })}
    >
      <Bookmark
        className="size-4"
        fill={saved ? "currentColor" : "none"}
        aria-hidden="true"
      />
      {iconOnly ? null : "Bookmark"}
    </button>
  );
}
