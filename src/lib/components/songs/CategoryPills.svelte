<script lang="ts">
  import { categoryHref } from "$lib/components/shared/nav-links";
  import { cn } from "$lib/utils";
  import { FILTER_PILL, FILTER_PILL_OFF, FILTER_PILL_ON } from "$lib/utils/filter-pill";
  import { PRESS } from "$lib/utils/press";
  import type { CategoryCount } from "$lib/utils/song-library";

  type Props = { categories: CategoryCount[]; active: string | null };
  let { categories, active }: Props = $props();
</script>

<div class="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
  <a
    href="/"
    aria-current={active === null ? "page" : undefined}
    class={cn(
      FILTER_PILL,
      PRESS,
      "no-underline",
      active === null ? FILTER_PILL_ON : FILTER_PILL_OFF
    )}
  >
    All
  </a>
  {#each categories as category (category.name)}
    {@const on = active === category.name}
    <a
      href={categoryHref(category.name)}
      aria-current={on ? "page" : undefined}
      class={cn(FILTER_PILL, PRESS, "no-underline", on ? FILTER_PILL_ON : FILTER_PILL_OFF)}
    >
      {category.name}
      <span class="tabular-nums opacity-60">{category.count}</span>
    </a>
  {/each}
</div>
