<script lang="ts">
  // Fullscreen karaoke, ported from tandabase. A teleprompter: the line being sung
  // and the next one, both one size, so nothing reflows. A pure view over the
  // sing-along state; the page owns the player and forwards play/pause.
  import { onMount, untrack } from "svelte";
  import { fly } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { cubicOut } from "svelte/easing";
  import { Pause, Play, X } from "lucide-svelte";
  import { cn } from "$lib/utils";
  import type { SingAlong } from "$lib/stores/singAlong.svelte";

  type Props = {
    singAlong: SingAlong;
    playing: boolean;
    title: string;
    subtitle: string;
    onExit: () => void;
    onSelectLine: (lineIndex: number) => void;
    onTogglePlay: () => void;
  };
  let { singAlong, playing, title, subtitle, onExit, onSelectLine, onTogglePlay }: Props = $props();

  const AHEAD = 1;

  // Lines this recording actually sings, in order (all of them without a sync).
  const sungOrder = $derived(
    singAlong.lines
      .map((_, index) => index)
      .filter((index) => !singAlong.isSynced || singAlong.stampedLines.has(index))
  );
  const windowLines = $derived.by(() => {
    if (!sungOrder.length) return [];
    const active = singAlong.activeLine;
    const position = active == null ? 0 : Math.max(0, sungOrder.indexOf(active));
    return sungOrder.slice(position, position + AHEAD + 1);
  });

  // One continuous CSS transition to 100% over the time left, restarted only when the
  // target line or play/pause changes. Stepping the width every frame reads as laggy.
  let bar = $state<HTMLElement | null>(null);
  const countdownTarget = $derived(singAlong.countdown?.toLine ?? null);
  $effect(() => {
    const target = countdownTarget;
    const isPlaying = playing;
    const element = bar;
    const countdown = untrack(() => singAlong.countdown);
    if (!element || target == null || !countdown) return;
    element.style.transition = "none";
    element.style.width = `${Math.min(100, Math.max(0, countdown.progress * 100))}%`;
    void element.offsetWidth;
    if (isPlaying && countdown.secsLeft > 0.05) {
      element.style.transition = `width ${countdown.secsLeft}s linear`;
      element.style.width = "100%";
    }
  });

  let controlsVisible = $state(true);
  let hideTimer: ReturnType<typeof setTimeout> | undefined;
  function bumpControls() {
    controlsVisible = true;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => (controlsVisible = false), 2600);
  }

  function exit() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    onExit();
  }

  onMount(() => {
    bumpControls();
    document.body.style.overflow = "hidden";
    document.documentElement.requestFullscreen?.().catch(() => {});
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) onExit();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        exit();
      } else if (event.key === " " || event.key.toLowerCase() === "k") {
        event.preventDefault();
        onTogglePlay();
        bumpControls();
      } else if (!singAlong.isSynced && (event.key === "ArrowDown" || event.key === "ArrowRight")) {
        event.preventDefault();
        singAlong.step(1);
      } else if (!singAlong.isSynced && (event.key === "ArrowUp" || event.key === "ArrowLeft")) {
        event.preventDefault();
        singAlong.step(-1);
      }
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("keydown", onKey);
      clearTimeout(hideTimer);
      document.body.style.overflow = "";
    };
  });

  const ROUND_BUTTON =
    "flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-none bg-white/10 text-white transition hover:bg-white/20 active:scale-90";
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="fixed inset-0 z-[100] overflow-hidden select-none"
  onpointermove={bumpControls}
  onpointerdown={bumpControls}
