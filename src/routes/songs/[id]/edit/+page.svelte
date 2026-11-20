<script lang="ts">
  import { goto, invalidate } from "$app/navigation";
  import PageColumn from "$lib/components/shared/PageColumn.svelte";
  import PageHeader from "$lib/components/shared/PageHeader.svelte";
  import BackLink from "$lib/components/shared/BackLink.svelte";
  import SongForm from "$lib/components/songs/SongForm.svelte";
  import { draftFromSong, isSynced, type SongDraft } from "$lib/data/song";
  import { SONGS_DEPENDENCY, updateSong } from "$lib/db/songs";
  import { categoryCounts } from "$lib/utils/song-library";
  import type { PageData } from "./$types";

  type Props = { data: PageData };
  let { data }: Props = $props();

  const existingCategories = $derived(categoryCounts(data.songs).map((category) => category.name));

  async function save(draft: SongDraft) {
    await updateSong(data.song, draft);
    await invalidate(SONGS_DEPENDENCY);
    await goto(`/songs/${data.song.id}`);
  }
</script>

<svelte:head><title>Edit {data.song.title} · songbook</title></svelte:head>

<PageColumn>
  <BackLink href="/songs/{data.song.id}" label={data.song.title} />
  <PageHeader title="Edit song" class="mt-4" />
  <div class="mt-8">
    {#key data.song.id}
      <SongForm
        initial={draftFromSong(data.song)}
        {existingCategories}
        submitLabel="Save changes"
        cancelHref="/songs/{data.song.id}"
        videoWarning={isSynced(data.song)
          ? "Changing the video clears the lyrics sync, since its timing belongs to this one."
          : ""}
        onsave={save}
      />
    {/key}
  </div>
</PageColumn>
