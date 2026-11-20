<script lang="ts">
  import { Mic } from "lucide-svelte";
  import { isSynced, type Song } from "$lib/data/song";
  import { cn } from "$lib/utils";
  import { PAGE_ROW_INSET, ROW_HOVER, rowStripe } from "$lib/utils/row-stripe";
  import SongArt from "./SongArt.svelte";

  type Props = { song: Song; index: number };
  let { song, index }: Props = $props();

  const synced = $derived(isSynced(song));
</script>

<li>
  <a
    href="/songs/{song.id}"
    class={cn(
      "flex items-center gap-4 py-2.5 text-ink no-underline",
      PAGE_ROW_INSET,
      rowStripe(index),
      ROW_HOVER
    )}
  >
    <SongArt youtubeId={song.youtubeId} class="w-24 md:w-28" />
    <div class="min-w-0 flex-1">
      <p class="m-0 truncate text-base font-semibold">{song.title}</p>
      {#if song.artist}
        <p class="m-0 truncate text-base text-ink-muted">{song.artist}</p>
      {/if}
    </div>
    <div class="hidden shrink-0 flex-wrap justify-end gap-1.5 sm:flex">
      {#each song.categories as category (category)}
        <span class="rounded-full bg-ink/[0.06] px-2.5 py-0.5 text-sm text-ink-muted">
          {category}
        </span>
      {/each}
    </div>
    <div class="flex w-20 shrink-0 items-center justify-end gap-2">
      {#if song.musicalKey}
        <span
          title="Key"
          class="rounded-full border border-ink/15 px-2 py-0.5 text-sm font-semibold text-ink"
        >
          {song.musicalKey}
        </span>
      {/if}
      {#if synced}
        <span title="Lyrics synced" class="text-ink-muted">
          <Mic class="h-4.5 w-4.5" aria-label="Lyrics synced" />
        </span>
      {/if}
    </div>
  </a>
</li>
