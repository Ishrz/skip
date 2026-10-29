import {
  Bell,
  Search,
  PlayCircle,
  FileText,
  Bookmark,
  BarChart3,
  Clock,
  User,
  ChevronRight,
  ExternalLink,
  Eye,
  LayoutGrid,
  Target,
  PersonStanding,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { SearchInput, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Status } from "@/components/ui/status";
import { ProgressBar } from "@/components/ui/progress";
import {
  CourseCard,
  LessonCardVideo,
  LessonCardLesson,
  ResourceCard,
} from "@/components/ui/cards";
import { Navbar, Breadcrumbs } from "@/components/ui/navigation";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/cn";

export function Section({
  number,
  title,
  className,
  contentClassName,
  children,
}: {
  number: string;
  title: string;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-md border border-neutral-100 bg-white p-6 shadow-sm",
        className,
      )}
    >
      <header className="flex items-baseline gap-2">
        <span className="text-small font-semibold text-primary-500">
          {number}
        </span>
        <h2 className="text-small font-semibold uppercase tracking-[0.2em] text-neutral-900">
          {title}
        </h2>
      </header>
      <div className={cn("mt-6", contentClassName)}>{children}</div>
    </section>
  );
}

export function Hero() {
  return (
    <div className="rounded-md border border-neutral-100 bg-white p-8 shadow-sm">
      <Logo />
      <h1 className="text-display-2 mt-8 text-neutral-900">Design System</h1>
      <p className="text-body-lg mt-4 max-w-sm text-neutral-500">
        A unified design language for Vertex learning platform. Clean, modern
        and focused on clarity, consistency and intuitive learning
        experiences.
      </p>
      <p className="text-small mt-10 uppercase tracking-[0.2em] text-neutral-400">
        Version 1.0 · May 2025
      </p>
    </div>
  );
}

function Swatch({
  name,
  hex,
  className,
}: {
  name: string;
  hex: string;
  className?: string;
}) {
  return (
    <div>
      <div
        className={cn(
          "h-14 rounded-sm border border-neutral-100 shadow-sm",
          className,
        )}
      />
      <p className="mt-2 text-small text-neutral-900">{name}</p>
      <p className="text-small text-neutral-500">{hex}</p>
    </div>
  );
}

export function Colors() {
  const primary = [
    ["Primary 500", "#3B82F6", "bg-primary-500"],
    ["Primary 400", "#60A5FA", "bg-primary-400"],
    ["Primary 300", "#93C5FD", "bg-primary-300"],
    ["Primary 200", "#BFDBFE", "bg-primary-200"],
    ["Primary 100", "#DBEAFE", "bg-primary-100"],
  ] as const;
  const neutral = [
    ["Neutral 900", "#0F172A", "bg-neutral-900"],
    ["Neutral 700", "#334155", "bg-neutral-700"],
    ["Neutral 500", "#64748B", "bg-neutral-500"],
    ["Neutral 300", "#CBD5E1", "bg-neutral-300"],
    ["Neutral 200", "#E2E8F0", "bg-neutral-200"],
    ["Neutral 100", "#F1F5F9", "bg-neutral-100"],
    ["Neutral 50", "#FAFAFC", "bg-neutral-50"],
    ["White", "#FFFFFF", "bg-white"],
  ] as const;
  return (
    <div>
      <h3 className="text-body font-medium text-neutral-900">Primary</h3>
      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {primary.map(([name, hex, bg]) => (
          <Swatch key={name} name={name} hex={hex} className={bg} />
        ))}
      </div>
      <h3 className="text-body mt-6 font-medium text-neutral-900">Neutral</h3>
      <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-8">
        {neutral.map(([name, hex, bg]) => (
          <Swatch key={name} name={name} hex={hex} className={bg} />
        ))}
      </div>
    </div>
  );
}

function Typeface({
  familyClassName,
  name,
  tagline,
}: {
  familyClassName: string;
  name: string;
  tagline: string;
}) {
  return (
    <div className="flex items-center gap-6">
      <span
        className={cn("w-28 shrink-0 text-6xl text-neutral-900", familyClassName)}
      >
        Ag
      </span>
      <div>
        <p className="text-heading-3 font-semibold text-neutral-900">{name}</p>
        <p className="mt-1 text-small text-neutral-500">{tagline}</p>
      </div>
    </div>
  );
}

