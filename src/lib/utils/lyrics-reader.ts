import { activeLineAt, type ResolvedEvent } from "$lib/data/lyrics-sync";

// Pure line-navigation helpers for the lyrics reader. A "sung" line is one the
// recording actually stamps (with a sync) — the rest are scaffolding the reader
// skips over. No reactive state or DOM here; the page/store threads the current
// sync + line count in.

/**
 * Earliest stamped time per line index — lets a reader click a line to hear it.
 * Later duplicate stamps for a line lose to the earliest one.
 */
export function sungLineStamps(events: ResolvedEvent[]): Map<number, number> {
  const m = new Map<number, number>();
  for (const e of events) {
    if (e.lineIndex == null) continue;
    const prev = m.get(e.lineIndex);
    if (prev === undefined || e.t < prev) m.set(e.lineIndex, e.t);
  }
  return m;
}

/**
 * Is line `i` actually sung in this recording? With no sync every line counts;
 * with a sync, only lines carrying a stamp are sung.
 */
export function isSungLine(i: number, isSynced: boolean, stamps: Map<number, number>): boolean {
  return !isSynced || stamps.has(i);
}

/**
 * The next/prev sung line from `from` in direction `dir`, skipping un-sung lines so
 * the spotlight only ever lands on lines in the recording. Stays put (returns
 * `from`, or an edge) when there's nothing sung that way.
 */
export function adjacentSungLine(
  from: number | null,
  dir: 1 | -1,
  lineCount: number,
  isSung: (i: number) => boolean
): number {
  let i = from == null ? (dir === 1 ? -1 : lineCount) : from;
  for (i += dir; i >= 0 && i < lineCount; i += dir) if (isSung(i)) return i;
  return from ?? (dir === 1 ? 0 : lineCount - 1); // nothing that way — stay put
}

export interface KaraokeCue {
  /** The line the cue counts toward, or null for an outro/tail with none coming. */
  toLine: number | null;
  /** 0→1 fill toward the next line; 0 for an outro (no target). */
  progress: number;
  /** Seconds until the next line lands; 0 for an outro. */
  secsLeft: number;
}

/**
 * The karaoke cue while no line is lit — the ambient screen shown during the intro,
 * an instrumental gap between lines, or the outro after the last line. Returns null
 * when a line is currently active (the teleprompter shows it instead) or there's
 * nothing to cue at all.
 *
 * `lead` looks that many seconds ahead so the cue hands off to the highlighted line
 * just *before* it's sung. A returned `toLine == null` is the outro: playback has
 * passed the final line (a trailing silence event) with nothing more to sing, so
 * the caller should render an ambient bar-only screen until the track ends — rather
 * than letting the last line linger or snapping back to the first.
 */
export function karaokeCountdownAt(
  events: ResolvedEvent[],
  rawT: number,
  lead: number
): KaraokeCue | null {
  const t = rawT + lead;
  if (activeLineAt(events, t) != null) return null; // a line is lit — no cue

  // Latest event at/before `t` (bounds the gap start) and the next real line.
  let prevT = 0;
  let nextLine: ResolvedEvent | null = null;
  for (const e of events) {
    if (e.t <= t) prevT = e.t;
    else if (e.lineIndex != null) {
      nextLine = e;
      break;
    }
  }

  if (nextLine) {
    // Intro or mid-song gap: fill a bar toward the upcoming line.
    const startRaw = prevT - lead;
    const endRaw = nextLine.t - lead;
    const span = Math.max(0.01, endRaw - startRaw);
    return {
      toLine: nextLine.lineIndex,
      progress: Math.min(1, Math.max(0, (rawT - startRaw) / span)),
      secsLeft: Math.max(0, endRaw - rawT),
    };
  }

  // No upcoming line. If we've passed at least one event, this is the outro (a
  // trailing silence after the last line) — ambient screen, no target.
  if (prevT > 0) return { toLine: null, progress: 0, secsLeft: 0 };

  return null;
}

// An item in the "as-sung" reading view (issue #167): a line as actually
// performed, an instrumental pause between two sung lines, or a `skipped` line —
// a verse the printed letra has that this recording never sings, woven back in at
// its natural spot so the reader still sees the whole poem (dimmed, "not in this
// recording"). Only `line`/`pause` come from the raw sequence; `skipped` is added
// by `asSungWithSkipped`.
export type AsSungItem =
  | { kind: "line"; text: string; t: number; lineIndex: number }
  | { kind: "pause"; from: number; to: number }
  | { kind: "skipped"; text: string; lineIndex: number };

// A silence shorter than this is a breath between phrases, not an instrumental
// gap worth drawing — don't emit a pause marker for it.
export const MIN_PAUSE_SECONDS = 3;

