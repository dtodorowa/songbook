/** The one text-input look, so every field in a form lines up. */
export const INPUT =
  "w-full rounded-lg border border-ink/15 bg-card px-3 py-2.5 font-sans text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent-purple/60";

export const TEXTAREA = `${INPUT} min-h-32 resize-y leading-relaxed`;

/** An empty number field binds as null or NaN depending on the browser; both mean "not set". */
export function optionalNumber(value: number | null | undefined): number | null {
  return value == null || Number.isNaN(value) ? null : value;
}
