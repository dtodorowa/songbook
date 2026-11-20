# songbook: working agreement

A personal music library: YouTube links, lyrics synced to the video, karaoke, and
notes on how to play each song. Everything lives in the browser's IndexedDB
(Dexie, `src/lib/db/songs.ts`); there is no backend. Backup is a JSON file.

The design and the lyric sync come from tandabase (`../tandabase`), and this app
follows tandabase's `CLAUDE.md` rules. The ones that matter most here:

- Route files compose. Presentation in `src/lib/components/**`, reactive state in
  `src/lib/stores/*.svelte.ts`, pure logic in `src/lib/utils/*.ts` with a colocated
  `*.test.ts`.
- Svelte 5 runes only. `$derived` over `$effect`; never sync state with an effect.
- Tailwind v4 utilities inline, no `<style>` classes. Merge classes with `cn()`.
- Nothing below `text-sm`, and `text-sm` only for labels.
- Radius by role: `rounded-full` pills, `rounded-lg` controls, `rounded-2xl` surfaces.
- Lists are banded with `rowStripe(index)` + `ROW_HOVER`, not ruled. Cards hover
  with `CARD_HOVER`. Tappable things get `PRESS` / `PRESS_CARD` / `PRESS_FLAT`.
- `accent-purple` means selected. Never use it for hover.
- No em dashes in user-facing copy.
- Full words for names, a named `type Props`, no nested ternaries.

Data loading: the root `+layout.ts` loads every song with
`depends(SONGS_DEPENDENCY)`; child loads read it via `await parent()`. After any
write, `invalidate(SONGS_DEPENDENCY)`. Pass `$state.snapshot(...)` to the db layer:
IndexedDB can't clone Svelte's reactive proxies.

Before you finish: `npm run test:unit`, `npm run check`, `npm run format`.
