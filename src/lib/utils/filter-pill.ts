/**
 * What a filter pill says while something is picked: the pick itself, or the first
 * pick and how many more. Null while nothing is picked, so the pill shows its name.
 */
export function summarizePicks(labels: readonly string[]): string | null {
  if (labels.length === 0) return null;
  if (labels.length === 1) return labels[0];
  return `${labels[0]} +${labels.length - 1}`;
}

// The pill look shared by FilterPill and the searchable facet pickers that sit in the
// same bar, so a combobox reads as one more pill rather than a form field.
export const FILTER_PILL =
  "inline-flex h-9 w-auto shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-0 text-sm font-medium transition-colors";
export const FILTER_PILL_ON = "border-accent-purple bg-accent-purple/10 text-accent-purple";
export const FILTER_PILL_OFF = "border-ink/15 bg-card text-ink hover:border-ink/30";
