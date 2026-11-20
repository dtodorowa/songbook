import { describe, expect, it } from "vitest";
import {
  sungLineStamps,
  isSungLine,
  adjacentSungLine,
  karaokeCountdownAt,
  asSungSequence,
  asSungWithSkipped,
  activeSungTime,
  isReaderScroll,
  SCROLL_INTENT_MS,
} from "./lyrics-reader";
import type { ResolvedEvent } from "$lib/data/lyrics-sync";

const ev = (t: number, lineIndex: number | null): ResolvedEvent => ({ t, lineIndex });

describe("sungLineStamps", () => {
  it("keeps the earliest time per line and drops silence events", () => {
    const stamps = sungLineStamps([ev(5, 0), ev(2, 0), ev(10, null), ev(7, 2)]);
    expect(stamps.get(0)).toBe(2); // earliest wins over the later 5
    expect(stamps.has(1)).toBe(false); // never stamped
    expect(stamps.get(2)).toBe(7);
    expect([...stamps.keys()].sort()).toEqual([0, 2]);
  });

  it("is empty for no events", () => {
    expect(sungLineStamps([]).size).toBe(0);
  });
});

describe("isSungLine", () => {
  const stamps = new Map([
    [0, 1],
    [2, 3],
  ]);
  it("treats every line as sung when unsynced", () => {
    expect(isSungLine(1, false, stamps)).toBe(true);
    expect(isSungLine(99, false, new Map())).toBe(true);
  });
  it("requires a stamp when synced", () => {
    expect(isSungLine(0, true, stamps)).toBe(true);
    expect(isSungLine(1, true, stamps)).toBe(false);
  });
});

describe("adjacentSungLine", () => {
  // 5 lines; only 1 and 3 are sung.
  const sung = (i: number) => i === 1 || i === 3;

  it("steps forward to the next sung line", () => {
    expect(adjacentSungLine(1, 1, 5, sung)).toBe(3);
    expect(adjacentSungLine(null, 1, 5, sung)).toBe(1); // from nowhere → first sung
  });

  it("steps backward to the previous sung line", () => {
    expect(adjacentSungLine(3, -1, 5, sung)).toBe(1);
    expect(adjacentSungLine(null, -1, 5, sung)).toBe(3); // from nowhere → last sung
  });

  it("stays put when there is nothing sung that way", () => {
    expect(adjacentSungLine(3, 1, 5, sung)).toBe(3); // nothing sung after 3
    expect(adjacentSungLine(1, -1, 5, sung)).toBe(1); // nothing sung before 1
  });

  it("with everything sung, moves by one and clamps at the edges", () => {
    const all = () => true;
    expect(adjacentSungLine(2, 1, 5, all)).toBe(3);
    expect(adjacentSungLine(4, 1, 5, all)).toBe(4); // clamped at last
    expect(adjacentSungLine(0, -1, 5, all)).toBe(0); // clamped at first
  });
});

describe("karaokeCountdownAt", () => {
  // line0@10, silence@13, line1@20, trailing silence@30 (last line ends, outro).
  const events: ResolvedEvent[] = [ev(10, 0), ev(13, null), ev(20, 1), ev(30, null)];

  it("returns null while a line is lit (teleprompter shows it instead)", () => {
    expect(karaokeCountdownAt(events, 11, 0)).toBeNull(); // line 0 active
    expect(karaokeCountdownAt(events, 25, 0)).toBeNull(); // line 1 active (last line)
  });

  it("counts toward the first line during the intro", () => {
    const cue = karaokeCountdownAt(events, 5, 0);
    expect(cue).toEqual({ toLine: 0, progress: 0.5, secsLeft: 5 });
  });

  it("counts toward the next line during a mid-song gap", () => {
    const cue = karaokeCountdownAt(events, 15, 0);
    expect(cue?.toLine).toBe(1);
    expect(cue?.secsLeft).toBe(5);
    expect(cue?.progress).toBeCloseTo(2 / 7, 5);
  });

  it("returns an outro cue (toLine null) once past the last line", () => {
    expect(karaokeCountdownAt(events, 30, 0)).toEqual({ toLine: null, progress: 0, secsLeft: 0 });
    expect(karaokeCountdownAt(events, 45, 0)).toEqual({ toLine: null, progress: 0, secsLeft: 0 });
  });

  it("does not snap to the first line at the outro (regression: was toLine 0)", () => {
    const cue = karaokeCountdownAt(events, 40, 0);
    expect(cue?.toLine).not.toBe(0);
    expect(cue?.toLine).toBeNull();
  });

  it("hands the cue off to the highlighted line `lead` seconds early", () => {
    // With a 0.7s lead, line 0 (@10) lights at rawT 9.3; before that it's a cue.
    expect(karaokeCountdownAt(events, 9.0, 0.7)?.toLine).toBe(0); // still counting down
    expect(karaokeCountdownAt(events, 9.5, 0.7)).toBeNull(); // line now lit
  });

  it("returns null before any events with nothing to cue", () => {
    expect(karaokeCountdownAt([], 5, 0)).toBeNull();
  });
});

