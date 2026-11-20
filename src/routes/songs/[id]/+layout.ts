import { error } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ params, parent }) => {
  const { songs } = await parent();
  const song = songs.find((candidate) => candidate.id === params.id);
  if (!song) error(404, "That song isn't in your library.");
  return { song };
};
