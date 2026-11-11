import Image from "next/image";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Lock } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";

/**
 * Replaces the player on a signed-out visitor's non-preview lesson. Only
 * presentation: the server never sends the video URL, notes or resources for
 * these lessons.
 */
export function LockedLessonCard({
  title,
  courseTitle,
  posterUrl,
}: {
  title: string;
  courseTitle: string;
  posterUrl: string | null;
}) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-neutral-900">
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt=""
          fill
          unoptimized
          sizes="(max-width: 1024px) 100vw, 760px"
          className="object-cover opacity-60"
        />
      ) : null}

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-neutral-900/80 to-neutral-900/50"
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-5 py-6 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-white text-neutral-900 shadow-lg">
          <Lock className="size-6" aria-hidden="true" />
        </span>
        <h2 className="font-display mt-4 text-2xl font-bold text-white sm:text-3xl">
          This lesson is for members
        </h2>
        <p className="text-body mt-2 max-w-md leading-6 text-neutral-200">
          Create a free account to watch {title} and every other lesson in{" "}
          {courseTitle}.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <SignUpButton mode="modal">
            <button
              type="button"
              className={buttonClassName({ className: "h-12 px-5 text-base" })}
            >
              Create free account
            </button>
          </SignUpButton>
          <SignInButton mode="modal">
            <button
              type="button"
              className={buttonClassName({
                variant: "secondary",
                className: "h-12 px-5 text-base",
              })}
            >
              Sign in
            </button>
          </SignInButton>
        </div>
        <p className="text-small mt-3 text-neutral-400">
          Free preview lessons stay open without an account.
        </p>
      </div>
    </div>
  );
}
