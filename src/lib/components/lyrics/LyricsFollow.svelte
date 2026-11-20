<script lang="ts">
  import { cn } from "$lib/utils";
  import { ROW_HOVER } from "$lib/utils/row-stripe";
  import type { SingAlong } from "$lib/stores/singAlong.svelte";

  type Props = { singAlong: SingAlong; onSeek: (seconds: number) => void };
  let { singAlong, onSeek }: Props = $props();

  let list = $state<HTMLElement | null>(null);

  // Keep the lit line in the middle of the lyrics panel, without moving the page.
  $effect(() => {
    const index = singAlong.activeLine;
    if (index == null || !list) return;
    const row = list.querySelector<HTMLElement>(`[data-line="${index}"]`);
    if (!row) return;
    const target = row.offsetTop - list.clientHeight / 2 + row.clientHeight / 2;
    list.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
  });

  function choose(index: number) {
    const stamp = singAlong.stampOf(index);
    if (stamp != null) onSeek(stamp);
    else singAlong.selectLine(index);
  }
</script>

<ol bind:this={list} class="relative m-0 max-h-[70vh] list-none overflow-y-auto p-0 pt-2 pb-[25vh]">
  {#each singAlong.lines as line, index (index)}
    {@const active = singAlong.activeLine === index}
    {@const unsung = singAlong.isSynced && !singAlong.stampedLines.has(index)}
    <li data-line={index}>
      <button
        onclick={() => choose(index)}
        aria-current={active ? "true" : undefined}
        class={cn(
          "w-full cursor-pointer rounded-lg border-none bg-transparent px-3 py-2 text-left font-serif text-2xl leading-snug transition-colors duration-300 md:text-3xl",
          ROW_HOVER,
          active ? "text-ink" : "text-ink-faint",
          unsung && "opacity-50"
        )}
      >
        {line}
      </button>
    </li>
  {/each}
</ol>
