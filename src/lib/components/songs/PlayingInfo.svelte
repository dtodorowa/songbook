<script lang="ts">
  import { Guitar } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import Card from "$lib/components/shared/Card.svelte";
  import { hasPlayingInfo, type Song } from "$lib/data/song";
  import { shapesWithCapo } from "$lib/utils/musical-key";

  type Props = { song: Song };
  let { song }: Props = $props();

  const shapes = $derived(
    song.musicalKey && song.capo ? shapesWithCapo(song.musicalKey, song.capo) : null
  );
  const facts = $derived(
    [
      song.musicalKey && { label: "Key", value: song.musicalKey },
      song.capo != null && {
        label: "Capo",
        value: shapes ? `Fret ${song.capo}, play ${shapes} shapes` : `Fret ${song.capo}`,
      },
      song.tempo != null && { label: "Tempo", value: `${song.tempo} BPM` },
    ].filter((fact): fact is { label: string; value: string } => !!fact)
  );
</script>

<Card class="flex flex-col gap-4 p-5">
  <h2 class="m-0 flex items-center gap-2 font-serif text-xl text-ink">
    <Guitar class="h-5 w-5 text-brand" />
    How to play it
  </h2>

  {#if !hasPlayingInfo(song)}
    <p class="m-0 text-base text-ink-muted">Add the key, capo, tempo and chords as you learn it.</p>
    <div>
      <Button href="/songs/{song.id}/edit" variant="outline">Add playing notes</Button>
    </div>
  {:else}
    {#if facts.length}
      <dl class="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
        {#each facts as fact (fact.label)}
          <dt class="text-sm font-semibold text-ink-muted">{fact.label}</dt>
          <dd class="m-0 text-base text-ink">{fact.value}</dd>
        {/each}
      </dl>
    {/if}
    {#if song.chords.trim()}
      <pre
        class="m-0 overflow-x-auto rounded-lg bg-ink/[0.04] p-3 font-mono text-base leading-relaxed whitespace-pre text-ink">{song.chords}</pre>
    {/if}
    {#if song.notes.trim()}
      <p class="m-0 text-base whitespace-pre-line text-ink-muted">{song.notes}</p>
    {/if}
  {/if}
</Card>
