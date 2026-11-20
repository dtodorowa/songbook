<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$lib/utils";

  // The "nothing here yet" moment: an optional icon, a title, a muted hint, and
  // an optional CTA slot (children). Standardises the copy tone so every empty
  // surface reads the same.
  let {
    title,
    hint = "",
    icon,
    class: klass = "",
    children,
  }: {
    title: string;
    hint?: string;
    icon?: Snippet;
    class?: string;
    children?: Snippet;
  } = $props();
</script>

<div class={cn("flex flex-col items-center justify-center py-16 text-center", klass)}>
  {#if icon}
    <div class="mb-4">{@render icon()}</div>
  {/if}
  <p class="font-serif text-xl text-ink">{title}</p>
  {#if hint}
    <p class="mt-1 max-w-sm text-base text-ink-muted">{hint}</p>
  {/if}
  {#if children}
    <div class="mt-4">{@render children()}</div>
  {/if}
</div>
