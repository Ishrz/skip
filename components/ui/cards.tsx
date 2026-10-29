import {
  BarChart3,
  Clock,
  FolderClosed,
  PlayCircle,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Card, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

export function CourseCard({
  icon,
  iconClassName,
  title,
  description,
  level,
  duration,
  modules,
  href,
  className,
}: {
  icon?: React.ReactNode;
  iconClassName?: string;
  title: string;
  description?: string;
  level?: string;
  duration?: string;
  modules?: string;
  href?: string;
  className?: string;
}) {
  return (
    <Card href={href} className={cn("overflow-hidden", className)}>
      <div className="flex items-start gap-3 border-b border-neutral-100 px-4 py-4">
        {icon ? (
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-sm bg-neutral-900 text-white",
              iconClassName,
            )}
          >
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <h3 className="text-body-lg font-semibold text-neutral-900">
            {title}
          </h3>
          {description ? (
            <p className="text-small mt-1 text-neutral-500">{description}</p>
          ) : null}
        </div>
      </div>
      <CardFooter>
        <div className="flex items-center gap-4 text-small text-neutral-500">
          {level ? (
            <span className="inline-flex items-center gap-1.5">
              <BarChart3 className="size-4" />
              {level}
            </span>
          ) : null}
          {duration ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" />
              {duration}
            </span>
          ) : null}
          {modules ? (
            <span className="inline-flex items-center gap-1.5">
              <FolderClosed className="size-4" />
              {modules}
            </span>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
}

export function LessonCardVideo({
  title,
  description,
  lessonLabel,
  clipLength,
  watchFromLabel,
  href,
  className,
}: {
  title: string;
  description?: string;
  lessonLabel: string;
  clipLength: string;
  watchFromLabel?: string;
  href?: string;
  className?: string;
}) {
  return (
    <Card href={href} className={cn("flex flex-col", className)}>
      <div className="px-4 py-4">
        <Badge preset="video" />
        <h3 className="text-body-lg mt-3 font-semibold text-neutral-900">
          {title}
        </h3>
        {description ? (
          <p className="text-small mt-1 text-neutral-500">{description}</p>
        ) : null}
      </div>
      <CardFooter className="mt-auto">
        <span className="text-small text-neutral-500">
          {lessonLabel} · {clipLength}
        </span>
        <span className="text-small inline-flex items-center gap-1.5 font-medium text-primary-500">
          <PlayCircle className="size-4" />
          {watchFromLabel ?? `Watch from ${clipLength}`}
        </span>
      </CardFooter>
    </Card>
  );
}

export function LessonCardLesson({
  title,
  description,
  moduleLabel,
  href,
  className,
}: {
  title: string;
  description?: string;
  moduleLabel?: string;
  href?: string;
  className?: string;
}) {
  return (
    <Card href={href} className={cn("flex flex-col", className)}>
      <div className="px-4 py-4">
        <Badge preset="lesson" />
        <h3 className="text-body-lg mt-3 font-semibold text-neutral-900">
          {title}
        </h3>
        {description ? (
          <p className="text-small mt-1 text-neutral-500">{description}</p>
        ) : null}
      </div>
      <CardFooter className="mt-auto">
        <span className="text-small text-neutral-500">{moduleLabel}</span>
        <span className="text-small inline-flex items-center gap-1.5 font-medium text-primary-500">
          View lesson
          <ExternalLink className="size-4" />
        </span>
      </CardFooter>
    </Card>
  );
}

export function ResourceCard({
  title,
  description,
  meta,
  href,
  className,
}: {
  title: string;
  description?: string;
  meta?: string;
  href?: string;
  className?: string;
}) {
  return (
    <Card href={href} className={cn("group relative", className)}>
      <div className="flex items-start gap-3 px-4 py-4">
        <FileText className="size-5 shrink-0 text-neutral-500" />
        <div className="min-w-0">
          <h3 className="text-body-lg font-semibold text-neutral-900">
            {title}
          </h3>
          {description ? (
            <p className="text-small mt-1 text-neutral-500">{description}</p>
          ) : null}
        </div>
      </div>
      <CardFooter>
        <span className="text-small text-neutral-500">{meta}</span>
        <ExternalLink className="size-4 text-neutral-500" />
      </CardFooter>
    </Card>
  );
}
