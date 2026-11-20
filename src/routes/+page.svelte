<script lang="ts">
  import { page } from "$app/state";
  import { Music, Plus } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import EmptyState from "$lib/components/shared/EmptyState.svelte";
  import PageColumn from "$lib/components/shared/PageColumn.svelte";
  import PageHeader from "$lib/components/shared/PageHeader.svelte";
  import SearchBar from "$lib/components/shared/SearchBar.svelte";
  import SegmentedToggle from "$lib/components/shared/SegmentedToggle.svelte";
  import CategoryPills from "$lib/components/songs/CategoryPills.svelte";
  import SongRow from "$lib/components/songs/SongRow.svelte";
  import { cn } from "$lib/utils";
  import { PAGE_ROWS_BLEED } from "$lib/utils/row-stripe";
  import { categoryCounts, filterSongs, type SongSort } from "$lib/utils/song-library";
  import type { PageData } from "./$types";

  type Props = { data: PageData };
  let { data }: Props = $props();

  const SORTS: { value: SongSort; label: string }[] = [
    { value: "recent", label: "Recent" },
    { value: "title", label: "Title" },
    { value: "artist", label: "Artist" },
  ];

  let query = $state("");
  let sort = $state<SongSort>("recent");

  const category = $derived(page.url.searchParams.get("category"));
  const categories = $derived(categoryCounts(data.songs));
  const visible = $derived(filterSongs(data.songs, { query, category, sort }));
  const countLabel = $derived(`${data.songs.length} ${data.songs.length === 1 ? "song" : "songs"}`);
</script>

<svelte:head><title>{category ?? "Songs"} · songbook</title></svelte:head>

<PageColumn>
  <PageHeader
    title={category ?? "Songs"}
    description={data.songs.length
      ? `${countLabel} saved in this browser.`
      : "Your own music library, with lyrics you can sing along to."}
  >
    {#snippet actions()}
      <Button href="/songs/new" size="lg">
        <Plus class="h-4.5 w-4.5" />
        Add song
      </Button>
    {/snippet}
  </PageHeader>

  {#if !data.songs.length}
    <EmptyState title="No songs yet" hint="Paste a YouTube link to add your first song.">
      {#snippet icon()}<Music class="h-10 w-10 text-ink-faint" />{/snippet}
      <Button href="/songs/new">
        <Plus class="h-4 w-4" />
        Add a song
      </Button>
    </EmptyState>
  {:else}
    <div class="mt-8 flex flex-col gap-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          bind:value={query}
          placeholder="Search titles, artists, lyrics"
          class="sm:max-w-md"
        />
        <div class="sm:ml-auto">
          <SegmentedToggle
            options={SORTS}
            value={sort}
            label="Sort songs"
            onchange={(next) => (sort = next)}
          />
        </div>
      </div>
      {#if categories.length}
        <CategoryPills {categories} active={category} />
      {/if}
    </div>

    {#if visible.length}
      <ul class={cn("mt-6 list-none p-0", PAGE_ROWS_BLEED)}>
        {#each visible as song, index (song.id)}
          <SongRow {song} {index} />
        {/each}
      </ul>
    {:else}
      <EmptyState title="Nothing matches" hint="Try another search or category." />
    {/if}
  {/if}
</PageColumn>
