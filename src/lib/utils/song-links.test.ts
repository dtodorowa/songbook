import { describe, expect, it } from "vitest";
import { KARAOKE_PARAM, karaokeHref, songHref } from "./song-links";

describe("song links", () => {
  it("builds a song page link and its karaoke variant", () => {
    expect(songHref("abc")).toBe("/songs/abc");
    const url = new URL(karaokeHref("abc"), "http://localhost");
    expect(url.pathname).toBe("/songs/abc");
    expect(url.searchParams.has(KARAOKE_PARAM)).toBe(true);
  });
});
