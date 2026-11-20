# songbook

A music library that lives in your browser. Save songs as YouTube links, add their lyrics, tap the lyrics in time once, and from then on they follow the video so you can sing along. Each song also keeps notes on how to play it: key, capo, tempo, chords.

There is no server and no account. Songs are stored in the browser's IndexedDB, so they stay on the machine you added them on. The Backup page saves them to a JSON file and restores from one.

## What it does

- **Add a song** from any YouTube link (watch, youtu.be, Shorts, Music). The title and artist fill in from the video.
- **Categories** you type yourself. Filter the library by category, or search titles, artists and lyrics.
- **Sync the lyrics**: play the song and press Enter as each line starts. Mark instrumental gaps with S, nudge any stamp by a tenth of a second, and shift the whole take if you tapped late.
- **Sing**: the lyrics light up as the video plays. Fullscreen karaoke shows the current line and the next, with a countdown through instrumental breaks. Sing along in the nav opens it on a random synced song.
- **How to play it**: key, capo, tempo, a chord chart and free notes. With a capo set, it tells you which chord shapes to play.

The sync editor, karaoke screen and visual design come from [tandabase](https://tandabase.com).

## Running it

```bash
npm install
npm run dev
```

It opens on http://localhost:5196.

```bash
npm run test:unit   # vitest
npm run check       # svelte-check
npm run build       # static site in build/
```

Built with SvelteKit (Svelte 5), Tailwind v4, Dexie and bits-ui. The build is a static SPA, so any static host works.
