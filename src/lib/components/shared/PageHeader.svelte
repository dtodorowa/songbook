<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$lib/utils";

  // The header of every page the sidebar links to. The title is the word you clicked
  // in the sidebar, so you always know where you are; the sidebar is the way back, so
  // there is no back link here (detail pages keep BackLink, since "up one level" is
  // something the sidebar can't do).
  type Props = {
    title: string;
    description?: string;
    /** Rich description, for copy with a link in it. Wins over `description`. */
    descriptionSnippet?: Snippet;
    /** Sits on the title's line, e.g. a library's Mine | Public switch. */
    beside?: Snippet;
    /** The page's own buttons, on the right once the header is 48rem wide, under the title below that. */
    actions?: Snippet;
    class?: string;
  };
  let {
    title,
    description = "",
    descriptionSnippet,
    beside,
    actions,
    class: className = "",
  }: Props = $props();
</script>

<!-- Container, not viewport, breakpoints: the sidebar and the player rail flank this
     column, so a desktop window can still leave it too narrow for title and buttons. -->
<header class={cn("@container", className)}>
  <div class="flex flex-col gap-4 @3xl:flex-row @3xl:items-end @3xl:justify-between">
    <div class="min-w-0">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 class="font-serif text-4xl font-bold leading-tight tracking-tight text-ink md:text-5xl">
          {title}
        </h1>
        {@render beside?.()}
      </div>
      {#if descriptionSnippet}
        <p class="mt-2 max-w-3xl text-lg leading-relaxed text-ink-muted">
          {@render descriptionSnippet()}
        </p>
      {:else if description}
        <p class="mt-2 max-w-3xl text-lg leading-relaxed text-ink-muted">{description}</p>
      {/if}
    </div>
    {#if actions}
      <div class="flex shrink-0 flex-wrap items-center gap-2">
        {@render actions()}
      </div>
    {/if}
  </div>
</header>
