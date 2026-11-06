import Image from "next/image";
import { PortableText } from "next-sanity";
import type { RichText } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";

export function LessonNotes({ value }: { value: RichText | null }) {
  if (!value || value.length === 0) {
    return (
      <p className="text-body-lg text-neutral-500">
        No notes have been added to this lesson yet.
      </p>
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      <PortableText
        value={value}
        components={{
          block: {
            normal: ({ children }) => (
              <p className="text-body-lg leading-7 text-neutral-700">
                {children}
              </p>
            ),
            h2: ({ children }) => (
              <h2 className="font-display mt-8 mb-3 text-2xl font-bold text-neutral-900">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="mt-6 mb-2 text-heading-2 font-semibold text-neutral-900">
                {children}
              </h3>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-primary-300 pl-4 text-body-lg leading-7 text-neutral-700 italic">
                {children}
              </blockquote>
            ),
          },
          list: {
            bullet: ({ children }) => (
              <ul className="text-body-lg list-disc space-y-2 pl-5 leading-7 text-neutral-700">
                {children}
              </ul>
            ),
            number: ({ children }) => (
              <ol className="text-body-lg list-decimal space-y-2 pl-5 leading-7 text-neutral-700">
                {children}
              </ol>
            ),
          },
          marks: {
            strong: ({ children }) => (
              <strong className="font-semibold text-neutral-900">
                {children}
              </strong>
            ),
            em: ({ children }) => <em>{children}</em>,
            code: ({ children }) => (
              <code className="rounded-xs bg-neutral-100 px-1 py-0.5 text-[0.9em] text-neutral-900">
                {children}
              </code>
            ),
            link: ({ children, value }) => (
              <a
                href={value?.href}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary-500 underline underline-offset-2 hover:text-primary-400"
              >
                {children}
              </a>
            ),
          },
          types: {
            image: ({ value }) => {
              if (!value?.asset) {
                return null;
              }

              return (
                <Image
                  src={urlFor(value).width(1200).url()}
                  alt={value.alt ?? ""}
                  width={1200}
                  height={675}
                  unoptimized
                  className="h-auto w-full rounded-md border border-neutral-100"
                />
              );
            },
          },
        }}
      />
    </div>
  );
}
