<script lang="ts">
  import { ChevronLeft } from "lucide-svelte";
  import { cn } from "$lib/utils";
  import { PRESS } from "$lib/utils/press";

  type Props = { href: string; label: string };
  let { href, label }: Props = $props();
</script>

<a
  {href}
  class={cn(
    "-ml-2 inline-flex max-w-full items-center gap-1 rounded-lg px-2 py-1.5 text-base font-medium text-ink-muted no-underline hover:bg-ink/5 hover:text-ink",
    PRESS
  )}
>
  <ChevronLeft class="h-4.5 w-4.5 shrink-0" />
  <span class="truncate">{label}</span>
</a>
