import { activeLineAt, lyricLines, resolveSync } from "$lib/data/lyrics-sync";
import type { Song } from "$lib/data/song";
import { adjacentSungLine, karaokeCountdownAt, sungLineStamps } from "$lib/utils/lyrics-reader";

/**
 * Karaoke lights a line this far ahead of its stamp, so you see it before you sing it.
 * The inline reader stays exactly on time.
 */
const KARAOKE_LEAD = 0.7;

type Input = {
  song: () => Song;
  currentTime: () => number;
  karaoke: () => boolean;
};

/**
 * What the song page and karaoke screen read: the lyric lines, the line lit right
 * now, and the countdown through an instrumental gap. With no sync, the lit line is
 * whatever the singer stepped to by hand.
 */
export function createSingAlong({ song, currentTime, karaoke }: Input) {
  const lines = $derived(lyricLines(song().lyrics));
  const resolved = $derived(
    song().syncHash
      ? resolveSync({ lyricsHash: song().syncHash ?? "", events: song().syncEvents }, lines)
      : null
  );
  const events = $derived(resolved?.events ?? []);
  const stamps = $derived(sungLineStamps(events));
  const isSynced = $derived(stamps.size > 0);
  const stampedLines = $derived(new Set(stamps.keys()));

  let manualLine = $state<number | null>(null);

  const lead = $derived(karaoke() ? KARAOKE_LEAD : 0);
  const activeLine = $derived(isSynced ? activeLineAt(events, currentTime() + lead) : manualLine);
  const countdown = $derived(
    isSynced && karaoke() ? karaokeCountdownAt(events, currentTime(), KARAOKE_LEAD) : null
  );

  function step(direction: 1 | -1) {
    manualLine = adjacentSungLine(manualLine, direction, lines.length, () => true);
  }

  return {
    get lines() {
      return lines;
    },
    get isSynced() {
      return isSynced;
    },
    get stampedLines() {
      return stampedLines;
    },
    get activeLine() {
      return activeLine;
    },
    get countdown() {
      return countdown;
    },
    get staleCount() {
      return resolved?.stale ?? 0;
    },
    /** When a line is first sung, for click-to-hear. Undefined for an unsung line. */
    stampOf(lineIndex: number): number | undefined {
      return stamps.get(lineIndex);
    },
    selectLine(lineIndex: number) {
      manualLine = lineIndex;
    },
    step,
  };
}

export type SingAlong = ReturnType<typeof createSingAlong>;
