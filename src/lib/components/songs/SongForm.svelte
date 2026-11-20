<script lang="ts">
  import { untrack } from "svelte";
  import { ExternalLink } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import Field from "$lib/components/shared/Field.svelte";
  import type { SongDraft } from "$lib/data/song";
  import { cn } from "$lib/utils";
  import { INPUT, TEXTAREA, optionalNumber } from "$lib/utils/form-field";
  import { MUSICAL_KEYS } from "$lib/utils/musical-key";
  import { parseYouTubeId, splitVideoTitle, youTubeWatchUrl } from "$lib/utils/youtube-id";
  import { fetchVideoTitle } from "$lib/utils/youtube-oembed";
  import CategoryInput from "./CategoryInput.svelte";
  import SongArt from "./SongArt.svelte";

  type Props = {
    initial: SongDraft;
    existingCategories: string[];
    submitLabel: string;
    cancelHref: string;
    /** Shown under the video field when changing it would drop a sync. */
    videoWarning?: string;
    onsave: (draft: SongDraft) => Promise<void>;
  };
  let {
    initial,
    existingCategories,
    submitLabel,
    cancelHref,
    videoWarning = "",
    onsave,
  }: Props = $props();

  // A snapshot, not a live binding: the edit page remounts the form per song.
  let draft = $state<SongDraft>(
    untrack(() => ({ ...initial, categories: [...initial.categories] }))
  );
  let videoInput = $state(
    untrack(() => (initial.youtubeId ? youTubeWatchUrl(initial.youtubeId) : ""))
  );
  let saving = $state(false);
  let submitted = $state(false);
  let lookedUp = $state(untrack(() => initial.youtubeId));

  const youtubeId = $derived(parseYouTubeId(videoInput));
  const videoError = $derived.by(() => {
    if (youtubeId) return "";
    if (!videoInput.trim()) return submitted ? "Paste a YouTube link." : "";
    return "That doesn't look like a YouTube link.";
  });
  const titleError = $derived(submitted && !draft.title.trim() ? "Give the song a title." : "");
  const lyricsSearchUrl = $derived(
    `https://www.google.com/search?q=${encodeURIComponent(`${draft.title} ${draft.artist} lyrics`.trim())}`
  );

  // Fill title and artist from the video the first time a new link is pasted, and
  // only into fields still empty, so a typed title is never overwritten.
  async function lookUpTitle() {
    const id = youtubeId;
    if (!id || id === lookedUp) return;
    lookedUp = id;
    const videoTitle = await fetchVideoTitle(id);
    if (!videoTitle) return;
    const guess = splitVideoTitle(videoTitle);
    if (!draft.title.trim()) draft.title = guess.title;
    if (!draft.artist.trim()) draft.artist = guess.artist;
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    submitted = true;
    if (!youtubeId || !draft.title.trim()) return;
    saving = true;
    try {
      // A snapshot, because IndexedDB can't clone the reactive proxy behind `draft`.
      await onsave({
        ...$state.snapshot(draft),
        youtubeId,
        title: draft.title.trim(),
        artist: draft.artist.trim(),
        capo: optionalNumber(draft.capo),
        tempo: optionalNumber(draft.tempo),
      });
    } finally {
      saving = false;
    }
  }

  const SECTION_TITLE = "m-0 font-serif text-2xl text-ink";
</script>

<form onsubmit={submit} novalidate class="flex max-w-3xl flex-col gap-10">
  <section class="flex flex-col gap-5">
    <h2 class={SECTION_TITLE}>The song</h2>
    <Field label="YouTube link" for="video" error={videoError} hint={videoWarning}>
      <div class="flex items-start gap-3">
        <input
          id="video"
          bind:value={videoInput}
          oninput={lookUpTitle}
          placeholder="https://www.youtube.com/watch?v=..."
          autocomplete="off"
          class={INPUT}
        />
        {#if youtubeId}
          <SongArt {youtubeId} class="hidden w-28 sm:block" />
        {/if}
      </div>
    </Field>
    <div class="grid gap-5 sm:grid-cols-2">
      <Field label="Title" for="title" error={titleError}>
        <input id="title" bind:value={draft.title} class={INPUT} />
      </Field>
      <Field label="Artist" for="artist">
        <input id="artist" bind:value={draft.artist} class={INPUT} />
      </Field>
    </div>
    <Field label="Categories" for="categories" hint="Genre, mood, a playlist, anything you like.">
      <CategoryInput
        id="categories"
        bind:categories={draft.categories}
        existing={existingCategories}
      />
    </Field>
  </section>

  <section class="flex flex-col gap-5">
    <div class="flex flex-wrap items-baseline justify-between gap-2">
      <h2 class={SECTION_TITLE}>Lyrics</h2>
      {#if draft.title.trim()}
        <a
          href={lyricsSearchUrl}
          target="_blank"
          rel="noreferrer"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted no-underline hover:text-ink"
        >
          Find the lyrics online
          <ExternalLink class="h-4 w-4" />
        </a>
      {/if}
    </div>
    <Field
      label="Lyrics"
      for="lyrics"
      hint="One line per row. Blank lines are skipped when syncing."
    >
      <textarea id="lyrics" bind:value={draft.lyrics} rows="14" class={TEXTAREA}></textarea>
    </Field>
  </section>

  <section class="flex flex-col gap-5">
    <h2 class={SECTION_TITLE}>How to play it</h2>
    <div class="grid gap-5 sm:grid-cols-3">
      <Field label="Key" for="key">
        <select id="key" bind:value={draft.musicalKey} class={INPUT}>
          <option value="">Not set</option>
          {#each MUSICAL_KEYS as musicalKey (musicalKey)}
            <option value={musicalKey}>{musicalKey}</option>
          {/each}
        </select>
      </Field>
      <Field label="Capo" for="capo">
        <input id="capo" type="number" min="0" max="12" bind:value={draft.capo} class={INPUT} />
      </Field>
      <Field label="Tempo (BPM)" for="tempo">
        <input id="tempo" type="number" min="20" max="300" bind:value={draft.tempo} class={INPUT} />
      </Field>
    </div>
    <Field label="Chords" for="chords" hint="Progression, a chord chart, or tabs.">
      <textarea
        id="chords"
        bind:value={draft.chords}
        rows="6"
        placeholder="Verse: Am  F  C  G"
        class={cn(TEXTAREA, "font-mono")}></textarea>
    </Field>
    <Field label="Notes" for="notes">
      <textarea
        id="notes"
        bind:value={draft.notes}
        rows="3"
        placeholder="Strumming pattern, where to breathe, tricky bits"
        class={TEXTAREA}></textarea>
    </Field>
  </section>

  <div class="flex items-center justify-end gap-2 border-t border-border pt-6">
    <Button href={cancelHref} variant="ghost" size="lg">Cancel</Button>
    <Button type="submit" size="lg" loading={saving}>{submitLabel}</Button>
  </div>
</form>
