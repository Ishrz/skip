import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchPage } from "@/components/search/search-page";
import {
  SearchBackdrop,
  SearchNavbar,
  SearchPageFallback,
} from "@/components/search/sections";

export const metadata: Metadata = {
  title: "Search | Skip",
  description:
    "Search every Skip course for lessons and the exact video moments that teach them.",
};

type SearchParams = { [key: string]: string | string[] | undefined };

export default function SearchRoute({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <div className="relative min-h-screen bg-neutral-50">
      <SearchBackdrop />
      <SearchNavbar />
      <Suspense fallback={<SearchPageFallback />}>
        <SearchContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SearchContent({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";

  return <SearchPage key={query} initialQuery={query} />;
}
