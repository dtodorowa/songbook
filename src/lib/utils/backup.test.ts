import { describe, expect, it } from "vitest";
import { emptyDraft, type Song } from "$lib/data/song";
import { buildBackup, parseBackup } from "./backup";

const song: Song = {
  ...emptyDraft(),
  id: "a",
  title: "Jolene",
  youtubeId: "dQw4w9WgXcQ",
  syncEvents: [{ kind: "silence", t: 1 }],
  syncHash: "abc",
  createdAt: 1,
  updatedAt: 2,
  lastPlayedAt: null,
};

describe("parseBackup", () => {
  it("round-trips a backup", () => {
    const parsed = parseBackup(JSON.stringify(buildBackup([song], 5)));
    expect(parsed).toEqual({ ok: true, songs: [song] });
  });

  it("fills in fields an older backup doesn't have", () => {
    const old = {
      app: "songbook",
      version: 1,
      exportedAt: 5,
      songs: [{ id: "a", title: "Jolene", youtubeId: "x", createdAt: 1, updatedAt: 1 }],
    };
    const parsed = parseBackup(JSON.stringify(old));
    expect(parsed.ok && parsed.songs[0].categories).toEqual([]);
  });

  it("explains a file that isn't a backup", () => {
    expect(parseBackup("nope")).toEqual({ ok: false, error: "That file isn't valid JSON." });
    expect(parseBackup("{}")).toEqual({ ok: false, error: "That file isn't a songbook backup." });
  });
});
