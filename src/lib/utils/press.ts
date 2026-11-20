// Touch has no hover. Every `hover:` utility in this app is dead on a phone, so a
// tap on most surfaces lands with no acknowledgement at all until the state it
// changes happens to be visible. These are the press states that fill that gap:
// the thing gives a little under the finger and springs back.
//
// A floor lives in app.css: under `(hover: none)` anything clickable dims on
// :active, so nothing is ever mute to the touch. These constants are the opt-in
// squish on top, for the surfaces a finger actually aims at.
//
// Every press here goes IN faster than it comes back out (`active:duration-*`
// under a longer resting duration). A tap is often shorter than a hover
// transition, so a press that eases in at the hover's pace never reaches its
// pressed state before the finger leaves and reads as no feedback at all.

/** Controls, chips, icon buttons, toggles. The default. */
export const PRESS = "transition-transform duration-150 active:duration-75 active:scale-95";

/**
 * The pressed look for a big surface, with no transition of its own. Only for
 * composing into something that already declares one (CARD_HOVER). Anything else
 * wants PRESS_CARD, which carries its own timing.
 */
export const CARD_PRESSED = "active:scale-[0.97] active:shadow-sm";

/** Big surfaces (cards, list rows, tiles) where a 5% jump would read as a jolt. */
export const PRESS_CARD = `transition-transform duration-150 active:duration-75 ${CARD_PRESSED}`;

/** Full-bleed bars and rows that must not move: dim instead of scale. */
export const PRESS_FLAT = "transition-opacity duration-150 active:duration-75 active:opacity-70";
