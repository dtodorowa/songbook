import { describe, expect, it } from "vitest";
import { parseYouTubeId, splitVideoTitle } from "./youtube-id";

describe("parseYouTubeId", () => {
  const id = "dQw4w9WgXcQ";

  it.each([
    id,
    `https://www.youtube.com/watch?v=${id}`,
    `https://youtube.com/watch?v=${id}&t=42s&list=PL123`,
    `youtube.com/watch?v=${id}`,
    `https://m.youtube.com/watch?v=${id}`,
    `https://music.youtube.com/watch?v=${id}`,
    `https://youtu.be/${id}?si=abc`,
    `https://www.youtube.com/shorts/${id}`,
    `https://www.youtube.com/embed/${id}`,
    `https://www.youtube.com/live/${id}`,
    `  ${id}  `,
  ])("reads %s", (input) => {
    expect(parseYouTubeId(input)).toBe(id);
  });

  it.each(["", "hello", "https://vimeo.com/12345", "https://www.youtube.com/@channel"])(
    "rejects %s",
    (input) => {
      expect(parseYouTubeId(input)).toBeNull();
    }
  );
});

describe("splitVideoTitle", () => {
  it("splits artist and song on a dash and drops the noise", () => {
    expect(splitVideoTitle("Adele - Hello (Official Music Video)")).toEqual({
      artist: "Adele",
      title: "Hello",
    });
  });

  it("keeps the whole title as the song when there is no dash", () => {
    expect(splitVideoTitle("Bohemian Rhapsody [Remastered 2011]")).toEqual({
      artist: "",
      title: "Bohemian Rhapsody",
    });
  });
});
