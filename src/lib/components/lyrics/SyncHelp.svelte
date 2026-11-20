<script lang="ts">
  import { CircleHelp } from "lucide-svelte";
  import * as Popover from "$lib/components/ui/popover";
  import { cn } from "$lib/utils";
  import { PRESS } from "$lib/utils/press";

  const KEYS = [
    { key: "Enter", action: "Tap the aimed line" },
    { key: "↓", action: "Skip a line this recording leaves out" },
    { key: "↑", action: "Aim back a line" },
    { key: "S", action: "Mark an instrumental gap" },
    { key: "⌫", action: "Undo the last stamp" },
  ];
</script>

<Popover.Root>
  <Popover.Trigger
    class={cn(
      "flex h-11 cursor-pointer items-center gap-1.5 rounded-lg border-none bg-transparent px-2.5 font-sans text-base text-ink-muted hover:bg-ink/[0.06] hover:text-ink",
      PRESS
    )}
  >
    <CircleHelp class="size-4" />
    How to sync
  </Popover.Trigger>
  <Popover.Content
    align="end"
    animateScale={false}
    class="flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3 rounded-2xl bg-card font-sans text-base text-ink"
  >
    <ol class="m-0 flex list-decimal flex-col gap-1.5 pl-5">
      <li>Press play and listen.</li>
      <li>Press Enter the moment the singer starts the aimed line.</li>
      <li>Fix any stamp with − and +, then save.</li>
    </ol>
    <dl class="m-0 grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 text-sm">
      {#each KEYS as { key, action } (key)}
        <dt>
          <kbd class="rounded-lg bg-ink/[0.08] px-1.5 py-0.5 font-sans text-sm text-ink">{key}</kbd>
        </dt>
        <dd class="m-0 text-ink-muted">{action}</dd>
      {/each}
    </dl>
    <p class="m-0 text-sm text-ink-muted">
      Click a line to aim at it again when the singer repeats it. If the video is showing, click
      outside it before tapping so the keys reach the editor.
    </p>
  </Popover.Content>
</Popover.Root>
