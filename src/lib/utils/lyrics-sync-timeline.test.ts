import { describe, expect, it } from "vitest";
import type { SyncEvent } from "$lib/data/lyrics-sync";
import {
  buildSyncTimeline,
  finalizeSyncEvents,
  formatOffset,
  formatSyncTime,
  shiftedTime,
} from "./lyrics-sync-timeline";

const line = (lineIndex: number, t: number): SyncEvent => ({
  kind: "line",
  lineIndex,
  lineText: `line ${lineIndex}`,
  t,
});
const silence = (t: number): SyncEvent => ({ kind: "silence", t });

const shape = (rows: ReturnType<typeof buildSyncTimeline>) =>
  rows.map((row) => (row.kind === "line" ? `L${row.lineIndex}` : `gap@${row.stamp.t}`));

describe("buildSyncTimeline", () => {
  const lines = ["a", "b", "c", "d"];

  it("weaves a gap in after the last line that started before it", () => {
    const events = [line(0, 10), line(1, 20), silence(25), line(2, 40), line(3, 50)];
    expect(shape(buildSyncTimeline(lines, events))).toEqual(["L0", "L1", "gap@25", "L2", "L3"]);
  });

  it("keeps an unstamped (skipped) line after the gap that follows its stamped neighbour", () => {
    const events = [line(0, 10), silence(15), line(2, 40)];
    expect(shape(buildSyncTimeline(lines, events))).toEqual(["L0", "gap@15", "L1", "L2", "L3"]);
  });

  it("puts a gap before any stamped line at the top", () => {
    const events = [silence(2), line(0, 10)];
    expect(shape(buildSyncTimeline(lines, events))).toEqual(["gap@2", "L0", "L1", "L2", "L3"]);
  });

  it("lands a gap after a repeated earlier line by that line's first stamp", () => {
    const events = [line(0, 10), line(1, 20), line(0, 60), silence(30)];
    expect(shape(buildSyncTimeline(lines, events))).toEqual(["L0", "L1", "gap@30", "L2", "L3"]);
  });

  it("applies the offset to every shown stamp and keeps the event index", () => {
    const rows = buildSyncTimeline(["a"], [line(0, 10)], -0.3);
    expect(rows[0]).toEqual({
      kind: "line",
      lineIndex: 0,
      text: "a",
      stamps: [{ eventIndex: 0, t: 9.7 }],
    });
  });
});

describe("finalizeSyncEvents", () => {
  it("bakes in the offset and sorts by time", () => {
    expect(finalizeSyncEvents([line(1, 20), silence(5)], 0.5)).toEqual([
      silence(5.5),
      line(1, 20.5),
    ]);
  });

  it("never shifts a stamp below zero", () => {
    expect(shiftedTime(0.1, -0.3)).toBe(0);
  });
});

describe("formatting", () => {
  it("formats times as m:ss.s", () => {
    expect(formatSyncTime(68.94)).toBe("1:08.9");
    expect(formatSyncTime(5)).toBe("0:05.0");
  });

  it("formats the offset with a real minus sign", () => {
    expect(formatOffset(-0.3)).toBe("−0.3s");
    expect(formatOffset(0)).toBe("+0.0s");
  });
});
