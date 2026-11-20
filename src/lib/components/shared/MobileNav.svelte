<script lang="ts">
  import { page } from "$app/state";
  import { Moon, Sun } from "lucide-svelte";
  import { themeState } from "$lib/stores/theme.svelte";
  import { cn } from "$lib/utils";
  import { NAV_LINKS } from "./nav-items";
  import { isTabActive } from "./nav-links";

  const TAB =
    "flex h-(--mobile-tabbar-h) flex-col items-center justify-center gap-1 no-underline transition-transform duration-100 active:scale-95";
</script>

<!-- data-tabbar is what app.css keys the page's bottom room on. -->
<nav
  data-tabbar
  aria-label="Main"
  class="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] md:hidden print:hidden"
>
  {#each NAV_LINKS as link (link.href)}
    {@const active = isTabActive(link.href, page.url)}
    <a
      href={link.href}
      aria-current={active ? "page" : undefined}
      class={cn(TAB, active ? "font-bold text-ink" : "text-ink-faint")}
    >
      <link.icon class={cn("h-6 w-6", active && "text-brand")} />
      <span class="text-sm leading-none">{link.shortLabel}</span>
    </a>
  {/each}
  <button
    onclick={() => themeState.toggle()}
    aria-label={themeState.current === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    class={cn(TAB, "cursor-pointer border-none bg-transparent text-ink-faint")}
  >
    {#if themeState.current === "dark"}<Sun class="h-6 w-6" />{:else}<Moon class="h-6 w-6" />{/if}
    <span class="text-sm leading-none">Theme</span>
  </button>
</nav>
