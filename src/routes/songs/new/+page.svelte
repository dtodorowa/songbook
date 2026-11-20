<script lang="ts">
  import { goto, invalidate } from "$app/navigation";
  import PageColumn from "$lib/components/shared/PageColumn.svelte";
  import PageHeader from "$lib/components/shared/PageHeader.svelte";
  import SongForm from "$lib/components/songs/SongForm.svelte";
  import { emptyDraft, type SongDraft } from "$lib/data/song";
  import { createSong, SONGS_DEPENDENCY } from "$lib/db/songs";
  import { categoryCounts } from "$lib/utils/song-library";
  import type { PageData } from "./$types";

  type Props = { data: PageData };
  let { data }: Props = $props();

  const existingCategories = $derived(categoryCounts(data.songs).map((category) => category.name));

  async function save(draft: SongDraft) {
    const id = await createSong(draft);
    await invalidate(SONGS_DEPENDENCY);
    await goto(`/songs/${id}`);
  }
</script>

<svelte:head><title>Add song · songbook</title></svelte:head>

<PageColumn>
  <PageHeader
    title="Add song"
    description="Paste a YouTube link, add the lyrics, and sync them whenever you like."
  />
  <div class="mt-8">
    <SongForm
      initial={emptyDraft()}
      {existingCategories}
      submitLabel="Save song"
      cancelHref="/"
      onsave={save}
    />
  </div>
</PageColumn>