describe("asSungSequence", () => {
  const lines = ["Uno", "Dos", "Tres"];

  it("lists lines in performance order with repeats spelled out", () => {
    // Refrain (line 0) sung, then line 1, then line 0 again.
    const events = [ev(10, 0), ev(13, 1), ev(16, 0)];
    expect(asSungSequence(events, lines)).toEqual([
      { kind: "line", text: "Uno", t: 10, lineIndex: 0 },
      { kind: "line", text: "Dos", t: 13, lineIndex: 1 },
      { kind: "line", text: "Uno", t: 16, lineIndex: 0 },
    ]);
  });

  it("emits a pause for a long silence run and spans it to the next line", () => {
    // line0@10, silence@12, then line1@20 → an 8s instrumental gap.
    const events = [ev(10, 0), ev(12, null), ev(20, 1)];
    expect(asSungSequence(events, lines)).toEqual([
      { kind: "line", text: "Uno", t: 10, lineIndex: 0 },
      { kind: "pause", from: 12, to: 20 },
      { kind: "line", text: "Dos", t: 20, lineIndex: 1 },
    ]);
  });

  it("drops a silence shorter than the threshold (a breath, not a gap)", () => {
    const events = [ev(10, 0), ev(11, null), ev(12, 1)]; // 1s gap < 3s default
    expect(asSungSequence(events, lines)).toEqual([
      { kind: "line", text: "Uno", t: 10, lineIndex: 0 },
      { kind: "line", text: "Dos", t: 12, lineIndex: 1 },
    ]);
  });

  it("collapses a run of consecutive silences into one pause from its start", () => {
    const events = [ev(10, 0), ev(12, null), ev(14, null), ev(22, 1)];
    expect(asSungSequence(events, lines)).toEqual([
      { kind: "line", text: "Uno", t: 10, lineIndex: 0 },
      { kind: "pause", from: 12, to: 22 },
      { kind: "line", text: "Dos", t: 22, lineIndex: 1 },
    ]);
  });

  it("drops a trailing silence (the outro) with no line after it", () => {
    const events = [ev(10, 0), ev(30, null)];
    expect(asSungSequence(events, lines)).toEqual([
      { kind: "line", text: "Uno", t: 10, lineIndex: 0 },
    ]);
  });

  it("treats a stale line (null after a letra edit) as silence", () => {
    const events = [ev(10, 0), ev(12, null), ev(20, 2)];
    expect(asSungSequence(events, lines)).toEqual([
      { kind: "line", text: "Uno", t: 10, lineIndex: 0 },
      { kind: "pause", from: 12, to: 20 },
      { kind: "line", text: "Tres", t: 20, lineIndex: 2 },
    ]);
  });

  it("honors a custom minimum-pause threshold", () => {
    const events = [ev(10, 0), ev(12, null), ev(16, 1)]; // 4s gap
    expect(asSungSequence(events, lines, 5)).toEqual([
      { kind: "line", text: "Uno", t: 10, lineIndex: 0 },
      { kind: "line", text: "Dos", t: 16, lineIndex: 1 },
    ]);
  });

  it("is empty for no events", () => {
    expect(asSungSequence([], lines)).toEqual([]);
  });
});

