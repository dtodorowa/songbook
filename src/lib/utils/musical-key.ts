const ROOTS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

/** Every key the picker offers: the twelve majors, then the twelve minors. */
export const MUSICAL_KEYS: string[] = [...ROOTS, ...ROOTS.map((root) => `${root}m`)];

const SHARP_TO_INDEX = new Map<string, number>([
  ...ROOTS.map((root, index) => [root, index] as const),
  ["Db", 1],
  ["D#", 3],
  ["Gb", 6],
  ["G#", 8],
  ["A#", 10],
]);

/**
 * The key you play in when the song's key is `musicalKey` and the capo sits on fret
 * `capo`: the chord shapes are that many semitones lower. Null when the key is not
 * one we can read.
 */
export function shapesWithCapo(musicalKey: string, capo: number): string | null {
  const match = musicalKey.match(/^([A-G](?:#|b)?)(m?)$/);
  if (!match) return null;
  const index = SHARP_TO_INDEX.get(match[1]);
  if (index == null) return null;
  const shifted = (((index - capo) % 12) + 12) % 12;
  return `${ROOTS[shifted]}${match[2]}`;
}
