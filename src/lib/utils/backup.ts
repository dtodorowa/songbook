import { z } from "zod";
import type { Song } from "$lib/data/song";

const syncEventSchema = z.union([
  z.object({
    kind: z.literal("line"),
    lineIndex: z.number().int(),
    lineText: z.string(),
    t: z.number(),
  }),
  z.object({ kind: z.literal("silence"), t: z.number() }),
]);

const songSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  artist: z.string().default(""),
  youtubeId: z.string(),
  lyrics: z.string().default(""),
  syncEvents: z.array(syncEventSchema).default([]),
  syncHash: z.string().nullable().default(null),
  categories: z.array(z.string()).default([]),
  musicalKey: z.string().default(""),
  capo: z.number().nullable().default(null),
  tempo: z.number().nullable().default(null),
  chords: z.string().default(""),
  notes: z.string().default(""),
  createdAt: z.number(),
  updatedAt: z.number(),
  lastPlayedAt: z.number().nullable().default(null),
});

const backupSchema = z.object({
  app: z.literal("songbook"),
  version: z.literal(1),
  exportedAt: z.number(),
  songs: z.array(songSchema),
});

export type Backup = z.infer<typeof backupSchema>;

export function buildBackup(songs: Song[], now: number): Backup {
  return { app: "songbook", version: 1, exportedAt: now, songs };
}

export type ParsedBackup = { ok: true; songs: Song[] } | { ok: false; error: string };

/** Read a backup file's text. Fields added after a backup was made fall back to defaults. */
export function parseBackup(text: string): ParsedBackup {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: "That file isn't valid JSON." };
  }
  const result = backupSchema.safeParse(json);
  if (!result.success) return { ok: false, error: "That file isn't a songbook backup." };
  return { ok: true, songs: result.data.songs };
}

export function backupFileName(now: Date): string {
  return `songbook-${now.toISOString().slice(0, 10)}.json`;
}
