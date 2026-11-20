import { untrack } from "svelte";
import { SvelteSet } from "svelte/reactivity";
import type { SyncEvent } from "$lib/data/lyrics-sync";
import { buildSyncTimeline, finalizeSyncEvents } from "$lib/utils/lyrics-sync-timeline";

/** The usual reaction lag: most people tap about this far behind the singer. */
export const TAPPED_LATE_OFFSET = -0.3;

type CaptureInput = {
  lines: () => string[];
  initialEvents: SyncEvent[];
  currentTime: () => number;
};

const round2 = (n: number) => Number(Math.max(0, n).toFixed(2));

/**
 * Tap-capture state for one sync session (ADR 0014): the stamps, the line the next
 * tap lands on, the take-wide offset, and which lines were tapped in this pass so a
 * re-sync can tell fresh stamps from stale ones.
 */
export function createLyricsSyncCapture({ lines, initialEvents, currentTime }: CaptureInput) {
  // Snapshot, not a live binding: the editor remounts per open.
  let events = $state<SyncEvent[]>(untrack(() => [...initialEvents]));
  // Can rest at lines().length, meaning every line has been passed.
  let cursor = $state(0);
  let offset = $state(0);
  // Any change to the stamps or offset. Moving the cursor alone is not an edit.
  let dirty = $state(false);
  const tappedThisPass = new SvelteSet<number>();

  function setEvents(next: SyncEvent[]) {
    events = next;
    dirty = true;
  }

  function setOffset(next: number) {
    offset = next;
    dirty = true;
  }

  const timeline = $derived(buildSyncTimeline(lines(), events, offset));
  const hasLineStamps = $derived(events.some((event) => event.kind === "line"));
  const passStarted = $derived(tappedThisPass.size > 0);

  function moveCursor(to: number) {
    cursor = Math.max(0, Math.min(to, lines().length));
  }

  function tapLine() {
    if (cursor >= lines().length) return;
    setEvents([
      ...events,
      { kind: "line", lineIndex: cursor, lineText: lines()[cursor], t: round2(currentTime()) },
    ]);
    tappedThisPass.add(cursor);
    moveCursor(cursor + 1);
  }

  function markSilence() {
    setEvents([...events, { kind: "silence", t: round2(currentTime()) }]);
  }

  function undo() {
    const last = events.at(-1);
    if (!last) return;
    setEvents(events.slice(0, -1));
    if (last.kind !== "line") return;
    tappedThisPass.delete(last.lineIndex);
    moveCursor(Math.min(cursor - 1, last.lineIndex));
  }

  function nudge(eventIndex: number, delta: number) {
    setEvents(
      events.map((event, index) =>
        index === eventIndex ? { ...event, t: round2(event.t + delta) } : event
      )
    );
  }

  function remove(eventIndex: number) {
    const removed = events[eventIndex];
    setEvents(events.filter((_, index) => index !== eventIndex));
    if (removed?.kind === "line") tappedThisPass.delete(removed.lineIndex);
  }

  function shiftAll(delta: number) {
    setOffset(Number((offset + delta).toFixed(1)));
  }

  function toggleTappedLate() {
    setOffset(offset === TAPPED_LATE_OFFSET ? 0 : TAPPED_LATE_OFFSET);
  }

  return {
    get events() {
      return events;
    },
    get cursor() {
      return cursor;
    },
    get offset() {
      return offset;
    },
    get dirty() {
      return dirty;
    },
    get tappedLate() {
      return offset === TAPPED_LATE_OFFSET;
    },
    get timeline() {
      return timeline;
    },
    get hasLineStamps() {
      return hasLineStamps;
    },
    get tappedCount() {
      return tappedThisPass.size;
    },
    /** A stamp from an earlier take, once this pass has begun re-tapping. */
    isStale(lineIndex: number) {
      return passStarted && !tappedThisPass.has(lineIndex);
    },
    finalEvents: () => finalizeSyncEvents(events, offset),
    tapLine,
    skip: () => moveCursor(cursor + 1),
    back: () => moveCursor(cursor - 1),
    aimAt: moveCursor,
    markSilence,
    undo,
    nudge,
    remove,
    shiftAll,
    toggleTappedLate,
  };
}

export type LyricsSyncCapture = ReturnType<typeof createLyricsSyncCapture>;
