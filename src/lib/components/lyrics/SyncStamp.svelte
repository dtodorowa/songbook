<script lang="ts">
  import { Minus, Play, Plus, X } from "lucide-svelte";
  import { cn } from "$lib/utils";
  import { PRESS } from "$lib/utils/press";
  import { formatSyncTime } from "$lib/utils/lyrics-sync-timeline";

  type Props = {
    t: number;
    stale?: boolean;
    onNudge: (delta: number) => void;
    onPlay: () => void;
    onRemove: () => void;
  };

  let { t, stale = false, onNudge, onPlay, onRemove }: Props = $props();

  const NUDGE = 0.1;
  const iconButton = cn(
    "flex size-8 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-ink-muted hover:bg-ink/10 hover:text-ink",
    PRESS
  );
</script>

<div class={cn("flex shrink-0 items-center gap-0.5", stale && "opacity-50")}>
  <button onclick={() => onNudge(-NUDGE)} aria-label="Earlier by 0.1 seconds" class={iconButton}>
    <Minus class="size-4" />
  </button>
  <button
    onclick={onPlay}
    aria-label="Play from {formatSyncTime(t)}"
    class={cn(
      "flex h-8 cursor-pointer items-center gap-1 rounded-lg border-none bg-ink/[0.06] px-2 font-sans text-sm text-ink tabular-nums hover:bg-ink/10",
      PRESS
    )}
  >
    <Play class="size-3.5 text-ink-muted" fill="currentColor" />
    {formatSyncTime(t)}
  </button>
  <button onclick={() => onNudge(NUDGE)} aria-label="Later by 0.1 seconds" class={iconButton}>
    <Plus class="size-4" />
  </button>
  <button
    onclick={onRemove}
    aria-label="Delete this stamp"
    class={cn(iconButton, "hover:text-red-500")}
  >
    <X class="size-4" />
  </button>
</div>