>
  <!-- Two slow, counter-spinning conic gradients, heavily blurred, over near-black.
       Arbitrary gradients have no utility, hence the inline styles. -->
  <div class="absolute inset-0 bg-[#08070d]"></div>
  <div
    class="absolute -inset-[30%] animate-[spin_26s_linear_infinite] opacity-50 blur-[120px]"
    style="background: conic-gradient(from 0deg, #7c3aed, #db2777, #2563eb, #7c3aed);"
  ></div>
  <div
    class="absolute -inset-[25%] animate-[spin_40s_linear_infinite_reverse] opacity-30 blur-[130px]"
    style="background: conic-gradient(from 120deg, #22d3ee, #a855f7, #f472b6, #22d3ee);"
  ></div>
  <div class="absolute inset-0 bg-black/40"></div>

  <div
    class={cn(
      "absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 px-6 pt-6 transition-opacity duration-300 md:px-10",
      controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
    )}
  >
    <div class="min-w-0">
      <p class="m-0 truncate font-serif text-xl text-white md:text-2xl">{title}</p>
      {#if subtitle}<p class="m-0 truncate text-sm text-white/55">{subtitle}</p>{/if}
    </div>
    <button
      onclick={exit}
      title="Exit karaoke (Esc)"
      aria-label="Exit karaoke"
      class={ROUND_BUTTON}
    >
      <X class="h-5 w-5" />
    </button>
  </div>

  {#if singAlong.countdown}
    {@const countdown = singAlong.countdown}
    <!-- No line lit: the intro or a gap fills a bar toward the next line. The outro
         has no target, so it is just the equalizer until the track ends. -->
    <div
      class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-8 px-6 md:gap-10 md:px-16"
    >
      <div class="flex h-7 items-end gap-1.5">
        {#each [55, 90, 70, 100, 65, 85] as height, barIndex (barIndex)}
          <span
            class="w-1.5 animate-pulse rounded-full bg-white/70"
            style="height: {height}%; animation-delay: {barIndex * 0.12}s"
          ></span>
        {/each}
      </div>
      {#if countdown.toLine != null}
        <div class="h-2 w-56 overflow-hidden rounded-full bg-white/15 md:w-80">
          <div
            bind:this={bar}
            class="h-full w-0 rounded-full bg-gradient-to-r from-fuchsia-400 to-violet-400 shadow-[0_0_20px_rgba(192,132,252,0.7)]"
          ></div>
        </div>
        <p
          class="m-0 max-w-5xl text-center font-serif text-4xl leading-tight text-white transition-opacity duration-150 md:text-6xl"
          style="opacity: {0.3 + countdown.progress * 0.6}"
        >
          {singAlong.lines[countdown.toLine]}
        </p>
      {/if}
    </div>
  {:else}
    <div
      class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 px-6 md:gap-8 md:px-16"
    >
      {#each windowLines as lineIndex, position (lineIndex)}
        <button
          type="button"
          onclick={() => {
            onSelectLine(lineIndex);
            bumpControls();
          }}
          animate:flip={{ duration: 450, easing: cubicOut }}
          in:fly={{ y: 48, duration: 450, easing: cubicOut }}
          class={cn(
            "w-full max-w-5xl cursor-pointer border-none bg-transparent px-2 text-center font-serif text-5xl leading-tight transition-[color,opacity] duration-500 ease-out active:opacity-70 md:text-7xl",
            position === 0
              ? "font-bold text-white [text-shadow:0_0_50px_rgba(192,132,252,0.8)]"
              : "text-white/30"
          )}
        >
          {singAlong.lines[lineIndex]}
        </button>
      {/each}
    </div>
  {/if}

  <div
    class={cn(
      "absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-3 pb-8 transition-opacity duration-300",
      controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
    )}
  >
    <button
      onclick={() => {
        onTogglePlay();
        bumpControls();
      }}
      aria-label={playing ? "Pause" : "Play"}
      class="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-none bg-white text-neutral-900 shadow-[0_8px_40px_rgba(192,132,252,0.5)] transition hover:scale-105 active:scale-95"
    >
      {#if playing}
        <Pause class="h-7 w-7" fill="currentColor" />
      {:else}
        <Play class="ml-0.5 h-7 w-7" fill="currentColor" />
      {/if}
    </button>
    {#if !singAlong.isSynced}
      <p class="m-0 text-sm text-white/50">Not synced. Use the arrow keys or tap a line.</p>
    {/if}
  </div>
</div>
