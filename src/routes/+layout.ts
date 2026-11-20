import { listSongs, SONGS_DEPENDENCY } from "$lib/db/songs";
import type { LayoutLoad } from "./$types";

// The library lives in this browser's IndexedDB, so there is nothing to render on a server.
export const ssr = false;
export const prerender = false;

export const load: LayoutLoad = async ({ depends }) => {
  depends(SONGS_DEPENDENCY);
  return { songs: await listSongs() };
};
