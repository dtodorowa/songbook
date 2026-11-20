import { describe, expect, it } from "vitest";
import { emptyDraft, type Song } from "$lib/data/song";
import { categoryCounts, filterSongs, normalizeCategory, pickRandom } from "./song-library";

function song(overrides: Partial<Song>): Song {
  return {
    ...emptyDraft(),
    id: overrides.title ?? "id",
    syncEvents: [],
    syncHash: null,
    createdAt: 0,
    updatedAt: 0,
    lastPlayedAt: null,
    ...overrides,
  };
}

const songs = [
  song({ title: "Zombie", artist: "The Cranberries", categories: ["Rock"], createdAt: 1 }),
  song({ title: "Jolene", artist: "Dolly Parton", categories: ["Country"], createdAt: 3 }),
  song({
    title: "Hallelujah",
    artist: "Leonard Cohen",
    lyrics: "I heard there was a secret chord",
    categories: ["Ballads", "Rock"],
    createdAt: 2,
  }),
];

const titles = (list: Song[]) => list.map((entry) => entry.title);

describe("filterSongs", () => {
  it("sorts by title, artist, or newest first", () => {
    expect(titles(filterSongs(songs, { query: "", category: null, sort: "title" }))).toEqual([
      "Hallelujah",
      "Jolene",
      "Zombie",
    ]);
    expect(titles(filterSongs(songs, { query: "", category: null, sort: "artist" }))).toEqual([
      "Jolene",
      "Hallelujah",
      "Zombie",
    ]);
    expect(titles(filterSongs(songs, { query: "", category: null, sort: "recent" }))).toEqual([
      "Jolene",
      "Hallelujah",
      "Zombie",
    ]);
  });

  it("narrows to one category", () => {
    expect(titles(filterSongs(songs, { query: "", category: "Rock", sort: "title" }))).toEqual([
      "Hallelujah",
      "Zombie",
    ]);
  });

  it("searches the lyrics too, ignoring case and punctuation", () => {
    expect(
      titles(filterSongs(songs, { query: "SECRET chord!", category: null, sort: "title" }))
    ).toEqual(["Hallelujah"]);
  });
});

describe("categoryCounts", () => {
  it("counts each category alphabetically", () => {
    expect(categoryCounts(songs)).toEqual([
      { name: "Ballads", count: 1 },
      { name: "Country", count: 1 },
      { name: "Rock", count: 2 },
    ]);
  });
});

describe("normalizeCategory", () => {
  it("reuses an existing category whatever the case", () => {
    expect(normalizeCategory("  rock ", ["Rock"])).toBe("Rock");
  });

  it("tidies a new one", () => {
    expect(normalizeCategory(" Road   trip ", ["Rock"])).toBe("Road trip");
  });
});

describe("pickRandom", () => {
  it("is null for nothing and in range otherwise", () => {
    expect(pickRandom([])).toBeNull();
    expect(pickRandom(["a", "b"], () => 0.99)).toBe("b");
  });
});
