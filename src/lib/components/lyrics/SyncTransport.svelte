<script lang="ts">
  import { Pause, Play } from "lucide-svelte";
  import { cn } from "$lib/utils";
  import { PRESS } from "$lib/utils/press";
  import { formatSyncTime } from "$lib/utils/lyrics-sync-timeline";

  type Props = {
    currentTime: number;
    duration: number;
    playing: boolean;
    speed: number;
    speeds: number[];
    onTogglePlay: () => void;
    onScrub: (seconds: number) => void;
    onSpeed: (speed: number) => void;
  };

  let { currentTime, duration, playing, speed, speeds, onTogglePlay, onScrub, onSpeed }: Props =
    $props();

  let seekBar = $state<HTMLElement | null>(null);
  let seeking = $state(false);
  let seekRatio = $state(0);
  const displayRatio = $derived.by(() => {
    if (seeking) return seekRatio;
    if (duration <= 0) return 0;
    return Math.min(1, Math.max(0, currentTime / duration));
  });

  function ratioFromX(clientX: number): number {
    if (!seekBar) return 0;
    const rect = seekBar.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  }

  function seekDown(event: PointerEvent) {
    if (duration <= 0) return;
    seeking = true;
    seekRatio = ratioFromX(event.clientX);
    onScrub(seekRatio * duration);
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function seekMove(event: PointerEvent) {
    if (!seeking) return;
    seekRatio = ratioFromX(event.clientX);
    onScrub(seekRatio * duration);
  }

  function seekUp(event: PointerEvent) {
    if (!seeking) return;
    seeking = false;
    onScrub(ratioFromX(event.clientX) * duration);
  }

  // The editor uses ←/→ to move the line cursor, so the slider keeps its arrows to
  // itself while focused.
  function seekKey(event: KeyboardEvent) {
    if (duration <= 0) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    event.stopPropagation();
    const step = event.key === "ArrowLeft" ? -5 : 5;
    onScrub(Math.min(duration, Math.max(0, currentTime + step)));
  }
</script>

<div class="flex flex-wrap items-center gap-x-3 gap-y-2">
  <button
    onclick={onTogglePlay}
    aria-label={playing ? "Pause" : "Play"}
    class={cn(
      "flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-accent-purple text-surface hover:opacity-90",
      PRESS
    )}
  >
    {#if playing}
      <Pause class="size-5" fill="currentColor" />
    {:else}
      <Play class="ml-0.5 size-5" fill="currentColor" />
    {/if}
  </button>

  <div class="flex min-w-0 flex-1 basis-48 items-center gap-2">
    <span class="w-14 shrink-0 text-right font-sans text-sm text-ink-muted tabular-nums">
      {formatSyncTime(currentTime)}
    </span>
    <div
      bind:this={seekBar}
      role="slider"
      tabindex="0"
      aria-label="Position in the recording"
      aria-valuemin="0"
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(currentTime)}
      aria-valuetext={formatSyncTime(currentTime)}
      onpointerdown={seekDown}
      onpointermove={seekMove}
      onpointerup={seekUp}
      onpointercancel={seekUp}
      onkeydown={seekKey}
      class="relative flex h-6 flex-1 cursor-grab touch-none items-center select-none active:cursor-grabbing"
    >
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-ink/15">
        <div
          class="h-full rounded-full bg-accent-purple"
          style="width: {displayRatio * 100}%"
        ></div>
      </div>
      <div
        class={cn(
          "pointer-events-none absolute size-4 -translate-x-1/2 rounded-full bg-accent-purple shadow transition-transform",
          seeking && "scale-125"
        )}
        style="left: {displayRatio * 100}%"
      ></div>
    </div>
    <span class="w-14 shrink-0 font-sans text-sm text-ink-muted tabular-nums">
      {formatSyncTime(duration)}
    </span>
  </div>

  <div
    role="group"
    aria-label="Playback speed"
    class="flex shrink-0 rounded-lg bg-ink/[0.06] p-0.5"
  >
    {#each speeds as option (option)}
      <button
        onclick={() => onSpeed(option)}
        aria-pressed={speed === option}
        class={cn(
          "cursor-pointer rounded-lg border-none px-2.5 py-1.5 font-sans text-sm font-medium tabular-nums",
          PRESS,
          speed === option
            ? "bg-accent-purple text-surface"
            : "bg-transparent text-ink-muted hover:text-ink"
        )}
      >
        {option}×
      </button>
    {/each}
  </div>
</div>
