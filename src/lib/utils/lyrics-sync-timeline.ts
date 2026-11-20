import type { SyncEvent } from "$lib/data/lyrics-sync";

/** One stamp as the editor shows it: its time with the take's offset applied. */
export type TimelineStamp = { eventIndex: number; t: number };

export type TimelineRow =
  | { kind: "line"; lineIndex: number; text: string; stamps: TimelineStamp[] }
  | { kind: "silence"; stamp: TimelineStamp };

const round2 = (n: number) => Number(Math.max(0, n).toFixed(2));

/** A stamp's time once the take-wide offset is applied, never below zero. */
export function shiftedTime(t: number, offset: number): number {
  return round2(t + offset);
}

/**
 * The letra in letra order, with each instrumental gap woven in after the last line
 * that started before it. Gaps don't hang off a line, but listing them apart broke
 * the one thing the editor is for: reading the song top to bottom as it plays.
 * Gaps that come before any stamped line lead the list.
 */
export function buildSyncTimeline(lines: string[], events: SyncEvent[], offset = 0): TimelineRow[] {
  const stampsByLine = new Map<number, TimelineStamp[]>();
  const silences: TimelineStamp[] = [];
  events.forEach((event, eventIndex) => {
    const stamp = { eventIndex, t: shiftedTime(event.t, offset) };
    if (event.kind === "silence") {
      silences.push(stamp);
      return;
    }
    const stamps = stampsByLine.get(event.lineIndex) ?? [];
    stamps.push(stamp);
    stampsByLine.set(event.lineIndex, stamps);
  });
  silences.sort((a, b) => a.t - b.t);

  // For each gap, the last line (in letra order) whose first stamp is at or before it.
  const gapsAfterLine = new Map<number, TimelineStamp[]>();
  const leadingGaps: TimelineStamp[] = [];
  for (const silence of silences) {
    let anchor = -1;
    lines.forEach((_, lineIndex) => {
      const first = stampsByLine.get(lineIndex)?.[0];
      if (first && first.t <= silence.t) anchor = lineIndex;
    });
    if (anchor < 0) leadingGaps.push(silence);
    else gapsAfterLine.set(anchor, [...(gapsAfterLine.get(anchor) ?? []), silence]);
  }

  const rows: TimelineRow[] = leadingGaps.map((stamp) => ({ kind: "silence", stamp }));
  lines.forEach((text, lineIndex) => {
    const stamps = [...(stampsByLine.get(lineIndex) ?? [])].sort((a, b) => a.t - b.t);
    rows.push({ kind: "line", lineIndex, text, stamps });
    for (const stamp of gapsAfterLine.get(lineIndex) ?? []) rows.push({ kind: "silence", stamp });
  });
  return rows;
}

/** Every event with the offset baked in, in time order: what gets saved. */
export function finalizeSyncEvents(events: SyncEvent[], offset: number): SyncEvent[] {
  return events
    .map((event) => ({ ...event, t: shiftedTime(event.t, offset) }))
    .sort((a, b) => a.t - b.t);
}

/** `m:ss.s`, the precision a tap can actually hit. */
export function formatSyncTime(t: number): string {
  const seconds = Math.max(0, t);
  const minutes = Math.floor(seconds / 60);
  const rest = (seconds % 60).toFixed(1).padStart(4, "0");
  return `${minutes}:${rest}`;
}

/** `+0.3s` / `−0.3s` with a real minus sign, for the offset readout. */
export function formatOffset(offset: number): string {
  const sign = offset < 0 ? "−" : "+";
  return `${sign}${Math.abs(offset).toFixed(1)}s`;
}
