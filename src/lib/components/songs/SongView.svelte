<script lang="ts">
  import { untrack } from "svelte";
  import { goto, invalidate } from "$app/navigation";
  import { AudioLines, Mic, Pencil } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import BackLink from "$lib/components/shared/BackLink.svelte";
  import EmptyState from "$lib/components/shared/EmptyState.svelte";
  import PageColumn from "$lib/components/shared/PageColumn.svelte";
  import PageHeader from "$lib/components/shared/PageHeader.svelte";
  import { categoryHref } from "$lib/components/shared/nav-links";
  import YouTubePlayer from "$lib/components/player/YouTubePlayer.svelte";
  import KaraokeMode from "$lib/components/lyrics/KaraokeMode.svelte";
  import LyricsFollow from "$lib/components/lyrics/LyricsFollow.svelte";
  import DeleteSongDialog from "$lib/components/songs/DeleteSongDialog.svelte";
  import PlayingInfo from "$lib/components/songs/PlayingInfo.svelte";
  import { deleteSong, markPlayed, SONGS_DEPENDENCY } from "$lib/db/songs";
  import { createSingAlong } from "$lib/stores/singAlong.svelte";
  import type { Song } from "$lib/data/song";

  // One song's page. The route remounts it per song, so the player and the
  // hand-stepped line never carry over from the last one.
  type Props = {
    song: Song;
    /** Open straight into fullscreen karaoke, as Sing along does. */
    startInKaraoke?: boolean;
    /** Called when karaoke closes, so the page can drop the flag from its URL. */
    onKaraokeExit?: () => void;
  };
  let { song, startInKaraoke = false, onKaraokeExit }: Props = $props();

  let currentTime = $state(0);
  let playing = $state(false);
  let play = $state<() => void>(() => {});
  let pause = $state<() => void>(() => {});
  let seekTo = $state<(seconds: number) => void>(() => {});
  let karaoke = $state(untrack(() => startInKaraoke && song.lyrics.trim().length > 0));
  let playedOnce = false;

  const singAlong = createSingAlong({
    song: () => song,
    currentTime: () => currentTime,
    karaoke: () => karaoke,
  });

  const hasLyrics = $derived(singAlong.lines.length > 0);

  function togglePlay() {
    if (playing) pause();
    else play();
  }

  function selectKaraokeLine(lineIndex: number) {
    const stamp = singAlong.stampOf(lineIndex);
    if (stamp != null) seekTo(stamp);
    else singAlong.selectLine(lineIndex);
  }

  function notePlayed() {
    if (playedOnce) return;
    playedOnce = true;
    markPlayed(song.id);
  }

  async function remove() {
    await deleteSong(song.id);
    await invalidate(SONGS_DEPENDENCY);
    await goto("/");
  }
</script>

<PageColumn>
  <BackLink href="/" label="Songs" />
  <PageHeader title={song.title} description={song.artist} class="mt-4">
    {#snippet actions()}
      <Button size="lg" onclick={() => (karaoke = true)} disabled={!hasLyrics}>
        <Mic class="h-4.5 w-4.5" />
        Sing
      </Button>
      {#if hasLyrics}
        <Button href="/songs/{song.id}/sync" variant="outline" size="lg">
          <AudioLines class="h-4.5 w-4.5" />
          {singAlong.isSynced ? "Resync" : "Sync lyrics"}
        </Button>
      {/if}
      <Button
        href="/songs/{song.id}/edit"
        variant="ghost"
        iconOnly
        aria-label="Edit song"
        title="Edit song"
      >
        <Pencil class="h-4.5 w-4.5" />
      </Button>
      <DeleteSongDialog title={song.title} ondelete={remove} />
    {/snippet}
  </PageHeader>

  {#if song.categories.length}
    <div class="mt-4 flex flex-wrap gap-1.5">
      {#each song.categories as category (category)}
        <a
          href={categoryHref(category)}
          class="rounded-full bg-ink/[0.06] px-3 py-1 text-sm font-medium text-ink-muted no-underline hover:bg-ink/10 hover:text-ink"
        >
          {category}
        </a>
      {/each}
    </div>
  {/if}

  <div class="@container mt-8">
    <div class="grid gap-8 @4xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div class="flex flex-col gap-6">
        <YouTubePlayer
          youtubeId={song.youtubeId}
          class="rounded-2xl"
          bind:currentTime
          bind:playing
          bind:play
          bind:pause
          bind:seekTo
          onPlay={notePlayed}
        />
        <PlayingInfo {song} />
      </div>

      <section aria-label="Lyrics">
        {#if !hasLyrics}
          <EmptyState
            title="No lyrics yet"
            hint="Add them and they can follow the song as it plays."
          >
            <Button href="/songs/{song.id}/edit" variant="outline">Add lyrics</Button>
          </EmptyState>
        {:else}
          {#if !singAlong.isSynced}
            <p class="m-0 mb-2 px-3 text-base text-ink-muted">
              Sync the lyrics once and they will follow the song from then on.
            </p>
          {:else if singAlong.staleCount}
            <p class="m-0 mb-2 px-3 text-base text-ink-muted">
              {singAlong.staleCount} synced {singAlong.staleCount === 1
                ? "line no longer matches"
                : "lines no longer match"} the lyrics. Resync to fix.
            </p>
          {/if}
          <LyricsFollow {singAlong} onSeek={seekTo} />
        {/if}
      </section>
    </div>
  </div>
</PageColumn>

{#if karaoke}
  <KaraokeMode
    {singAlong}
    {playing}
    title={song.title}
    subtitle={song.artist}
    onExit={() => {
      karaoke = false;
      onKaraokeExit?.();
    }}
    onSelectLine={selectKaraokeLine}
    onTogglePlay={togglePlay}
  />
{/if}
