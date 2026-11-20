const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * The 11-character video id from anything a person might paste: a watch link, a
 * youtu.be short link, a Shorts/embed/live link, a YouTube Music link, or the bare
 * id. Null when it isn't a YouTube video.
 */
export function parseYouTubeId(input: string): string | null {
  const text = input.trim();
  if (!text) return null;
  if (VIDEO_ID.test(text)) return text;

  let url: URL;
  try {
    url = new URL(text.includes("://") ? text : `https://${text}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www\.|m\.|music\.)/, "");
  let candidate: string | null = null;
  if (host === "youtu.be") {
    candidate = url.pathname.split("/")[1] ?? null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    candidate = url.searchParams.get("v");
    if (!candidate) {
      const match = url.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/);
      candidate = match?.[1] ?? null;
    }
  }
  return candidate && VIDEO_ID.test(candidate) ? candidate : null;
}

export function youTubeThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}

export function youTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

const TITLE_NOISE =
  /\s*[([](?:official|lyric|lyrics|audio|video|hd|hq|4k|remaster|visualizer|music video)[^)\]]*[)\]]/gi;

/**
 * A best guess at artist and song from a video title like
 * "Artist - Song (Official Video)". With no dash, the whole title is the song.
 */
export function splitVideoTitle(videoTitle: string): { artist: string; title: string } {
  const cleaned = videoTitle.replace(TITLE_NOISE, "").replace(/\s+/g, " ").trim();
  const dash = cleaned.match(/^(.+?)\s+[-–—|]\s+(.+)$/);
  if (!dash) return { artist: "", title: cleaned };
  return { artist: dash[1].trim(), title: dash[2].trim() };
}