export function Typography() {
  return (
    <div className="space-y-10">
      <Typeface
        familyClassName="font-display"
        name="Playfair Display"
        tagline="Elegant · Readable · Timeless"
      />
      <Typeface
        familyClassName="font-sans font-semibold"
        name="Inter"
        tagline="Clean · Modern · Highly legible"
      />
    </div>
  );
}

const typeScale = [
  {
    name: "Display 1",
    labelClass: "font-display text-body font-bold",
    font: "Playfair Display",
    size: "48 / 56",
    weight: "Bold",
    use: "Page titles",
  },
  {
    name: "Display 2",
    labelClass: "font-display text-body font-bold",
    font: "Playfair Display",
    size: "36 / 44",
    weight: "Bold",
    use: "Section titles",
  },
  {
    name: "Heading 1",
    labelClass: "text-body font-semibold",
    font: "Inter",
    size: "28 / 36",
    weight: "Semi Bold",
    use: "Card titles",
  },
  {
    name: "Heading 2",
    labelClass: "text-body font-semibold",
    font: "Inter",
    size: "22 / 30",
    weight: "Semi Bold",
    use: "Sub-section titles",
  },
  {
    name: "Heading 3",
    labelClass: "text-body font-medium",
    font: "Inter",
    size: "18 / 26",
    weight: "Medium",
    use: "Small titles",
  },
  {
    name: "Body Large",
    labelClass: "text-body",
    font: "Inter",
    size: "16 / 24",
    weight: "Regular",
    use: "Body copy",
  },
  {
    name: "Body",
    labelClass: "text-body",
    font: "Inter",
    size: "14 / 20",
    weight: "Regular",
    use: "Supporting text",
  },
  {
    name: "Small",
    labelClass: "text-small",
    font: "Inter",
    size: "12 / 16",
    weight: "Regular",
    use: "Captions, meta",
  },
];

