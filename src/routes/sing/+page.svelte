<script lang="ts">
  import { Mic } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import EmptyState from "$lib/components/shared/EmptyState.svelte";
  import PageColumn from "$lib/components/shared/PageColumn.svelte";
  import type { PageData } from "./$types";

  type Props = { data: PageData };
  let { data }: Props = $props();
</script>

<svelte:head><title>Sing along · songbook</title></svelte:head>

<PageColumn>
  <EmptyState
    title="Nothing to sing yet"
    hint={data.songCount
      ? "Open a song with lyrics and sync them. Then this button picks one for you."
      : "Add a song with its lyrics, sync them, and this button picks one for you."}
  >
    {#snippet icon()}<Mic class="h-10 w-10 text-ink-faint" />{/snippet}
    <Button href={data.songCount ? "/" : "/songs/new"}>
      {data.songCount ? "Go to your songs" : "Add a song"}
    </Button>
  </EmptyState>
</PageColumn>
