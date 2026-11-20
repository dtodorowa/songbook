<script lang="ts" module>
  // The --sidebar-w rules in app.css repeat both values; they must agree.
  export const EXPANDED_WIDTH = "16rem";
  export const COLLAPSED_WIDTH = "5.5rem";
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { Moon, PanelLeftClose, PanelLeftOpen, Sun, Tag } from "lucide-svelte";
  import { themeState } from "$lib/stores/theme.svelte";
  import type { CategoryCount } from "$lib/utils/song-library";
  import { cn } from "$lib/utils";
  import { NAV_LINKS, type NavLink } from "./nav-items";
  import { categoryHref, isCategoryActive, isNavLinkActive } from "./nav-links";

  type Props = { categories: CategoryCount[] };
  let { categories }: Props = $props();

  // Mirrored in app.html's inline script and the --sidebar-w rules in app.css.
  const COLLAPSE_KEY = "sidebar-collapsed";
  const COLLAPSED_CLASS = "sidebar-collapsed";

  let collapsed = $state(false);

  // Expanded, the wordmark is the way home, so the Songs row would be the same link twice.
  const links = $derived(collapsed ? NAV_LINKS : NAV_LINKS.filter((link) => link.href !== "/"));

  onMount(() => {
    collapsed = document.documentElement.classList.contains(COLLAPSED_CLASS);
  });

  function toggleCollapse() {
    collapsed = !collapsed;
    document.documentElement.classList.toggle(COLLAPSED_CLASS, collapsed);
    localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
  }

  const ROW =
    "group flex items-center gap-3 rounded-lg no-underline transition-colors active:scale-95";
  const ROW_ACTIVE = "bg-black/[0.06] font-bold text-accent-purple dark:bg-white/10";
  const ROW_IDLE =
    "font-medium text-ink-muted hover:bg-black/5 hover:text-ink dark:hover:bg-white/5";
</script>

{#snippet collapseToggle()}
  <button
    onclick={toggleCollapse}
    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    class={cn(
      "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-ink-faint transition-[opacity,color,background-color] hover:bg-black/5 hover:text-ink active:scale-95 dark:hover:bg-white/5",
      collapsed
        ? "opacity-100"
        : "opacity-0 group-hover/sidebar:opacity-100 focus-visible:opacity-100"
    )}
  >
    {#if collapsed}
      <PanelLeftOpen class="h-4.5 w-4.5" />
    {:else}
      <PanelLeftClose class="h-4.5 w-4.5" />
    {/if}
  </button>
{/snippet}

{#snippet navRow(link: NavLink)}
  {@const active = isNavLinkActive(link.href, page.url)}
  <a
    href={link.href}
    title={collapsed ? link.label : undefined}
    aria-current={active ? "page" : undefined}
    class={cn(
      ROW,
      collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2",
      active ? ROW_ACTIVE : ROW_IDLE
    )}
  >
    <link.icon class="h-4.5 w-4.5 shrink-0 text-brand" />
    {#if !collapsed}<span class="text-base">{link.label}</span>{/if}
  </a>
{/snippet}

<aside
  data-sidebar
  style="width: calc(var(--sidebar-w) - 2 * var(--shell-gap, 0px))"
  class="group/sidebar fixed top-(--island-top) bottom-(--island-bottom) left-(--shell-gap) z-40 hidden flex-col rounded-2xl bg-card pt-5 pb-3 md:flex print:hidden"
>
  {#if collapsed}
    <div class="mb-6 flex flex-col items-center px-3">{@render collapseToggle()}</div>
  {:else}
    <div class="mb-6 flex items-center justify-between px-3">
      <a href="/" class="pl-1 font-serif text-2xl tracking-tight text-ink no-underline">songbook</a>
      {@render collapseToggle()}
    </div>
  {/if}

  <nav class="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-2 pb-2">
    <div class="flex flex-col gap-0.5">
      {#each links as link (link.href)}
        {@render navRow(link)}
      {/each}
    </div>

    {#if categories.length && !collapsed}
      <div class="flex flex-col gap-0.5">
        <p class="px-3 pb-1 text-sm font-bold text-ink-faint">Categories</p>
        {#each categories as category (category.name)}
          {@const active = isCategoryActive(category.name, page.url)}
          <a
            href={categoryHref(category.name)}
            aria-current={active ? "page" : undefined}
            class={cn(ROW, "px-3 py-2", active ? ROW_ACTIVE : ROW_IDLE)}
          >
            <Tag class="h-4.5 w-4.5 shrink-0 text-brand" />
            <span class="min-w-0 flex-1 truncate text-base">{category.name}</span>
            <span class="text-sm text-ink-faint tabular-nums">{category.count}</span>
          </a>
        {/each}
      </div>
    {/if}
  </nav>

  <div
    class={cn(
      "flex shrink-0 gap-1 border-t border-border px-2 pt-3",
      collapsed ? "flex-col items-center" : "items-center justify-end"
    )}
  >
    <button
      onclick={() => themeState.toggle()}
      title={themeState.current === "dark" ? "Light mode" : "Dark mode"}
      aria-label={themeState.current === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      class="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg border-none bg-transparent text-ink-faint transition-colors hover:bg-black/5 hover:text-ink active:scale-95 dark:hover:bg-white/5"
    >
      {#if themeState.current === "dark"}
        <Sun class="h-4.5 w-4.5" />
      {:else}
        <Moon class="h-4.5 w-4.5" />
      {/if}
    </button>
  </div>
</aside>
