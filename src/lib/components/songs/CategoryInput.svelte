<script lang="ts">
  import { X } from "lucide-svelte";
  import { cn } from "$lib/utils";
  import { INPUT } from "$lib/utils/form-field";
  import { PRESS } from "$lib/utils/press";
  import { normalizeCategory } from "$lib/utils/song-library";

  type Props = { id: string; categories: string[]; existing: string[] };
  let { id, categories = $bindable(), existing }: Props = $props();

  let typed = $state("");

  const suggestions = $derived(existing.filter((name) => !categories.includes(name)));

  function add(raw: string) {
    const name = normalizeCategory(raw, existing);
    typed = "";
    if (!name || categories.includes(name)) return;
    categories = [...categories, name];
  }

  function remove(name: string) {
    categories = categories.filter((category) => category !== name);
  }

  function onKey(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add(typed);
    } else if (event.key === "Backspace" && !typed && categories.length) {
      remove(categories[categories.length - 1]);
    }
  }
</script>

<div class="flex flex-col gap-2">
  {#if categories.length}
    <div class="flex flex-wrap gap-1.5">
      {#each categories as category (category)}
        <span
          class="inline-flex items-center gap-1 rounded-full border border-accent-purple bg-accent-purple/10 py-1 pr-1 pl-3 text-sm font-medium text-accent-purple"
        >
          {category}
          <button
            type="button"
            onclick={() => remove(category)}
            aria-label="Remove {category}"
            class={cn(
              "grid h-6 w-6 cursor-pointer place-items-center rounded-full border-none bg-transparent text-current hover:bg-accent-purple/15",
              PRESS
            )}
          >
            <X class="h-3.5 w-3.5" />
          </button>
        </span>
      {/each}
    </div>
  {/if}
  <input
    {id}
    bind:value={typed}
    onkeydown={onKey}
    onblur={() => add(typed)}
    list="{id}-suggestions"
    placeholder="Type a category and press Enter"
    autocomplete="off"
    class={INPUT}
  />
  <datalist id="{id}-suggestions">
    {#each suggestions as name (name)}
      <option value={name}></option>
    {/each}
  </datalist>
</div>
