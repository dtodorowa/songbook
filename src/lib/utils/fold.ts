const stripDiacritics = (text: string): string =>
  text.normalize("NFD").replace(/\p{Diacritic}/gu, "");

/** Lowercase letters and digits only, accents dropped: for matching text loosely. */
export const foldAlnum = (text: string): string =>
  stripDiacritics(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

/** A stable djb2 hash of a list of lines. */
export function hashLines(lines: string[]): string {
  const joined = lines.join("\n");
  let hash = 5381;
  for (let index = 0; index < joined.length; index++) {
    hash = ((hash << 5) + hash + joined.charCodeAt(index)) | 0;
  }
  return (hash >>> 0).toString(16);
}
