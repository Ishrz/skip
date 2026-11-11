import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { CourseBackdrop, CourseNavbar } from "@/components/course/sections";
import { LessonPage } from "@/components/lesson/sections";
import { getLessonBySlug, getLessonSlugs } from "@/sanity/queries/lesson";

export const instant = false;

export async function generateStaticParams() {
  const slugs = await getLessonSlugs();

  return slugs.flatMap(({ slug }) => (slug ? [{ slug }] : []));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);

  if (!lesson?.title) {
    return { title: "Lesson | Skip" };
  }

  return {
    title: `${lesson.title} | ${lesson.course?.title ?? "Skip"}`,
    description: lesson.course?.title
      ? `${lesson.title}, a lesson from ${lesson.course.title} on Skip.`
      : undefined,
  };
}

export default async function LessonRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);

  if (!lesson) {
    notFound();
  }

  const { userId } = await auth();
  const signedIn = Boolean(userId);
  const locked = !signedIn && !lesson.freePreview;

  return (
    <div className="relative min-h-screen overflow-x-clip bg-white pb-6">
      <CourseBackdrop />
      <CourseNavbar />
      <main className="relative z-10 px-4 sm:px-6 lg:px-8">
        <LessonPage lesson={lesson} signedIn={signedIn} locked={locked} />
      </main>
    </div>
  );
}
