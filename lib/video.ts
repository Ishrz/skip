export type VideoProvider = "youtube" | "vimeo" | "bunny";

export type VideoSource = {
  provider: VideoProvider;
  embedUrl: string;
};

export function getVideoSource(
  videoUrl: string | null | undefined,
): VideoSource | null {
  if (!videoUrl) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(videoUrl);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null;
  }

  const hostname = url.hostname.replace(/^www\./, "");
  const segments = url.pathname.split("/").filter(Boolean);

  if (hostname === "youtu.be") {
    const id = segments[0];

    return id
      ? {
          provider: "youtube",
          embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`,
        }
      : null;
  }

  if (
    hostname === "youtube.com" ||
    hostname === "m.youtube.com" ||
    hostname === "youtube-nocookie.com"
  ) {
    const id =
      segments[0] === "embed" ? segments[1] : url.searchParams.get("v");

    return id
      ? {
          provider: "youtube",
          embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`,
        }
      : null;
  }

  if (hostname === "vimeo.com" || hostname === "player.vimeo.com") {
    const id = segments.find((segment) => /^\d+$/.test(segment));

    return id
      ? {
          provider: "vimeo",
          embedUrl: `https://player.vimeo.com/video/${id}${url.search}`,
        }
      : null;
  }

  if (
    hostname === "iframe.mediadelivery.net" ||
    hostname.endsWith(".bunnycdn.com") ||
    hostname === "bunnycdn.com"
  ) {
    const embedUrl = new URL(`${url.origin}${url.pathname}`);

    for (const [key, value] of url.searchParams) {
      if (key !== "autoplay" && key !== "t" && key !== "start") {
        embedUrl.searchParams.set(key, value);
      }
    }

    return {
      provider: "bunny",
      embedUrl: embedUrl.toString(),
    };
  }

  return null;
}

export function buildVideoEmbedUrl(
  source: VideoSource,
  startSeconds: number,
) {
  const start = Number.isFinite(startSeconds)
    ? Math.max(0, Math.floor(startSeconds))
    : 0;

  if (source.provider === "vimeo") {
    const url = new URL(source.embedUrl);

    url.searchParams.set("autoplay", "1");
    url.searchParams.set("api", "1");

    if (start > 0) {
      url.hash = `t=${start}s`;
    }

    return url.toString();
  }

  const url = new URL(source.embedUrl);

  if (source.provider === "youtube") {
    url.searchParams.set("autoplay", "1");
    url.searchParams.set("enablejsapi", "1");
    url.searchParams.set("rel", "0");
    url.searchParams.set("playsinline", "1");

    if (start > 0) {
      url.searchParams.set("start", String(start));
    }
  } else {
    url.searchParams.set("autoplay", "true");

    if (start > 0) {
      url.searchParams.set("t", String(start));
    }
  }

  return url.toString();
}

export function parseStartSeconds(value: string | null | undefined) {
  if (!value) {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}
