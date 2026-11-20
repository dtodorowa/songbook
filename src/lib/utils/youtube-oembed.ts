import { youTubeWatchUrl } from "./youtube-id";

/**
 * The video's title from YouTube's public oEmbed endpoint, which needs no API key.
 * Null when offline or the video is private, so callers just leave the fields blank.
 */
export async function fetchVideoTitle(videoId: string): Promise<string | null> {
  const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(youTubeWatchUrl(videoId))}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const body: { title?: unknown } = await response.json();
    return typeof body.title === "string" ? body.title : null;
  } catch {
    return null;
  }
}
