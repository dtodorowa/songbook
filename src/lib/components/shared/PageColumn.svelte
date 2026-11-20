<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$lib/utils";

  // The centre column every page sits in. --page-gutter is what banded lists bleed
  // back out by (PAGE_ROWS_BLEED), so it must match the horizontal padding here.
  type Props = { class?: string; children: Snippet };
  let { class: className = "", children }: Props = $props();
</script>

<main
  class={cn(
    "mx-auto w-full max-w-6xl px-4 pt-2 pb-16 [--page-gutter:1rem] md:px-8 md:pt-8 md:[--page-gutter:2rem]",
    className
  )}
>
  {@render children()}
</main>
