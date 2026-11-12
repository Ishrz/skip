import {
  BadgeCheck,
  Braces,
  Database,
  FileVideo,
  Lock,
  Network,
  PlayCircle,
  ShieldCheck,
  Timer,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileVideo,
    title: "Transcripts become timestamped chunks",
    body: "An offline pipeline pulls captions and chapter markers from YouTube, Vimeo, or Bunny. Cues are cleaned and grouped into short chunks, and every chunk keeps its start second. One document is written per unique video URL, and none of this runs in the request path.",
    detail: "{ startSeconds: 203, text: \"…\" }",
  },
  {
    number: "02",
    icon: Network,
    title: "Sanity Context MCP exposes the schema",
    body: "The search route opens an MCP session against a deployed Studio. The dataset stays private, so the read token never leaves the server. A Context document limits which types are visible and carries the query instructions the model must follow.",
    detail: "context → schema + tools + scope",
  },
  {
    number: "03",
    icon: Braces,
    title: "The model writes grounded GROQ",
    body: "The Vercel AI SDK calls Gemini first, with a second Gemini model and Mistral as fallbacks. The model writes token-based GROQ with wildcards and OR, never a whole phrase. Chapter labels are matched before transcript chunks, and Zod validates the structured output.",
    detail: "*cach* OR *revalid*",
  },
  {
    number: "04",
    icon: PlayCircle,
    title: "Matches hydrate into a real lesson",
    body: "A server-only hydration step maps every match back to its lesson and course labels, ranks by specificity, and sends only the cards the browser needs. The lesson page reads the timestamp and seeks the provider's own embed to that second.",
    detail: "/lessons/[slug]?t=203",
  },
];

const guardrails = [
  { icon: Lock, label: "Private dataset, read token server-only" },
  { icon: Database, label: "Whole transcripts never enter the prompt" },
  { icon: BadgeCheck, label: "Every card maps to a stored lesson" },
  { icon: Timer, label: "Rate limited per IP on the server" },
];

const stack = [
  {
    group: "App",
    items: ["Next.js App Router", "React Server Components", "TypeScript", "Tailwind CSS"],
  },
  {
    group: "Content",
    items: ["Sanity Studio", "GROQ", "Portable Text", "TypeGen"],
  },
  {
    group: "AI",
    items: ["Sanity Context MCP", "Vercel AI SDK", "Gemini + Mistral", "Zod"],
  },
  {
    group: "Platform",
    items: ["Clerk", "YouTube", "Vimeo", "Bunny"],
  },
];

export function HowItWorks() {
  return (
    <div className="mx-4 pb-16 sm:mx-6">
      <section className="mx-auto max-w-6xl rounded-xl border border-neutral-100 bg-white px-4 py-8 shadow-sm sm:px-8 sm:py-10">
        <div className="max-w-2xl">
          <span className="text-small inline-flex items-center gap-2 font-semibold tracking-[0.18em] text-primary-500 uppercase">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Under the hood
          </span>
          <h2 className="font-display mt-3 text-3xl font-bold text-neutral-900">
            How the exact second is found
          </h2>
          <p className="text-body-lg mt-3 text-neutral-500">
            Four systems turn a plain-English question into a timestamped moment
            in a real lesson. The example cards on this page were captured from
            this pipeline and frozen, so the demo opens instantly.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <article
                key={step.number}
                className="flex flex-col rounded-lg border border-neutral-100 bg-neutral-50/60 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="text-small font-mono font-semibold text-primary-500">
                    {step.number}
                  </span>
                  <span className="bg-primary-100/70 flex size-9 items-center justify-center rounded-sm text-primary-500">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                </div>
                <h3 className="text-heading-2 mt-4 font-semibold text-neutral-900">
                  {step.title}
                </h3>
                <p className="text-body mt-2 text-neutral-500">{step.body}</p>
                <code className="text-small mt-5 block w-fit rounded-xs border border-neutral-200 bg-white px-2.5 py-1.5 font-mono text-neutral-700">
                  {step.detail}
                </code>
              </article>
            );
          })}
        </div>

        <div className="mt-8 rounded-lg border border-primary-100 bg-primary-100/30 p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {guardrails.map((guardrail) => {
              const Icon = guardrail.icon;

              return (
                <div
                  key={guardrail.label}
                  className="text-body flex items-start gap-2.5 text-neutral-700"
                >
                  <Icon
                    className="mt-0.5 size-4 shrink-0 text-primary-500"
                    aria-hidden="true"
                  />
                  <span>{guardrail.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-100 pt-6">
          <h3 className="text-small font-semibold tracking-[0.18em] text-neutral-500 uppercase">
            Built with
          </h3>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stack.map((column) => (
              <div key={column.group}>
                <p className="text-body font-semibold text-neutral-900">
                  {column.group}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {column.items.map((item) => (
                    <li key={item} className="text-body text-neutral-500">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
