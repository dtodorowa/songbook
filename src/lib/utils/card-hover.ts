import { CARD_PRESSED } from "./press";

// The one pointer treatment for card-shaped surfaces: on hover a small lift, the
// border a notch darker, a soft shadow. No accent outline on purpose. A purple
// border reads as "selected" everywhere else in the app, so spending it on a
// pointer means a hovered card and a chosen card look the same.
//
// Selected/active states still own the accent border; the press state below stays
// neutral for the same reason.
//
// The press half is what a phone actually gets: hover never fires on touch, so
// without it a tapped card is mute. `active:translate-y-0` is not redundant --
// iOS leaves the hover lift stuck on after a tap, and the press should read as
// going down, not staying up.
//
// `active:duration-75` against the resting 200ms is what makes the press legible
// at all: a tap on a rail card is routinely shorter than 200ms, so at the hover's
// pace the scale never arrives before the finger lifts. Going in at 75ms and
// easing back out at 200ms also just reads better -- a snap down, a settle up.
//
// CARD_PRESSED, not PRESS_CARD: PRESS_CARD carries its own `transition-transform`,
// which would win over the `transition-all` here and kill the border/shadow fade.
export const CARD_HOVER = `transition-all duration-200 active:duration-75 hover:-translate-y-0.5 hover:border-black/15 hover:shadow-md dark:hover:border-white/25 active:translate-y-0 ${CARD_PRESSED}`;
