import type { SyncEvent } from "./lyrics-sync";

export type Song = {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  lyrics: string;
  /** Empty until the lyrics have been synced to the video. */
  syncEvents: SyncEvent[];
  /** Hash of the lyric lines the sync was captured against. */
  syncHash: string | null;
  categories: string[];
  /** How to play it. All optional, filled in as you learn the song. */
  musicalKey: string;
  capo: number | null;
  tempo: number | null;
  chords: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
  lastPlayedAt: number | null;
};

/** What the add/edit form owns. Sync and timestamps are managed elsewhere. */
export type SongDraft = Pick<
  Song,
  | "title"
  | "artist"
  | "youtubeId"
  | "lyrics"
  | "categories"
  | "musicalKey"
  | "capo"
  | "tempo"
  | "chords"
  | "notes"
>;

export function emptyDraft(): SongDraft {
  return {
    title: "",
    artist: "",
    youtubeId: "",
    lyrics: "",
    categories: [],
    musicalKey: "",
    capo: null,
    tempo: null,
    chords: "",
    notes: "",
  };
}

export function draftFromSong(song: Song): SongDraft {
  return {
    title: song.title,
    artist: song.artist,
    youtubeId: song.youtubeId,
    lyrics: song.lyrics,
    categories: [...song.categories],
    musicalKey: song.musicalKey,
    capo: song.capo,
    tempo: song.tempo,
    chords: song.chords,
    notes: song.notes,
  };
}

export function isSynced(song: Song): boolean {
  return song.syncEvents.some((event) => event.kind === "line");
}

export function hasPlayingInfo(song: Song): boolean {
  return (
    !!song.musicalKey ||
    song.capo != null ||
    song.tempo != null ||
    !!song.chords.trim() ||
    !!song.notes.trim()
  );
}