/**
 * The letra in performance order: each stamped line event becomes a line item, so
 * a refrain sung three times appears three times (unlike the printed reader, which
 * re-lights the one printed line); each run of silence long enough to matter
 * becomes a single `pause` item spanning the gap to the next sung line. A pure
 * transform over the already-time-ordered resolved events — the sync stamps
 * everything we need (ADR 0014).
 *
 * Trailing silence (the outro) is dropped: with nothing left to sing, a pause
 * marker there would just dangle. Events pointing at a line that no longer exists
 * (a null `lineIndex` after a letra edit) count as silence, same as `activeLineAt`.
 */
export function asSungSequence(
  events: ResolvedEvent[],
  lines: string[],
  minPause = MIN_PAUSE_SECONDS
): AsSungItem[] {
  const items: AsSungItem[] = [];
  let pauseFrom: number | null = null; // start of an open silence run, if any

  for (const e of events) {
    const text = e.lineIndex == null ? undefined : lines[e.lineIndex];
    if (text == null) {
      // Silence (or a stale line): open a pause run, keeping its earliest start.
      if (pauseFrom == null) pauseFrom = e.t;
      continue;
    }
    // A sung line closes any open pause run in front of it.
    if (pauseFrom != null && e.t - pauseFrom >= minPause) {
      items.push({ kind: "pause", from: pauseFrom, to: e.t });
    }
    pauseFrom = null;
    items.push({ kind: "line", text, t: e.t, lineIndex: e.lineIndex! });
  }

  return items;
}

/**
 * The as-sung sequence with the recording's *skipped* verses woven back in — the
 * one reading view: every line the recording sings (in order, repeats + pauses
 * spelled out by `asSungSequence`) plus every line it doesn't, dropped in at its
 * natural place in the printed letra so the whole poem still reads top to bottom.
 *
 * Placement is by letra index: as the sung sequence advances, any never-sung line
 * whose index we pass gets emitted right before the sung line that follows it. A
 * line sung out of order or repeated is *not* a skip (it carries a stamp), so it's
 * never duplicated as `skipped`. Leading skips (an un-sung intro) surface before
 * the first sung line; trailing skips (an un-sung outro verse) after the last.
 */
export function asSungWithSkipped(
  events: ResolvedEvent[],
  lines: string[],
  minPause = MIN_PAUSE_SECONDS
): AsSungItem[] {
  const base = asSungSequence(events, lines, minPause);
  const sung = new Set<number>();
  for (const e of events)
    if (e.lineIndex != null && lines[e.lineIndex] != null) sung.add(e.lineIndex);

  const out: AsSungItem[] = [];
  let maxSeen = -1; // highest letra index the sung sequence has reached so far
  const revealThrough = (limit: number) => {
    for (let k = maxSeen + 1; k < limit; k++) {
      if (!sung.has(k) && lines[k] != null)
        out.push({ kind: "skipped", text: lines[k], lineIndex: k });
    }
  };

  for (const item of base) {
    if (item.kind === "line") {
      revealThrough(item.lineIndex); // un-sung verses before this line
      if (item.lineIndex > maxSeen) maxSeen = item.lineIndex;
    }
    out.push(item);
  }
  revealThrough(lines.length); // un-sung outro verses after the last sung line
  return out;
}

/**
 * The absolute time of the line occurrence active at `t` — the latest line event
 * at or before `t`, or null when the latest event is a silence (spotlight dark) or
 * nothing has played yet. Where `activeLineAt` answers *which* line, this answers
 * *when* it was stamped, so the as-sung view can light the exact occurrence being
 * sung rather than every repeat of that line.
 */
export function activeSungTime(events: ResolvedEvent[], t: number): number | null {
  let active: number | null = null;
  for (const e of events) {
    if (e.t <= t + 1e-6) active = e.lineIndex == null ? null : e.t;
    else break;
  }
  return active;
}

/** How long after a wheel, touch or paging key a page scroll still counts as the reader's. */
export const SCROLL_INTENT_MS = 400;

/** Keys that scroll the page without moving the spotlight. Arrows are left to handleKey. */
export const SCROLL_KEYS = new Set(["PageUp", "PageDown", "Home", "End"]);

/**
 * Did the reader scroll the page themselves? Auto-follow's own smooth scroll fires
 * `scroll` events too, so a scroll only counts when a wheel, touch or paging key
 * landed just before it.
 */
export function isReaderScroll(lastIntentAt: number | null, now: number): boolean {
  if (lastIntentAt == null) return false;
  return now - lastIntentAt <= SCROLL_INTENT_MS;
}
