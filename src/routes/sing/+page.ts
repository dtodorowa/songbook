import { redirect } from "@sveltejs/kit";
import { isSynced } from "$lib/data/song";
import { karaokeHref } from "$lib/utils/song-links";
import { pickRandom } from "$lib/utils/song-library";
import type { PageLoad } from "./$types";

// Sing along opens fullscreen karaoke on a random song whose lyrics follow along,
// so there is always something to sing. With nothing synced yet it shows how to get there instead.
export const load: PageLoad = async ({ parent }) => {
  const { songs } = await parent();
  const pick = pickRandom(songs.filter(isSynced));
  if (pick) redirect(307, karaokeHref(pick.id));
  return { songCount: songs.length };
};
