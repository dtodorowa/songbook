<script lang="ts">
  import { Search, X } from "lucide-svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  // Shared search input — the app's one canonical search bar.
  // Left search icon, purple focus border, and a clear button that appears once
  // there's text. Reproduces the discography timeline search that this replaced.
  // Parent controls width/placement via `class`; extra input attrs pass through.
  let {
    value = $bindable(""),
    placeholder = "Search…",
    ariaLabel,
    oninput,
    class: klass = "",
    ...rest
  }: {
    value?: string;
    placeholder?: string;
    ariaLabel?: string;
    oninput?: () => void;
    class?: string;
  } & Omit<HTMLInputAttributes, "value" | "placeholder" | "class" | "oninput"> = $props();

  function clear() {
    value = "";
    oninput?.();
  }
</script>

<div class="relative flex w-full items-center {klass}">
  <Search
    class="pointer-events-none absolute left-3.5 h-4.5 w-4.5 text-ink-faint"
    aria-hidden="true"
  />
  <input
    type="search"
    bind:value
    {placeholder}
    aria-label={ariaLabel ?? placeholder}
    {oninput}
    class="w-full rounded-xl border border-ink/15 bg-card py-2.5 pl-11 pr-9 font-sans text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent-purple/60 [&::-webkit-search-cancel-button]:appearance-none"
    {...rest}
  />
  {#if value}
    <button
      type="button"
      onclick={clear}
      aria-label="Clear search"
      class="absolute right-2 grid h-6 w-6 cursor-pointer place-items-center rounded-full bg-ink/[0.08] text-ink-muted transition-colors hover:bg-ink/[0.16] active:scale-90"
    >
      <X class="h-3.5 w-3.5" />
    </button>
  {/if}
</div>
