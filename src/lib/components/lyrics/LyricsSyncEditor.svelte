<script lang="ts">
  // Karaoke sync capture, ported from tandabase. Play the video and tap down the
  // lyrics: each tap stamps the current time onto the aimed line.
  import {
    AudioLines,
    Check,
    Eye,
    EyeOff,
    Loader2,
    Minus,
    Plus,
    SkipForward,
    Trash2,
    Undo2,
  } from "lucide-svelte";
  import YouTubePlayer from "$lib/components/player/YouTubePlayer.svelte";
  import { Button } from "$lib/components/ui/button";
  import { createLyricsSyncCapture } from "$lib/stores/lyricsSyncCapture.svelte";
  import type { SyncEvent } from "$lib/data/lyrics-sync";
  import { formatOffset } from "$lib/utils/lyrics-sync-timeline";
  import { cn } from "$lib/utils";
  import { PRESS } from "$lib/utils/press";
  import { ROW_HOVER, ROW_SELECTED, rowStripe } from "$lib/utils/row-stripe";
  import SyncTransport from "./SyncTransport.svelte";
  import SyncStamp from "./SyncStamp.svelte";
  import SyncHelp from "./SyncHelp.svelte";

  type Props = {
    videoId: string;
    lines: string[];
    initialEvents?: SyncEvent[];
    hasExisting?: boolean;
    onSave: (events: SyncEvent[]) => Promise<void>;
    onDelete: () => Promise<void>;
    onCancel: () => void;
  };

  let {
    videoId,
    lines,
    initialEvents = [],
    hasExisting = false,
    onSave,
    onDelete,
    onCancel,
  }: Props = $props();

  // AnnotatedPlayer owns the YouTube instance and hands these back.
  let currentTime = $state(0);
  let duration = $state(0);
  let playing = $state(false);
  let pause = $state<() => void>(() => {});
  let play = $state<() => void>(() => {});
  let seekTo = $state<(seconds: number) => void>(() => {});
  let scrub = $state<(seconds: number) => void>(() => {});
  let setRate = $state<(rate: number) => void>(() => {});

  const SPEEDS = [0.5, 0.75, 1];
  let speed = $state(1);
  function applySpeed(next: number) {
    speed = next;
    setRate(next);
  }

  // Tapping is by ear, so the video stays hidden unless asked for. It is parked
  // offscreen rather than unmounted so the audio keeps playing.
  let showVideo = $state(false);
  let saving = $state(false);
  let deleting = $state(false);
  let error = $state("");

  // svelte-ignore state_referenced_locally
  const capture = createLyricsSyncCapture({
    lines: () => lines,
    initialEvents,
    currentTime: () => currentTime,
  });

  const busy = $derived(saving || deleting);

  function scrollAimedLineIntoView() {
    requestAnimationFrame(() => {
      document
        .querySelector(`[data-cursor-line="${capture.cursor}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function tapLine() {
    capture.tapLine();
    scrollAimedLineIntoView();
  }

  function skip() {
    capture.skip();
    scrollAimedLineIntoView();
  }

  function back() {
    capture.back();
    scrollAimedLineIntoView();
  }

  function cancel() {
    if (capture.dirty && !confirm("Discard the stamps from this take?")) return;
    onCancel();
  }

  async function save() {
    saving = true;
    error = "";
    try {
      await onSave(capture.finalEvents());
    } catch (caught) {
      error = caught instanceof Error ? caught.message : "Couldn't save the sync. Try again.";
    } finally {
      saving = false;
    }
  }

  async function removeSync() {
    if (busy) return;
    if (!confirm("Delete this sync? The lyrics will stop following along.")) return;
    deleting = true;
    error = "";
    try {
      await onDelete();
    } catch (caught) {
      error = caught instanceof Error ? caught.message : "Couldn't delete the sync. Try again.";
    } finally {
      deleting = false;
    }
  }

  function onKey(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    if (target && (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable))
      return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === "Enter") {
      event.preventDefault();
      tapLine();
    } else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      skip();
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      back();
    } else if (event.key.toLowerCase() === "s") {
      event.preventDefault();
      capture.markSilence();
    } else if (event.key === "Backspace") {
      event.preventDefault();
      capture.undo();
    }
  }

  function warnBeforeLeaving(event: BeforeUnloadEvent) {
    if (capture.dirty && !saving) event.preventDefault();
  }

  const secondaryAction = cn(
    "flex h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-ink/15 bg-transparent px-3 font-sans text-base text-ink hover:bg-ink/[0.04] disabled:cursor-default disabled:opacity-40",
    PRESS
  );
  const keyHint = "rounded-lg bg-ink/[0.08] px-1.5 font-sans text-sm text-ink-muted";
</script>

<svelte:window onkeydown={onKey} onbeforeunload={warnBeforeLeaving} />

<div class="flex w-full flex-col text-left">
  <!-- One clock and the tap controls stay pinned while the lyrics scroll under them. -->
  <div class="sticky top-0 z-20 -mx-3 flex flex-col gap-3 border-b border-ink/10 bg-card px-3 py-3">
    <SyncTransport
      {currentTime}
      {duration}
      {playing}
      {speed}
      speeds={SPEEDS}
      onTogglePlay={() => (playing ? pause() : play())}
      onScrub={scrub}
      onSpeed={applySpeed}
    />

    <div class="flex flex-wrap items-center gap-2">
      <Button
        onclick={tapLine}
        disabled={capture.cursor >= lines.length}
        class="h-11 gap-2 px-5 text-base"
      >
        <Check class="size-4" />
        Tap line
        <kbd class="rounded-lg bg-surface/20 px-1.5 font-sans text-sm">Enter</kbd>
      </Button>
      <button onclick={skip} class={secondaryAction}>
        <SkipForward class="size-4" /> Skip <kbd class={keyHint}>↓</kbd>
      </button>
      <button onclick={capture.markSilence} class={secondaryAction}>
        <AudioLines class="size-4" /> Gap <kbd class={keyHint}>S</kbd>
      </button>
      <button onclick={capture.undo} disabled={!capture.events.length} class={secondaryAction}>
        <Undo2 class="size-4" /> Undo <kbd class={keyHint}>⌫</kbd>
      </button>

      <div class="ml-auto flex items-center gap-1">
        <span class="px-2 font-sans text-sm text-ink-muted tabular-nums" aria-live="polite">
          {capture.tappedCount} of {lines.length} tapped
        </span>
        <button
          onclick={() => (showVideo = !showVideo)}
          aria-pressed={showVideo}
          aria-label={showVideo ? "Hide video" : "Show video"}
          class={cn(
            "flex size-11 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-ink-muted hover:bg-ink/[0.06] hover:text-ink",
            PRESS
          )}
        >
          {#if showVideo}<EyeOff class="size-5" />{:else}<Eye class="size-5" />{/if}
        </button>
        <SyncHelp />
      </div>
    </div>
  </div>

  <div
    class={showVideo
      ? "mt-4 overflow-hidden rounded-2xl"
      : "pointer-events-none fixed top-0 -left-[9999px] aspect-video w-80 opacity-0"}
  >
    <YouTubePlayer
      youtubeId={videoId}
      bind:currentTime
      bind:duration
      bind:playing
      bind:pause
      bind:play
      bind:seekTo
      bind:scrub
      bind:setRate
    />
  </div>

  <p class="mt-4 mb-2 font-sans text-base text-ink-muted">
    Press Enter the moment each line starts. Tap a line to aim at it again.
  </p>

  <ol class="-mx-3 m-0 list-none p-0">
    {#each capture.timeline as row, index (row.kind === "line" ? `line-${row.lineIndex}` : `gap-${row.stamp.eventIndex}`)}
      {#if row.kind === "line"}
        {@const aimed = row.lineIndex === capture.cursor}
        <li
          data-cursor-line={row.lineIndex}
          class={cn("flex items-center gap-2 px-3 py-1", aimed ? ROW_SELECTED : rowStripe(index))}
        >
          <button
            onclick={() => capture.aimAt(row.lineIndex)}
            aria-current={aimed ? "step" : undefined}
            class={cn(
              "min-w-0 flex-1 cursor-pointer border-none bg-transparent py-1.5 text-left font-sans text-base leading-snug",
              ROW_HOVER,
              aimed ? "font-semibold text-ink" : "font-medium",
              !aimed && (row.stamps.length ? "text-ink" : "text-ink-muted")
            )}
          >
            {row.text}
          </button>
          <div class="flex flex-col items-end gap-1">
            {#each row.stamps as stamp (stamp.eventIndex)}
              <SyncStamp
                t={stamp.t}
                stale={capture.isStale(row.lineIndex)}
                onNudge={(delta) => capture.nudge(stamp.eventIndex, delta)}
                onPlay={() => seekTo(stamp.t)}
                onRemove={() => capture.remove(stamp.eventIndex)}
              />
            {/each}
          </div>
        </li>
      {:else}
        <li class={cn("flex items-center gap-2 px-3 py-1", rowStripe(index))}>
          <span
            class="flex min-w-0 flex-1 items-center gap-2 py-1.5 font-sans text-base text-ink-muted"
          >
            <AudioLines class="size-4 shrink-0" />
            Instrumental
          </span>
          <SyncStamp
            t={row.stamp.t}
            onNudge={(delta) => capture.nudge(row.stamp.eventIndex, delta)}
            onPlay={() => seekTo(row.stamp.t)}
            onRemove={() => capture.remove(row.stamp.eventIndex)}
          />
        </li>
      {/if}
    {/each}
  </ol>

  {#if hasExisting}
    <div class="mt-10">
      <button
        onclick={removeSync}
        disabled={busy}
        class={cn(
          "flex h-11 cursor-pointer items-center gap-1.5 rounded-lg border-none bg-transparent px-3 font-sans text-base text-red-500 hover:bg-red-500/10 disabled:opacity-40",
          PRESS
        )}
      >
        {#if deleting}<Loader2 class="size-4 animate-spin" />{:else}<Trash2 class="size-4" />{/if}
        Delete this sync
      </button>
    </div>
  {/if}

  <!-- The offset applies live to every stamp above, so the shift is seen before it
       is saved. Pinned with Save so the commit point never scrolls away. -->
  <div
    class="sticky bottom-0 z-20 -mx-3 mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-ink/10 bg-card px-3 py-3"
  >
    <div class="flex items-center gap-2 font-sans text-sm text-ink-muted">
      Shift all
      <div class="flex items-center rounded-lg border border-ink/15">
        <button
          onclick={() => capture.shiftAll(-0.1)}
          aria-label="Shift every stamp 0.1 seconds earlier"
          class={cn(
            "flex size-9 cursor-pointer items-center justify-center border-none bg-transparent text-ink-muted hover:text-ink",
            PRESS
          )}
        >
          <Minus class="size-4" />
        </button>
        <span class="min-w-14 text-center text-ink tabular-nums">
          {formatOffset(capture.offset)}
        </span>
        <button
          onclick={() => capture.shiftAll(0.1)}
          aria-label="Shift every stamp 0.1 seconds later"
          class={cn(
            "flex size-9 cursor-pointer items-center justify-center border-none bg-transparent text-ink-muted hover:text-ink",
            PRESS
          )}
        >
          <Plus class="size-4" />
        </button>
      </div>
      <button
        onclick={capture.toggleTappedLate}
        aria-pressed={capture.tappedLate}
        class={cn(
          "flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3 font-sans text-sm",
          PRESS,
          capture.tappedLate
            ? "border-accent-purple/40 bg-accent-purple/10 font-semibold text-ink"
            : "border-ink/15 bg-transparent text-ink-muted hover:text-ink"
        )}
      >
        {#if capture.tappedLate}<Check class="size-4" />{/if}
        I tapped late
      </button>
    </div>

    <div class="ml-auto flex items-center gap-2">
      {#if error}
        <p class="m-0 font-sans text-sm text-red-500" role="alert">{error}</p>
      {/if}
      <Button variant="ghost" onclick={cancel} disabled={busy} class="h-11 text-base">
        Cancel
      </Button>
      <Button
        onclick={save}
        disabled={busy || !capture.hasLineStamps}
        loading={saving}
        class="h-11 text-base"
      >
        Save sync
      </Button>
    </div>
  </div>
</div>
