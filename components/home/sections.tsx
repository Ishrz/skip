import {
  ArrowRight,
  BarChart3,
  Bell,
  ChevronDown,
  Clock,
  FileText,
  Search,
  Star,
  User,
} from "lucide-react";
import { Navbar } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

export function HomeNavbar({ className }: { className?: string }) {
  return (
    <div className={cn("px-4 pt-4 sm:px-6", className)}>
      <Navbar
        className="rounded-lg border border-neutral-100 bg-white shadow-sm"
        links={[
          { label: "Courses", href: "/courses" },
          { label: "My Learning", href: "/my-learning" },
        ]}
        active="Courses"
        actions={
          <>
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex size-9 items-center justify-center rounded-full text-neutral-700 transition-colors hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
            >
              <Bell className="size-5" />
              <span
                aria-hidden="true"
                className="bg-primary-500 absolute top-0.5 right-0.5 size-2 rounded-full ring-2 ring-white"
              />
            </button>
            <button
              type="button"
              aria-label="Account menu"
              className="flex items-center gap-1.5 rounded-full focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-200 to-primary-400 text-white">
                <User className="size-4" />
              </span>
              <ChevronDown className="size-4 text-neutral-500" />
            </button>
          </>
        }
      />
    </div>
  );
}

function DockerMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g fill="#2496ED">
        <rect x="14.5" y="3.5" width="4.2" height="4.2" rx="0.6" />
        <rect x="9.5" y="8.8" width="4.2" height="4.2" rx="0.6" />
        <rect x="14.5" y="8.8" width="4.2" height="4.2" rx="0.6" />
        <rect x="19.5" y="8.8" width="4.2" height="4.2" rx="0.6" />
      </g>
      <path
        d="M3.5 21c1.6-3.4 5.2-5 9.4-5h10.6c2.5 0 4.8-1.3 6.1-3.1.3 2.5-1 4.6-2.9 5.8 2 .3 3.7 0 5.6-.8-1 3.1-3.8 5.6-8 5.6H6.6c-1.5 0-2.6-.8-3.1-2.5Z"
        fill="#2496ED"
      />
    </svg>
  );
}

const courseTile =
  "flex size-16 items-center justify-center rounded-lg shadow-sm";

export function HomeCourseCard({
  icon,
  title,
  description,
  level,
  duration,
  modules,
  href,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  level?: string;
  duration?: string;
  modules?: string;
  href?: string;
  className?: string;
}) {
  return (
    <Card
      href={href}
      className={cn("flex flex-col p-5 hover:shadow-lg", className)}
    >
      <div className="h-16">{icon}</div>
      <h3 className="font-display mt-5 text-2xl leading-8 font-bold text-neutral-900">
        {title}
      </h3>
      {description ? (
        <p className="text-body mt-2 text-neutral-500">{description}</p>
      ) : null}
      <div className="border-neutral-100 mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-3 text-small text-neutral-500">
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
            <FileText className="size-4" />
            {modules}
          </span>
        ) : null}
      </div>
    </Card>
  );
}

const courses = [
  {
    icon: (
      <span className={cn(courseTile, "bg-neutral-900 text-white")}>
        <span className="text-3xl font-bold tracking-tight">N</span>
      </span>
    ),
    title: "Next.js for Production",
    description: "Build scalable, high-performance web applications with Next.js.",
    level: "Intermediate",
    duration: "18h 24m",
    modules: "12 modules",
  },
  {
    icon: (
      <span className={cn(courseTile, "bg-white")}>
        <DockerMark className="size-12" />
      </span>
    ),
    title: "Docker Essentials",
    description:
      "Containerize applications and streamline your development workflow.",
    level: "Beginner",
    duration: "10h 12m",
    modules: "8 modules",
  },
  {
    icon: (
      <span
        className={cn(
          courseTile,
          "bg-primary-500 text-white",
        )}
      >
        <span className="text-2xl font-bold tracking-tight">TS</span>
      </span>
    ),
    title: "TypeScript Deep Dive",
    description: "Go beyond the basics and write safer, more expressive code.",
    level: "Intermediate",
    duration: "14h 36m",
    modules: "10 modules",
  },
];

export function Hero() {
  return (
    <section className="relative px-6 pt-14 pb-20 text-center sm:pt-16">
      <span className="bg-primary-100/80 inline-flex items-center rounded-2xl px-4 py-2 text-small font-medium tracking-[0.2em] text-primary-500 uppercase">
        Intelligent Learning
      </span>
      <h1 className="text-hero mx-auto mt-6 max-w-3xl text-neutral-900 [text-shadow:0_0_28px_rgba(255,255,255,0.9)]">
        Search your learning in plain English.
      </h1>
      <p className="text-body-lg mx-auto mt-6 max-w-md text-neutral-500">
        Vertex understands what you want to learn and finds the exact lessons
        across all your courses.
      </p>
      <div className="mt-10">
        <Button className="h-12 px-6 text-base">
          Explore Courses
          <ArrowRight className="size-5" />
        </Button>
      </div>
      <div className="mx-auto mt-12 flex h-14 max-w-3xl items-center gap-3 rounded-lg border border-neutral-200 bg-white px-5 shadow-lg">
        <Search className="size-5 shrink-0 text-neutral-500" />
        <input
          type="search"
          placeholder="Ask anything about your learning..."
          aria-label="Search your learning"
          className="h-full w-full min-w-0 bg-transparent text-body-lg text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
        />
        <kbd className="text-small shrink-0 rounded-sm border border-neutral-200 bg-neutral-50 px-2 py-1 text-neutral-500">
          ⌘ K
        </kbd>
      </div>
    </section>
  );
}

export function CoursesSection({ className }: { className?: string }) {
  return (
    <div className={cn("mx-4 pt-14 pb-16 sm:mx-6", className)}>
      <section className="mx-auto max-w-6xl rounded-xl border border-neutral-100 bg-white px-4 py-8 shadow-sm sm:px-8 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-3xl font-bold text-neutral-900">
            All Courses
          </h2>
          <a
            href="/courses"
            className="text-body inline-flex items-center gap-1.5 font-medium text-primary-500 transition-colors hover:text-primary-400"
          >
            View all courses
            <ArrowRight className="size-4" />
          </a>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {courses.map((course) => (
            <HomeCourseCard key={course.title} {...course} />
          ))}
        </div>
        <div className="mt-12 flex items-center gap-6">
          <span aria-hidden="true" className="h-px flex-1 bg-neutral-200" />
          <span className="text-body inline-flex shrink-0 items-center gap-2.5 text-neutral-500">
            <Star className="size-5 text-primary-500" />
            New courses and lessons added every week.
          </span>
          <span aria-hidden="true" className="h-px flex-1 bg-neutral-200" />
        </div>
      </section>
    </div>
  );
}

const barClusters: number[][] = [
  [50, 110, 150, 85, 130, 158, 75, 105],
  [60, 125, 95, 150, 165, 118, 148, 95, 70, 110],
];

const barBase =
  "flex-1 rounded-t-sm bg-gradient-to-b from-primary-300/90 via-primary-200/50 to-primary-100/5";

export function BottomDecoration() {
  return (
    <div
      aria-hidden="true"
      className="flex items-end gap-8 px-4 pb-3 sm:px-6"
    >
      {barClusters.map((heights, clusterIndex) => (
        <div
          key={clusterIndex}
          className="flex flex-1 items-end gap-2"
        >
          {heights.map((height, index) => (
            <span
              key={index}
              className={barBase}
              style={{ height: `${height}px` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
