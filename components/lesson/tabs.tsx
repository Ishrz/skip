"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

type LessonTab = "content" | "notes";

const tabs: Array<{ id: LessonTab; label: string }> = [
  { id: "content", label: "Lesson Content" },
  { id: "notes", label: "Notes" },
];

export function LessonTabs({
  content,
  notes,
}: {
  content: React.ReactNode;
  notes: React.ReactNode;
}) {
  const [active, setActive] = useState<LessonTab>("content");

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const index = tabs.findIndex((tab) => tab.id === active);
    let nextIndex = index;

    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextTab = tabs[nextIndex];

    setActive(nextTab.id);
    document.getElementById(`lesson-${nextTab.id}-tab`)?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Lesson sections"
        onKeyDown={handleKeyDown}
        className="flex gap-8 border-b border-neutral-100"
      >
        {tabs.map((tab) => {
          const isActive = active === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`lesson-${tab.id}-tab`}
              aria-selected={isActive}
              aria-controls={`lesson-${tab.id}-panel`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(tab.id)}
              className={cn(
                "text-body-lg -mb-px border-b-2 py-4 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none",
                isActive
                  ? "border-primary-500 text-primary-500"
                  : "border-transparent text-neutral-500 hover:text-neutral-900",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="lesson-content-panel"
        aria-labelledby="lesson-content-tab"
        hidden={active !== "content"}
        className="pt-8"
      >
        {content}
      </div>
      <div
        role="tabpanel"
        id="lesson-notes-panel"
        aria-labelledby="lesson-notes-tab"
        hidden={active !== "notes"}
        className="pt-8"
      >
        {notes}
      </div>
    </div>
  );
}