describe("asSungWithSkipped", () => {
  const lines = ["Uno", "Dos", "Tres", "Cuatro"];

  it("weaves un-sung verses in at their letra position, dimmed as skipped", () => {
    // Sings lines 0 and 2; skips 1 and 3.
    const events = [ev(10, 0), ev(20, 2)];
    expect(asSungWithSkipped(events, lines)).toEqual([
      { kind: "line", text: "Uno", t: 10, lineIndex: 0 },
      { kind: "skipped", text: "Dos", lineIndex: 1 },
      { kind: "line", text: "Tres", t: 20, lineIndex: 2 },
      { kind: "skipped", text: "Cuatro", lineIndex: 3 },
    ]);
  });

  it("surfaces a skipped intro before the first sung line and an outro after the last", () => {
    // Only the middle line (1) is sung.
    const events = [ev(10, 1)];
    expect(asSungWithSkipped(events, ["Uno", "Dos", "Tres"])).toEqual([
      { kind: "skipped", text: "Uno", lineIndex: 0 },
      { kind: "line", text: "Dos", t: 10, lineIndex: 1 },
      { kind: "skipped", text: "Tres", lineIndex: 2 },
    ]);
  });

  it("does not treat an out-of-order or repeated line as a skip", () => {
    // Sung order 0, 2, 1 (line 1 comes late) then 0 again — every line is stamped.
    const events = [ev(10, 0), ev(15, 2), ev(20, 1), ev(25, 0)];
    expect(asSungWithSkipped(events, ["Uno", "Dos", "Tres"])).toEqual([
      { kind: "line", text: "Uno", t: 10, lineIndex: 0 },
      { kind: "line", text: "Tres", t: 15, lineIndex: 2 },
      { kind: "line", text: "Dos", t: 20, lineIndex: 1 },
      { kind: "line", text: "Uno", t: 25, lineIndex: 0 },
    ]);
  });

  it("keeps an instrumental pause and drops the skipped verse in after it", () => {
    // line0@10, silence, line2@22 (skips line 1) → pause, then the skipped verse.
    const events = [ev(10, 0), ev(12, null), ev(22, 2)];
    expect(asSungWithSkipped(events, ["Uno", "Dos", "Tres"])).toEqual([
      { kind: "line", text: "Uno", t: 10, lineIndex: 0 },
      { kind: "pause", from: 12, to: 22 },
      { kind: "skipped", text: "Dos", lineIndex: 1 },
      { kind: "line", text: "Tres", t: 22, lineIndex: 2 },
    ]);
  });

  it("emits a skipped verse only once even across a later repeat", () => {
    // Sings 0, 2, then 0 again; line 1 is never sung.
    const events = [ev(10, 0), ev(20, 2), ev(30, 0)];
    expect(asSungWithSkipped(events, ["Uno", "Dos", "Tres"])).toEqual([
      { kind: "line", text: "Uno", t: 10, lineIndex: 0 },
      { kind: "skipped", text: "Dos", lineIndex: 1 },
      { kind: "line", text: "Tres", t: 20, lineIndex: 2 },
      { kind: "line", text: "Uno", t: 30, lineIndex: 0 },
    ]);
  });

  it("is empty for no events and no lines", () => {
    expect(asSungWithSkipped([], [])).toEqual([]);
  });
});

describe("activeSungTime", () => {
  // line0@10, silence@13, line0-repeat@20.
  const events: ResolvedEvent[] = [ev(10, 0), ev(13, null), ev(20, 0)];

  it("returns the time of the latest line at or before t", () => {
    expect(activeSungTime(events, 11)).toBe(10);
    expect(activeSungTime(events, 25)).toBe(20); // the repeat, not the first stamp
  });

  it("is null during a silence and before anything plays", () => {
    expect(activeSungTime(events, 15)).toBeNull(); // in the gap
    expect(activeSungTime(events, 5)).toBeNull(); // before line 0
  });
});

describe("isReaderScroll", () => {
  it("counts a scroll right after a wheel, touch or paging key", () => {
    expect(isReaderScroll(1000, 1000 + SCROLL_INTENT_MS)).toBe(true);
  });

  it("ignores scrolls with no recent input, like auto-follow's own", () => {
    expect(isReaderScroll(null, 5000)).toBe(false);
    expect(isReaderScroll(1000, 1001 + SCROLL_INTENT_MS)).toBe(false);
  });
});
