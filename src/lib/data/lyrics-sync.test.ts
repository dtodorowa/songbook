import { describe, expect, it } from "vitest";
import { activeLineAt, hashLyrics, hasLineEvents, lyricLines, resolveSync } from "./lyrics-sync";

describe("lyricLines", () => {
  it("drops blank lines and trims each one", () => {
    expect(lyricLines("  one \n\n two\n   \nthree")).toEqual(["one", "two", "three"]);
  });
});

describe("resolveSync", () => {
  const lines = ["Hello there", "General Kenobi"];

  it("trusts indices while the lyrics are unchanged", () => {
    const resolved = resolveSync(
      {
        lyricsHash: hashLyrics(lines),
        events: [
          { kind: "line", lineIndex: 1, lineText: "General Kenobi", t: 4 },
          { kind: "line", lineIndex: 0, lineText: "Hello there", t: 2 },
        ],
      },
      lines
    );
    expect(resolved).toEqual({
      events: [
        { t: 2, lineIndex: 0 },
        { t: 4, lineIndex: 1 },
      ],
      stale: 0,
    });
  });

  it("re-aligns by text after a line is inserted above", () => {
    const edited = ["Intro", "Hello there!", "General Kenobi"];
    const resolved = resolveSync(
      {
        lyricsHash: hashLyrics(lines),
        events: [{ kind: "line", lineIndex: 0, lineText: "Hello there", t: 2 }],
      },
      edited
    );
    expect(resolved.events).toEqual([{ t: 2, lineIndex: 1 }]);
  });

  it("counts a line that no longer exists as stale", () => {
    const resolved = resolveSync(
      {
        lyricsHash: hashLyrics(lines),
        events: [{ kind: "line", lineIndex: 0, lineText: "Hello there", t: 2 }],
      },
      ["Something else"]
    );
    expect(resolved).toEqual({ events: [{ t: 2, lineIndex: null }], stale: 1 });
  });
});

describe("activeLineAt", () => {
  const events = [
    { t: 2, lineIndex: 0 },
    { t: 5, lineIndex: null },
    { t: 8, lineIndex: 1 },
  ];

  it("is dark before the first stamp and during a gap", () => {
    expect(activeLineAt(events, 1)).toBeNull();
    expect(activeLineAt(events, 6)).toBeNull();
  });

  it("lights the latest stamped line", () => {
    expect(activeLineAt(events, 3)).toBe(0);
    expect(activeLineAt(events, 9)).toBe(1);
  });
});

describe("hasLineEvents", () => {
  it("needs at least one line stamp", () => {
    expect(hasLineEvents([{ kind: "silence", t: 1 }])).toBe(false);
    expect(hasLineEvents(null)).toBe(false);
  });
});
