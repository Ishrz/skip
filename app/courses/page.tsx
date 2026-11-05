import type { Metadata } from "next";
import { CoursesCatalogPage } from "@/components/course/catalog";
import { getCourseList } from "@/sanity/queries/course";

export const metadata: Metadata = {
  title: "All Courses | Vertex",
  description: "Browse every course in the Vertex learning library.",
};

export default async function CoursesRoute() {
  const courses = await getCourseList();

  return <CoursesCatalogPage courses={courses} />;
}
