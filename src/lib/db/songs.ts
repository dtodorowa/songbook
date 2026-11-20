import Dexie, { type EntityTable } from "dexie";
import type { SyncEvent } from "$lib/data/lyrics-sync";
import type { Song, SongDraft } from "$lib/data/song";

/** The cache key every load that reads the library declares, and every write invalidates. */
export const SONGS_DEPENDENCY = "songbook:songs";

const db = new Dexie("songbook") as Dexie & { songs: EntityTable<Song, "id"> };
db.version(1).stores({ songs: "id, title, artist, *categories, createdAt" });

export function listSongs(): Promise<Song[]> {
  return db.songs.toArray();
}

export async function createSong(draft: SongDraft): Promise<string> {
  const now = Date.now();
  const id = crypto.randomUUID();
  await db.songs.add({
    ...draft,
    id,
    syncEvents: [],
    syncHash: null,
    createdAt: now,
    updatedAt: now,
    lastPlayedAt: null,
  });
  return id;
}

/** Changing the video drops the sync: its stamps belong to the old upload's clock. */
export async function updateSong(song: Song, draft: SongDraft): Promise<void> {
  const videoChanged = draft.youtubeId !== song.youtubeId;
  await db.songs.update(song.id, {
    ...draft,
    ...(videoChanged ? { syncEvents: [], syncHash: null } : {}),
    updatedAt: Date.now(),
  });
}

export async function saveSync(id: string, events: SyncEvent[], hash: string): Promise<void> {
  await db.songs.update(id, { syncEvents: events, syncHash: hash, updatedAt: Date.now() });
}

export async function clearSync(id: string): Promise<void> {
  await db.songs.update(id, { syncEvents: [], syncHash: null, updatedAt: Date.now() });
}

export async function markPlayed(id: string): Promise<void> {
  await db.songs.update(id, { lastPlayedAt: Date.now() });
}

export async function deleteSong(id: string): Promise<void> {
  await db.songs.delete(id);
}

/** Restore a backup. Songs with the same id are replaced; everything else stays. */
export async function importSongs(songs: Song[]): Promise<void> {
  await db.songs.bulkPut(songs);
}
