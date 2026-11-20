import { cn } from "$lib/utils";
import { PRESS_FLAT } from "./press";

// Apple Music's tracklist trick: every other row carries a faint wash instead of a
// rule between every pair. In a long result list a stack of hairlines turns into
// texture and stops separating anything, while the two-tone banding still lets the
// eye carry a value straight across a wide row. It also survives the narrow centre
// column, where a full-width border reads as clutter.
//
// A plain `bg-*`, deliberately not Tailwind's `odd:` variant. `odd:` compiles to a
// `:nth-child` pseudo-class, which outranks the plain `bg-*` a row uses for its
// selected state -- the stripe would win the cascade in the one place it must not.
// A plain class ties with the selected state (so the caller branches, below) and
// loses cleanly to `hover:`/`active:`, which carry a pseudo-class of their own.
//
// An index, not `:nth-child`, for the matching reason: a filtered list, a wrapper
// element or a sticky header all move a row's DOM position without moving its
// position in the results, and it's the results the banding is counting.
//
// Callers with a selected/added state must branch rather than stack, so a chosen
// row is never two backgrounds deep:
//
//   class={cn("...", added ? ADDED_CLASSES : rowStripe(index))}

/**
 * The pointer treatment for a banded row you can click: a wash a notch stronger
 * than the stripe, plus PRESS_FLAT's dim. CARD_HOVER's lift is wrong here -- a
 * flush row that rises pulls its band out of line with the rows around it, and
 * there is no border or shadow left to catch the lift anyway.
 *
 * The hover background does not fade, on purpose: PRESS_FLAT owns this element's
 * `transition-*`, and widening it to cover colour would drag the press dim back to
 * the hover's pace, which is the one thing PRESS_FLAT exists to avoid. Composed
 * through `cn` so the two never fight over the transition group.
 */
export const ROW_HOVER = cn(PRESS_FLAT, "hover:bg-black/5 dark:hover:bg-white/5");

/**
 * The playing row carries no background at all. The mark in the number column (an
 * equalizer glyph) and this accent title are the signal; a fill would be a third
 * one competing with the banding for the same pixels, and at any depth a neutral
 * fill just reads as another band.
 *
 * Goes on the row's title, not the row. Playing is a cursor moving down the list,
 * so it wants a mark; ROW_SELECTED below is for a standing choice, which earns a
 * fill.
 */
export const ROW_PLAYING_TEXT = "font-semibold text-playing";

/**
 * The chosen row: added in the picker, playing in a queue, current in a builder.
 * The accent ring carries the meaning, since accent-purple is this app's word for
 * selected. The wash sits far deeper than the stripe on purpose -- a selected state
 * a point or two off the banding just reads as banding, which is exactly the bug
 * this constant exists to stop coming back.
 */
export const ROW_SELECTED =
  "bg-black/[0.09] ring-1 ring-inset ring-accent-purple/40 dark:bg-white/[0.12]";

/** The wash itself. A notch under `hover:bg-black/5`, so a pointer still reads. */
const STRIPE = "bg-black/[0.03] dark:bg-white/[0.04]";

/**
 * Background class for row `index` (0-based) of a striped list: the first row is
 * washed, the second is bare, and on down the list.
 */
export function rowStripe(index: number): string {
  return index % 2 === 0 ? STRIPE : "";
}

/**
 * The same wash, but scoped to one breakpoint each, for the helper below. A list
 * that reflows needs two stripes in the class list rather than one, because the
 * row an item lands on differs between the layouts.
 */
const STRIPE_NARROW = "max-sm:bg-black/[0.03] dark:max-sm:bg-white/[0.04]";
const STRIPE_WIDE = "sm:bg-black/[0.03] dark:sm:bg-white/[0.04]";

/**
 * Banding for a list that is one column on a phone and two from `sm` up. An index
 * stops being a visual row the moment the list wraps -- striping a two-column list
 * by index gives a checkerboard, not a band -- so the caller works out which row
 * the item occupies in each layout and this picks the wash per breakpoint.
 */
export function rowStripeWrapped(rows: { narrow: number; wide: number }): string {
  return cn(rows.narrow % 2 === 0 && STRIPE_NARROW, rows.wide % 2 === 0 && STRIPE_WIDE);
}

/**
 * The row an item lands on in a CSS `columns-2` list, which fills column-major:
 * the first half runs down the left column, the rest down the right. Safe only
 * because these lists are uniform single-line rows, so the browser balances the
 * two columns at exactly this split.
 */
export function columnMajorRow(index: number, count: number): number {
  const perColumn = Math.ceil(count / 2);
  return index < perColumn ? index : index - perColumn;
}

/**
 * The band as one opaque colour, for a list whose rows carry a sticky column. The
 * singer gantt is the case: its blocks scroll underneath the name on the left, so
 * that name needs a background you cannot see through, and nothing can match a
 * translucent wash sitting over `bg-card`. Mixed toward `--ink`, which flips with
 * the theme, so a single value lands at roughly the depth STRIPE carries in each.
 */
export const STRIPE_OPAQUE = "bg-[color-mix(in_srgb,hsl(var(--card))_96.5%,hsl(var(--ink)))]";

/** ROW_SELECTED's depth, mixed the same way. Branched to, never stacked on a band. */
export const ROW_SELECTED_OPAQUE = "bg-[color-mix(in_srgb,hsl(var(--card))_91%,hsl(var(--ink)))]";

/**
 * Background for row `index` of an opaque banded list. Unlike `rowStripe`, the bare
 * row still gets a class: every row in such a list has to be opaque, not just the
 * washed ones.
 */
export function rowStripeOpaque(index: number): string {
  return index % 2 === 0 ? STRIPE_OPAQUE : "bg-card";
}

/**
 * Full-bleed banding for a page's own lists, split in two because a two-column list
 * can't pull each row out on its own. The list steps out of the page gutter and each
 * row adds the same amount back, so the band reaches the page edge and the text
 * stays on the column line. The page declares its gutter on `--page-gutter`; without
 * one the rows bleed a modest 0.75rem.
 */
export const PAGE_ROWS_BLEED = "mx-[calc(var(--page-gutter,0.75rem)*-1)]";
export const PAGE_ROW_INSET = "px-[var(--page-gutter,0.75rem)]";

/**
 * Widens a block in a capped page column so its right edge sits one gutter in from
 * the island's edge, the way its left edge sits one gutter in from the island's left.
 * A banded list inside it keeps its `PAGE_ROWS_BLEED` and so runs to both island
 * edges, with any header above it lined up on the same right edge. Only for a block
 * that starts at the column's left edge: one in a side column would run over its
 * neighbour. From md the island is the viewport less the rail and the right gap
 * (an overshoot from a classic scrollbar lands under the shell frame); below md
 * those vars are unset and this changes nothing.
 */
export const TO_ISLAND_EDGE =
  "mr-[calc(100%_+_2_*_var(--page-gutter,0.75rem)_-_(100vw_-_var(--island-left,0px)_-_var(--island-right,0px)))]";
