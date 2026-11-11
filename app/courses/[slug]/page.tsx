import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CourseBackdrop,
  CourseNavbar,
  CoursePage,
} from "@/components/course/sections";
import { getCourseBySlug, getCourseSlugs } from "@/sanity/queries/course";

export const instant = false;

export async function generateStaticParams() {
  const slugs = await getCourseSlugs();

  return slugs.flatMap(({ slug }) => (slug ? [{ slug }] : []));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course?.title) {
    return { title: "Course | Skip" };
  }

  return {
    title: `${course.title} | Skip`,
    description: course.summary ?? undefined,
  };
}

export default async function CourseRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white pb-36">
      <CourseBackdrop />
      <CourseNavbar />
      <main className="relative z-10">
        <CoursePage course={course} />
      </main>
    </div>
  );
}
