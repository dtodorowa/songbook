<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$lib/utils";

  type Props = {
    label: string;
    /** The id of the control inside, so clicking the label focuses it. */
    for?: string;
    hint?: string;
    error?: string;
    class?: string;
    children: Snippet;
  };
  let {
    label,
    for: htmlFor,
    hint = "",
    error = "",
    class: className = "",
    children,
  }: Props = $props();
</script>

<div class={cn("flex flex-col gap-1.5", className)}>
  <label for={htmlFor} class="text-sm font-semibold text-ink">{label}</label>
  {@render children()}
  {#if error}
    <p class="m-0 text-sm text-red-500" role="alert">{error}</p>
  {:else if hint}
    <p class="m-0 text-sm text-ink-muted">{hint}</p>
  {/if}
</div>
