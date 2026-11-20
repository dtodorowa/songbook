<script lang="ts">
  import { goto, invalidate } from "$app/navigation";
  import BackLink from "$lib/components/shared/BackLink.svelte";
  import EmptyState from "$lib/components/shared/EmptyState.svelte";
  import PageColumn from "$lib/components/shared/PageColumn.svelte";
  import PageHeader from "$lib/components/shared/PageHeader.svelte";
  import { Button } from "$lib/components/ui/button";
  import LyricsSyncEditor from "$lib/components/lyrics/LyricsSyncEditor.svelte";
  import { hashLyrics, lyricLines, type SyncEvent } from "$lib/data/lyrics-sync";
  import { isSynced } from "$lib/data/song";
  import { clearSync, saveSync, SONGS_DEPENDENCY } from "$lib/db/songs";
  import type { PageData } from "./$types";

  type Props = { data: PageData };
  let { data }: Props = $props();

  const lines = $derived(lyricLines(data.song.lyrics));
  const songHref = $derived(`/songs/${data.song.id}`);

  async function backToSong() {
    await invalidate(SONGS_DEPENDENCY);
    await goto(songHref);
  }

  async function save(events: SyncEvent[]) {
    await saveSync(data.song.id, events, hashLyrics(lines));
    await backToSong();
  }

  async function remove() {
    await clearSync(data.song.id);
    await backToSong();
  }
</script>

<svelte:head><title>Sync {data.song.title} · songbook</title></svelte:head>

<PageColumn>
  <BackLink href={songHref} label={data.song.title} />
  <PageHeader
    title="Sync lyrics"
    description="Play the song and tap each line as it starts. It takes one listen."
    class="mt-4 mb-6"
  />
  {#if lines.length}
    {#key data.song.id}
      <LyricsSyncEditor
        videoId={data.song.youtubeId}
        {lines}
        initialEvents={data.song.syncEvents}
        hasExisting={isSynced(data.song)}
        onSave={save}
        onDelete={remove}
        onCancel={() => goto(songHref)}
      />
    {/key}
  {:else}
    <EmptyState title="No lyrics to sync" hint="Add the lyrics first, then come back here.">
      <Button href="{songHref}/edit" variant="outline">Add lyrics</Button>
    </EmptyState>
  {/if}
</PageColumn>
