export const KARAOKE_PARAM = "karaoke";

export function songHref(id: string): string {
  return `/songs/${id}`;
}

/** A song page that opens straight into fullscreen karaoke. */
export function karaokeHref(id: string): string {
  return `${songHref(id)}?${KARAOKE_PARAM}`;
}
