<script lang="ts">
  // Owns one YouTube iframe and hands its clock and controls back through bindings,
  // the same shape as tandabase's AnnotatedPlayer so the sync editor ports as is.
  import { onDestroy, onMount } from "svelte";
  import { cn } from "$lib/utils";
  import { loadYouTubeIframeAPI } from "$lib/utils/youtube-iframe";

  type Props = {
    youtubeId: string;
    class?: string;
    currentTime?: number;
    duration?: number;
    playing?: boolean;
    pause?: () => void;
    play?: () => void;
    /** Jump and play from there. */
    seekTo?: (seconds: number) => void;
    /** Jump without changing play/pause, for dragging a scrubber. */
    scrub?: (seconds: number) => void;
    setRate?: (rate: number) => void;
    onPlay?: () => void;
  };

  // The controls are published in onMount: a $bindable fallback only reaches a
  // parent that left the prop undefined, and parents seed them with no-ops.
  /* eslint-disable no-useless-assignment */
  let {
    youtubeId,
    class: className = "",
    currentTime = $bindable(0),
    duration = $bindable(0),
    playing = $bindable(false),
    pause = $bindable(() => {}),
    play = $bindable(() => {}),
    seekTo = $bindable(() => {}),
    scrub = $bindable(() => {}),
    setRate = $bindable(() => {}),
    onPlay,
  }: Props = $props();
  /* eslint-enable no-useless-assignment */

  const mountId = `yt-${Math.floor(Math.random() * 1e9).toString(36)}`;
  let player: YT.Player | null = null;
  let frame: number | null = null;

  function tick() {
    if (player) {
      duration = player.getDuration?.() || duration;
      currentTime = player.getCurrentTime?.() ?? currentTime;
    }
    frame = requestAnimationFrame(tick);
  }

  function startTick() {
    stopTick();
    frame = requestAnimationFrame(tick);
  }

  function stopTick() {
    if (frame != null) cancelAnimationFrame(frame);
    frame = null;
  }

  function handleStateChange(event: YT.OnStateChangeEvent) {
    const states = window.YT?.PlayerState;
    if (!states) return;
    if (event.data === states.PLAYING) {
      playing = true;
      onPlay?.();
      startTick();
    } else if (event.data === states.PAUSED || event.data === states.ENDED) {
      playing = false;
      stopTick();
      currentTime = player?.getCurrentTime?.() ?? currentTime;
    }
  }

  // The iframe API throws if called before the player is ready; a dropped call is fine.
  function safely(action: () => void) {
    try {
      action();
    } catch {
      /* not ready yet */
    }
  }

  onMount(() => {
    pause = () => safely(() => player?.pauseVideo?.());
    play = () => safely(() => player?.playVideo?.());
    seekTo = (seconds) =>
      safely(() => {
        player?.seekTo?.(seconds, true);
        player?.playVideo?.();
        currentTime = seconds;
      });
    scrub = (seconds) =>
      safely(() => {
        player?.seekTo?.(seconds, true);
        currentTime = seconds;
      });
    setRate = (rate) => safely(() => player?.setPlaybackRate?.(rate));

    loadYouTubeIframeAPI().then((api) => {
      if (!document.getElementById(mountId)) return;
      player = new api.Player(mountId, {
        height: "100%",
        width: "100%",
        videoId: youtubeId,
        playerVars: { controls: 1, rel: 0, playsinline: 1, iv_load_policy: 3 },
        events: {
          onReady: () => (duration = player?.getDuration?.() || 0),
          onStateChange: handleStateChange,
        },
      });
    });
  });

  onDestroy(() => {
    stopTick();
    safely(() => player?.destroy?.());
  });
</script>

<div class={cn("aspect-video w-full overflow-hidden bg-black", className)}>
  <div id={mountId} class="h-full w-full"></div>
</div>
