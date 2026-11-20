<script lang="ts">
  import { page } from "$app/state";
  import { replaceState } from "$app/navigation";
  import SongView from "$lib/components/songs/SongView.svelte";
  import { KARAOKE_PARAM } from "$lib/utils/song-links";
  import type { PageData } from "./$types";

  type Props = { data: PageData };
  let { data }: Props = $props();

  // Drop the flag once karaoke closes, so a reload lands on the page, not fullscreen.
  function clearKaraokeParam() {
    const url = new URL(page.url);
    url.searchParams.delete(KARAOKE_PARAM);
    replaceState(url, {});
  }
</script>

<svelte:head><title>{data.song.title} · songbook</title></svelte:head>

{#key data.song.id}
  <SongView
    song={data.song}
    startInKaraoke={page.url.searchParams.has(KARAOKE_PARAM)}
    onKaraokeExit={clearKaraokeParam}
  />
{/key}
