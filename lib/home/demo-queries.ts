/**
 * Example results for the home page demo.
 *
 * These are real results captured once from the live pipeline
 * (`/api/search`) on 12 Nov 2026, then frozen. Clicking a chip renders the
 * stored card without calling the API, the MCP, or a model, so the demo is
 * instant and keeps working when the free model quota is exhausted.
 *
 * To refresh: run the live search for each query and copy the first
 * `kind: "video"` result plus a hand-written caption.
 */
export type HomeDemoResult = {
  id: string;
  query: string;
  caption: string;
  lessonTitle: string;
  courseTitle: string;
  courseCoverUrl: string | null;
  moduleTitle: string;
  lessonLabel: string;
  thumbnailUrl: string | null;
  startSeconds: number;
  clipLengthSeconds: number;
  href: string;
};

export const homeDemoResults: HomeDemoResult[] = [
  {
    id: "server-components",
    query: "How do server components render?",
    caption:
      "Server components render on the server and ship no component code. Watch where the benefit actually lands.",
    lessonTitle: "What server components actually do",
    courseTitle: "Next.js App Router in Depth",
    courseCoverUrl:
      "https://cdn.sanity.io/images/vy5fdpgf/production/969c8d18999e8f9bd2fe31a334dd173f71475755-693x442.jpg?rect=126,0,442,442&w=64&h=64&fit=crop",
    moduleTitle: "Server and Client Components",
    lessonLabel: "2.1",
    thumbnailUrl:
      "https://cdn.sanity.io/images/vy5fdpgf/production/6ce5cdade0c590df16173e241be44c3d0e0e00ca-480x360.jpg?rect=0,45,480,270&w=480&h=270&fit=crop",
    startSeconds: 203,
    clipLengthSeconds: 119,
    href: "/lessons/nextjs-app-router-in-depth-server-components?t=203",
  },
  {
    id: "caching",
    query: "How does caching and revalidation work?",
    caption:
      "Request-level caching, the full route cache, and revalidation — what holds your data at each layer.",
    lessonTitle: "Caching and revalidation",
    courseTitle: "Next.js App Router in Depth",
    courseCoverUrl:
      "https://cdn.sanity.io/images/vy5fdpgf/production/969c8d18999e8f9bd2fe31a334dd173f71475755-693x442.jpg?rect=126,0,442,442&w=64&h=64&fit=crop",
    moduleTitle: "Data Fetching and Caching",
    lessonLabel: "3.2",
    thumbnailUrl:
      "https://cdn.sanity.io/images/vy5fdpgf/production/f1c8c6e49c9b0b6dde0c296c0a08e691137b7f5c-480x360.jpg?rect=0,45,480,270&w=480&h=270&fit=crop",
    startSeconds: 80,
    clipLengthSeconds: 46,
    href: "/lessons/nextjs-app-router-in-depth-caching-and-revalidation?t=80",
  },
  {
    id: "sql-injection",
    query: "How do parameterized queries prevent SQL injection?",
    caption:
      "How prepared statements keep SQL and user input apart, so a value can never rewrite the query.",
    lessonTitle: "SQL injection",
    courseTitle: "Practical Web Security",
    courseCoverUrl:
      "https://cdn.sanity.io/images/vy5fdpgf/production/93d540d498fb7a6c99201457a8294f6299a48b08-299x168.jpg?rect=66,0,168,168&w=64&h=64&fit=crop",
    moduleTitle: "Common Web Vulnerabilities",
    lessonLabel: "2.2",
    thumbnailUrl:
      "https://cdn.sanity.io/images/vy5fdpgf/production/8f074152e5e52e0b5af37d48e66d448d662a81db-480x360.jpg?rect=0,45,480,270&w=480&h=270&fit=crop",
    startSeconds: 40,
    clipLengthSeconds: 90,
    href: "/lessons/practical-web-security-sql-injection?t=40",
  },
];
