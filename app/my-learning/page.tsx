import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import { CourseBackdrop, CourseNavbar } from "@/components/course/sections";
import { Breadcrumbs } from "@/components/ui/navigation";
import { buttonClassName } from "@/components/ui/button";

export const instant = false;

export const metadata: Metadata = {
  title: "My Learning | Skip",
  description: "Pick up the courses you have started on Skip.",
};

export default async function MyLearningPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/my-learning");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white pb-24">
      <CourseBackdrop />
      <CourseNavbar active="My Learning" />
      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs className="pt-6 pb-7" items={[{ label: "My Learning" }]} />
        <h1 className="font-display text-display-2 font-bold text-neutral-900 lg:text-display-1">
          My Learning
        </h1>
        <p className="text-body-lg mt-3 max-w-xl leading-7 text-neutral-500">
          Courses you start will show up here with your progress and a link back
          to where you left off.
        </p>

        <section className="mt-10 rounded-lg border border-neutral-100 bg-white p-6 shadow-sm sm:p-10">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary-100 text-primary-500">
            <BookOpen className="size-6" aria-hidden="true" />
          </span>
          <h2 className="font-display mt-5 text-2xl font-bold text-neutral-900">
            Nothing in progress yet
          </h2>
          <p className="text-body mt-2 max-w-lg text-neutral-500">
            Every lesson is open to you now that you are signed in. Pick a
            course and it will appear here.
          </p>
          <Link
            href="/courses"
            className={buttonClassName({ className: "mt-6 h-12 px-6 text-base" })}
          >
            Browse courses
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </main>
    </div>
  );
}
