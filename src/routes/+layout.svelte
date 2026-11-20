<script lang="ts">
  import "../app.css";
  import "@fontsource-variable/geist/wght.css";
  import "@fontsource-variable/plus-jakarta-sans/wght.css";
  import { onMount, type Snippet } from "svelte";
  import Sidebar from "$lib/components/shared/Sidebar.svelte";
  import MobileNav from "$lib/components/shared/MobileNav.svelte";
  import PageColumnSheet from "$lib/components/shared/PageColumnSheet.svelte";
  import { themeState } from "$lib/stores/theme.svelte";
  import { categoryCounts } from "$lib/utils/song-library";
  import type { LayoutData } from "./$types";

  type Props = { data: LayoutData; children: Snippet };
  let { data, children }: Props = $props();

  const categories = $derived(categoryCounts(data.songs));

  onMount(() => themeState.init());

  // iOS Safari only applies :active once something listens for touchstart, so the
  // press states would silently do nothing on iPhone without this empty listener.
  onMount(() => {
    const noop = () => {};
    document.addEventListener("touchstart", noop, { passive: true });
    return () => document.removeEventListener("touchstart", noop);
  });
</script>

<PageColumnSheet />
<Sidebar {categories} />
<MobileNav />
{@render children()}
