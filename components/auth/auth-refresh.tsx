"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

/**
 * Server components decide lesson access and nav visibility from the Clerk
 * session. A modal sign-in or sign-out changes only the client session, so
 * refresh the route once when the auth state actually flips. Without this, a
 * locked lesson would stay locked after signing up until a manual reload.
 */
export function AuthRefresh() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const previous = useRef<boolean | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (previous.current === null) {
      previous.current = isSignedIn;
      return;
    }

    if (previous.current !== isSignedIn) {
      previous.current = isSignedIn;
      router.refresh();
    }
  }, [isLoaded, isSignedIn, router]);

  return null;
}
