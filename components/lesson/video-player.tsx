"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { AlertCircle, Play } from "lucide-react";
import {
  buildVideoEmbedUrl,
  parseStartSeconds,
  type VideoProvider,
  type VideoSource,
} from "@/lib/video";

/**
 * Best-effort pause for the provider's own player. Activity hides this route
 * with `display: none` before the DOM is torn down, so asking the player to
 * pause first stops audio immediately instead of waiting for the unmount.
 */
function pauseMessage(provider: VideoProvider) {
  if (provider === "vimeo") {
    return JSON.stringify({ method: "pause" });
  }

  return JSON.stringify({
    event: "command",
    func: "pauseVideo",
    args: "",
  });
}

export function LessonVideoPlayer({
  title,
  posterUrl,
  posterAlt,
  source,
}: {
  title: string;
  posterUrl: string | null;
  posterAlt: string;
  source: VideoSource | null;
}) {
  const [playing, setPlaying] = useState(false);
  const [startSeconds, setStartSeconds] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // The deep link carries the matched second as `?t=`. Read it when the learner
  // presses play so the poster stays in the prerendered HTML and the URL is
  // never needed during the server render.
  const handlePlay = () => {
    const params = new URLSearchParams(window.location.search);

    setStartSeconds(parseStartSeconds(params.get("t") ?? params.get("start")));
    setPlaying(true);
  };

  // Cache Components hides pages with <Activity> instead of unmounting them.
  // The iframe stays in the hidden DOM and keeps buffering or playing, and its
  // URL still carries autoplay, so returning to the page restarts the video.
  // Cleanup runs when the route becomes hidden: request a pause, then drop the
  // iframe so the provider player cannot resume on its own.
  useLayoutEffect(() => {
    return () => {
      setPlaying(false);
      setStartSeconds(0);
    };
  }, []);

  // Back/forward cache also restores the DOM as-is. Pause on pagehide and reset
  // the player on a bfcache restore so a restored page never autoplays.
  useEffect(() => {
    const handlePageHide = () => {
      const frame = iframeRef.current;

      if (!frame?.contentWindow || !source) {
        return;
      }

      frame.contentWindow.postMessage(pauseMessage(source.provider), "*");
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setPlaying(false);
        setStartSeconds(0);
      }
    };

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [source]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-neutral-900">
      {source && playing ? (
        <iframe
          ref={iframeRef}
          src={buildVideoEmbedUrl(source, startSeconds)}
          title={`${title} video`}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : source ? (
        <button
          type="button"
          onClick={handlePlay}
          aria-label={`Play ${title}`}
          className="group absolute inset-0 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset focus-visible:outline-none"
        >
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={posterAlt}
              fill
              priority
              unoptimized
              sizes="(max-width: 1024px) 100vw, 760px"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.01]"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-display text-6xl font-bold text-white">
              {title.charAt(0)}
            </span>
          )}

          <span
            aria-hidden="true"
            className="absolute inset-0 bg-neutral-900/25 transition-colors duration-150 group-hover:bg-neutral-900/15"
          />
          <span
            aria-hidden="true"
            className="relative flex size-16 items-center justify-center rounded-full bg-white text-neutral-900 shadow-lg transition-transform duration-150 group-hover:scale-105"
          >
            <Play className="ml-1 size-6 fill-current" />
          </span>
        </button>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-neutral-300">
          <AlertCircle className="size-6" aria-hidden="true" />
          <p className="text-body">Video unavailable for this lesson.</p>
        </div>
      )}
    </div>
  );
}