export function TypeScale() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-140 border-collapse text-left">
        <thead>
          <tr className="text-small text-neutral-500">
            <th className="pb-3 font-normal">Style</th>
            <th className="pb-3 font-normal">Font</th>
            <th className="pb-3 font-normal">Size / Line Height</th>
            <th className="pb-3 font-normal">Weight</th>
            <th className="pb-3 font-normal">Use</th>
          </tr>
        </thead>
        <tbody>
          {typeScale.map((row) => (
            <tr
              key={row.name}
              className="border-t border-neutral-100 align-baseline"
            >
              <td className={cn("py-3 pr-4 text-neutral-900", row.labelClass)}>
                {row.name}
              </td>
              <td className="text-body py-3 pr-4 text-neutral-500">
                {row.font}
              </td>
              <td className="text-body py-3 pr-4 text-neutral-500">
                {row.size}
              </td>
              <td className="text-body py-3 pr-4 text-neutral-500">
                {row.weight}
              </td>
              <td className="text-body py-3 text-neutral-500">{row.use}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Spacing() {
  const steps = [
    [4, "0.25rem"],
    [8, "0.5rem"],
    [12, "0.75rem"],
    [16, "1rem"],
    [24, "1.5rem"],
    [32, "2rem"],
    [40, "2.5rem"],
    [48, "3rem"],
    [64, "4rem"],
  ] as const;
  return (
    <div>
      <p className="text-body text-neutral-500">
        Base unit: <span className="font-semibold text-neutral-900">4px</span>
      </p>
      <div className="mt-6 flex items-end gap-6 overflow-x-auto">
        {steps.map(([px, rem]) => (
          <div key={px} className="flex flex-col items-center">
            <div
              className="rounded-xs bg-primary-100"
              style={{ width: px, height: px }}
            />
            <p className="text-small mt-3 font-semibold text-neutral-900">
              {px}
            </p>
            <p className="text-small text-neutral-500">({rem})</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RadiusShadows() {
  const radii = [
    ["4px", "xs", 4],
    ["8px", "sm", 8],
    ["12px", "md", 12],
    ["16px", "lg", 16],
    ["24px", "xl", 24],
  ] as const;
  const shadows = [
    ["Sm", "shadow-sm", "0 1px 2px 0 rgba(15, 23, 42, 0.05)"],
    ["Md", "shadow-md", "0 4px 12px -2px rgba(15, 23, 42, 0.08)"],
    ["Lg", "shadow-lg", "0 12px 24px -4px rgba(15, 23, 42, 0.10)"],
    ["Xl", "shadow-xl", "0 20px 40px -8px rgba(15, 23, 42, 0.12)"],
  ] as const;
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <div>
        <h3 className="text-body font-medium text-neutral-900">Radius</h3>
        <div className="mt-4 flex flex-wrap gap-6">
          {radii.map(([px, token, value]) => (
            <div key={token} className="text-center">
              <div
                className="size-14 rounded-xs border border-neutral-200 bg-white shadow-sm"
                style={{ borderRadius: value }}
              />
              <p className="mt-2 text-small font-semibold text-neutral-900">
                {px}
              </p>
              <p className="text-small text-neutral-500">({token})</p>
            </div>
          ))}
          <div className="text-center">
            <div className="size-14 rounded-full border border-neutral-200 bg-white shadow-sm" />
            <p className="mt-2 text-small font-semibold text-neutral-900">
              Full
            </p>
            <p className="text-small text-neutral-500">(circle)</p>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-body font-medium text-neutral-900">Shadows</h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {shadows.map(([name, shadow, spec]) => (
            <div
              key={name}
              className="rounded-sm border border-neutral-100 p-3"
            >
              <div
                className={cn(
                  "h-10 rounded-sm border border-neutral-50 bg-white",
                  shadow,
                )}
              />
              <p className="text-small mt-2 font-semibold text-neutral-900">
                {name}
              </p>
              <p className="text-small text-neutral-500">{spec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const iconSet: LucideIcon[] = [
  Bell,
  Search,
  PlayCircle,
  FileText,
  Bookmark,
  BarChart3,
  Clock,
  User,
  ChevronRight,
];

function IconRow({ icons, filled = false }: { icons: LucideIcon[]; filled?: boolean }) {
  return (
    <div className="mt-3 flex flex-wrap gap-5 text-neutral-900">
      {icons.map((Icon, index) => (
        <Icon
          key={index}
          className="size-6"
          fill={filled ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

export function Icons() {
  return (
    <div>
      <h3 className="text-body font-medium text-neutral-900">Outline Style</h3>
      <IconRow icons={iconSet} />
      <h3 className="text-body mt-5 font-medium text-neutral-900">
        Filled Style
      </h3>
      <IconRow icons={iconSet} filled />
      <h3 className="text-body mt-5 font-medium text-neutral-900">
        Icon Specs
      </h3>
      <ul className="mt-3 space-y-1.5 text-small text-neutral-500">
        <li>· 24x24px grid</li>
        <li>· 2px stroke width (outline)</li>
        <li>· Rounded line caps</li>
        <li>· Consistent optical balance</li>
      </ul>
    </div>
  );
}

const buttonVariants = [
  { key: "primary", label: "Primary", content: "Get Started" },
  { key: "secondary", label: "Secondary", content: "Explore Courses" },
  {
    key: "tertiary",
    label: "Tertiary",
    content: (
      <>
        View Lesson
        <ExternalLink className="size-4" />
      </>
    ),
  },
  {
    key: "text",
    label: "Text",
    content: (
      <>
        Watch Video
        <PlayCircle className="size-4" />
      </>
    ),
  },
] as const;

export function Buttons() {
  const hoverForcedClass: Record<string, string> = {
    primary: "pointer-events-none bg-primary-400",
    secondary: "pointer-events-none border-primary-200 text-primary-500",
    tertiary: "pointer-events-none text-primary-500",
    text: "pointer-events-none text-primary-400",
  };
  return (
    <div>
      <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3">
        <span className="text-small text-neutral-500">Default</span>
        <div className="flex flex-wrap items-center gap-3">
          {buttonVariants.map((variant) => (
            <Button key={variant.key} variant={variant.key}>
              {variant.content}
            </Button>
          ))}
        </div>
        <span className="text-small text-neutral-500">Hover</span>
        <div className="flex flex-wrap items-center gap-3">
          {buttonVariants.map((variant) => (
            <Button
              key={variant.key}
              variant={variant.key}
              className={hoverForcedClass[variant.key]}
            >
              {variant.content}
            </Button>
          ))}
        </div>
        <span className="text-small text-neutral-500">Disabled</span>
        <div className="flex flex-wrap items-center gap-3">
          {buttonVariants.map((variant) => (
            <Button key={variant.key} variant={variant.key} disabled>
              {variant.content}
            </Button>
          ))}
        </div>
      </div>
      <ul className="mt-5 space-y-1.5 text-small text-neutral-500">
        <li>· Height: 44px (default)</li>
        <li>· Padding: 0 16px (default), 0 12px (md)</li>
        <li>· Radius: 12px</li>
        <li>· Font: Inter Medium (14–16px)</li>
      </ul>
    </div>
  );
}

export function Inputs() {
  return (
    <div>
      <h3 className="text-body font-medium text-neutral-900">
        Search / Text Input
      </h3>
      <div className="mt-3">
        <SearchInput placeholder="Search anything..." readOnly />
      </div>
      <h3 className="text-body mt-5 font-medium text-neutral-900">Select</h3>
      <div className="mt-3">
        <Select
          aria-label="Sort results"
          options={[
            {
              label: "Most Relevant",
              value: "most-relevant",
            },
            {
              label: "Newest",
              value: "newest",
            },
          ]}
        />
      </div>
      <h3 className="text-body mt-5 font-medium text-neutral-900">
        Field Specs
      </h3>
      <ul className="mt-3 space-y-1.5 text-small text-neutral-500">
        <li>· Height: 44px</li>
        <li>· Radius: 12px</li>
        <li>· Border: 1px solid #E2E8F0</li>
        <li>· Padding: 0 16px</li>
        <li>· Focus: Border color #3B82F6</li>
      </ul>
    </div>
  );
}

export function Badges() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-small text-neutral-500">Video</p>
        <div className="mt-2">
          <Badge preset="video" />
        </div>
      </div>
      <div>
        <p className="text-small text-neutral-500">Lesson</p>
        <div className="mt-2">
          <Badge preset="lesson" />
        </div>
      </div>
      <div>
        <p className="text-small text-neutral-500">Popular</p>
        <div className="mt-2">
          <Badge preset="popular" />
        </div>
      </div>
    </div>
  );
}

export function StatusIndicators() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <Status kind="in-progress" />
      <Status kind="completed" />
      <Status kind="now-playing" />
      <Status kind="locked" />
    </div>
  );
}

export function ProgressBars() {
  return <ProgressBar value={35} label="35% complete" />;
}

export function CardsRow() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <CourseCard
        icon={<span className="text-body-lg font-bold">N</span>}
        title="Next.js for Production"
        description="Build scalable, high-performance web applications with Next.js."
        level="Intermediate"
        duration="18h 24m"
        modules="12 modules"
      />
      <LessonCardVideo
        title="Data Fetching in Server Components"
        description="Learn how to fetch data on the server using async/await and Next.js best practices."
        lessonLabel="Lesson 5.1"
        clipLength="12:45"
      />
      <LessonCardLesson
        title="Data Fetching & Caching"
        description="Explore different data fetching methods in Next.js and how to cache and revalidate data for optimal performance."
        moduleLabel="Module 5"
      />
      <ResourceCard
        title="Caching and Revalidation Guide"
        description="Deep dive into Next.js caching strategies."
        meta="PDF · 1.2 MB"
      />
    </div>
  );
}

export function NavigationRow() {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div>
        <p className="text-small text-neutral-500">Navbar</p>
        <div className="-mx-2 mt-3">
          <Navbar
            className="rounded-sm border-neutral-100"
            links={[
              { label: "Courses", href: "#" },
              { label: "My Learning", href: "#" },
            ]}
            active="Courses"
          />
        </div>
      </div>
      <div>
        <p className="text-small text-neutral-500">Breadcrumbs</p>
        <div className="mt-3">
          <Breadcrumbs
            items={[
              { label: "All Courses", href: "#" },
              { label: "Next.js for Production", href: "#" },
              { label: "Data Fetching & Caching" },
            ]}
          />
        </div>
      </div>
      <div>
        <p className="text-small text-neutral-500">Pagination</p>
        <div className="mt-3">
          <Pagination page={1} totalPages={8} />
        </div>
      </div>
    </div>
  );
}

export function Principles() {
  const principles = [
    {
      icon: Eye,
      title: "Clarity First",
      description: "Simple shapes and clear communication beat decoration.",
    },
    {
      icon: LayoutGrid,
      title: "Consistency",
      description:
        "Use components and patterns consistently across the platform.",
    },
    {
      icon: Target,
      title: "Focus & Calm",
      description:
        "Remove noise and help learners focus on what matters.",
    },
    {
      icon: PersonStanding,
      title: "Accessible",
      description:
        "Design with accessibility and inclusivity in mind.",
    },
  ];
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {principles.map((principle) => (
        <div key={principle.title} className="flex items-start gap-3">
          <principle.icon className="size-5 shrink-0 text-primary-500" />
          <div>
            <p className="text-body font-semibold text-neutral-900">
              {principle.title}
            </p>
            <p className="text-small mt-1 text-neutral-500">
              {principle.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
