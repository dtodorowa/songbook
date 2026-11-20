// Lyrics sync, ported from tandabase (its ADR 0014). A sync is an ordered stream of
// timestamps pointing into a song's lyric lines, captured against one YouTube video.
// Skipped lines are never stamped, a repeated chorus appears twice, and an
// instrumental gap is a `silence` event. Each line event also carries its text, so a
// sync survives the lyrics being edited afterwards (see `resolveSync`).

import { foldAlnum, hashLines } from "$lib/utils/fold";

/** `t` is absolute video seconds, the same clock the YouTube player reports. */
export type SyncEvent =
  { kind: "line"; lineIndex: number; lineText: string; t: number } | { kind: "silence"; t: number };

export type LyricsSync = {
  /** Hash of the lyric lines the sync was captured against. */
  lyricsHash: string;
  events: SyncEvent[];
};

/** The one way lyrics text becomes indexable lines. The editor and the reader share it. */
export function lyricLines(lyrics: string): string[] {
  return lyrics
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function hashLyrics(lines: string[]): string {
  return hashLines(lines);
}

/** An event resolved against the current lyrics: null means silence or an edited-away line. */
export type ResolvedEvent = { t: number; lineIndex: number | null };

export type ResolvedSync = {
  events: ResolvedEvent[];
  /** Line events that no longer match any current line. */
  stale: number;
};

/**
 * Resolve a stored sync against the lyrics as they are now. While the hash still
 * matches, the stored indices are trusted. After an edit, each line event is
 * re-aligned by its text, preferring the match nearest its original index.
 */
export function resolveSync(sync: LyricsSync, currentLines: string[]): ResolvedSync {
  const fast = hashLyrics(currentLines) === sync.lyricsHash;
  const folded = fast ? [] : currentLines.map(foldAlnum);

  let stale = 0;
  const events: ResolvedEvent[] = sync.events.map((event) => {
    if (event.kind === "silence") return { t: event.t, lineIndex: null };

    if (fast) {
      const inRange = event.lineIndex >= 0 && event.lineIndex < currentLines.length;
      if (!inRange) stale++;
      return { t: event.t, lineIndex: inRange ? event.lineIndex : null };
    }

    const target = foldAlnum(event.lineText || "");
    if (!target) {
      stale++;
      return { t: event.t, lineIndex: null };
    }
    if (folded[event.lineIndex] === target) return { t: event.t, lineIndex: event.lineIndex };

    let best = -1;
    folded.forEach((text, index) => {
      if (text !== target) return;
      if (best === -1 || Math.abs(index - event.lineIndex) < Math.abs(best - event.lineIndex)) {
        best = index;
      }
    });
    if (best === -1) {
      stale++;
      return { t: event.t, lineIndex: null };
    }
    return { t: event.t, lineIndex: best };
  });

  events.sort((a, b) => a.t - b.t);
  return { events, stale };
}

/**
 * The line to light at time `t`: the line of the latest event at or before it. A
 * silence clears the spotlight, which is how intros and instrumental breaks go dark.
 */
export function activeLineAt(events: ResolvedEvent[], t: number): number | null {
  let active: number | null = null;
  for (const event of events) {
    if (event.t <= t + 1e-6) active = event.lineIndex;
    else break;
  }
  return active;
}

export function hasLineEvents(events: SyncEvent[] | null | undefined): boolean {
  return !!events && events.some((event) => event.kind === "line");
}
