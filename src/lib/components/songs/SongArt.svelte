<script lang="ts">
  import { cn } from "$lib/utils";
  import { youTubeThumbnail } from "$lib/utils/youtube-id";

  type Props = { youtubeId: string; class?: string };
  let { youtubeId, class: className = "" }: Props = $props();
</script>

<img
  src={youTubeThumbnail(youtubeId)}
  alt=""
  loading="lazy"
  class={cn("aspect-video shrink-0 rounded-lg bg-ink/[0.06] object-cover", className)}
/>
