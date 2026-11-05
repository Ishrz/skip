"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";

export function BookmarkButton() {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={() => setSaved((current) => !current)}
      className={buttonClassName({
        variant: "secondary",
        className: "h-12 px-6 text-base",
      })}
    >
      <Bookmark
        className="size-4"
        fill={saved ? "currentColor" : "none"}
        aria-hidden="true"
      />
      Bookmark
    </button>
  );
}
