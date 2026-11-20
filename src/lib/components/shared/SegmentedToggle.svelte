<script lang="ts" generics="T extends string">
  import { cn } from "$lib/utils";
  import { PRESS } from "$lib/utils/press";

  type Option = { value: T; label: string };
  type Props = { options: Option[]; value: T; label: string; onchange: (value: T) => void };
  let { options, value, label, onchange }: Props = $props();
</script>

<div role="group" aria-label={label} class="flex shrink-0 rounded-lg bg-ink/[0.06] p-0.5">
  {#each options as option (option.value)}
    <button
      onclick={() => onchange(option.value)}
      aria-pressed={value === option.value}
      class={cn(
        "cursor-pointer rounded-lg border-none px-3 py-1.5 font-sans text-sm font-medium",
        PRESS,
        value === option.value
          ? "bg-accent-purple text-surface"
          : "bg-transparent text-ink-muted hover:text-ink"
      )}
    >
      {option.label}
    </button>
  {/each}
</div>
