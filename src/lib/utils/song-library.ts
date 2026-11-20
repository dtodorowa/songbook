import type { Song } from "$lib/data/song";
import { foldAlnum } from "./fold";

export type SongSort = "recent" | "title" | "artist";

export type LibraryFilter = {
  query: string;
  category: string | null;
  sort: SongSort;
};

function matchesQuery(song: Song, foldedQuery: string): boolean {
  if (!foldedQuery) return true;
  const haystack = [song.title, song.artist, song.lyrics, ...song.categories].map(foldAlnum);
  return haystack.some((text) => text.includes(foldedQuery));
}

function compareSongs(sort: SongSort) {
  return (a: Song, b: Song): number => {
    if (sort === "recent") return b.createdAt - a.createdAt;
    if (sort === "artist") {
      return a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title);
    }
    return a.title.localeCompare(b.title);
  };
}

/** The library as the list shows it: searched across title, artist, lyrics and categories. */
export function filterSongs(songs: Song[], filter: LibraryFilter): Song[] {
  const foldedQuery = foldAlnum(filter.query);
  return songs
    .filter((song) => !filter.category || song.categories.includes(filter.category))
    .filter((song) => matchesQuery(song, foldedQuery))
    .sort(compareSongs(filter.sort));
}

export type CategoryCount = { name: string; count: number };

/** Every category in use, alphabetical, with how many songs carry it. */
export function categoryCounts(songs: Song[]): CategoryCount[] {
  const counts = new Map<string, number>();
  for (const song of songs) {
    for (const category of song.categories) counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * A typed category, tidied and checked against the ones in use, so "rock " and
 * "Rock" land on the existing "Rock" rather than starting a near-duplicate.
 */
export function normalizeCategory(input: string, existing: string[]): string {
  const trimmed = input.replace(/\s+/g, " ").trim();
  if (!trimmed) return "";
  const match = existing.find((name) => name.toLowerCase() === trimmed.toLowerCase());
  return match ?? trimmed;
}

/** A song picked at random to sing, among the synced ones. */
export function pickRandom<T>(items: readonly T[], random: () => number = Math.random): T | null {
  if (!items.length) return null;
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))];
}
